from __future__ import annotations

import time
from datetime import date, datetime, timedelta
from typing import Any, Callable, TypeVar
from zoneinfo import ZoneInfo

import pandas as pd
import yfinance as yf
from yfinance import exceptions as yf_exceptions

from capital_lens_ingest.infrastructure.rate_control import (
    RequestThrottler,
    RetryPolicy,
    read_env_float,
    read_env_int,
)

_T = TypeVar("_T")


def to_tse_ticker(symbol_code: str) -> str:
    return f"{symbol_code}.T"


def _to_jst_dates(index: pd.Index) -> list[date]:
    dt_index = pd.DatetimeIndex(index)
    if dt_index.tz is None:
        dt_index = dt_index.tz_localize("Asia/Tokyo")
    else:
        dt_index = dt_index.tz_convert("Asia/Tokyo")
    return [timestamp.date() for timestamp in dt_index]


def normalize_history_frame(
    symbol_code: str,
    history: pd.DataFrame,
) -> list[dict[str, Any]]:
    if history.empty:
        return []

    dates = _to_jst_dates(history.index)
    rows: list[dict[str, Any]] = []
    for row_date, (_, row) in zip(dates, history.iterrows()):
        if pd.isna(row.get("Open")) or pd.isna(row.get("Close")):
            continue
        if pd.isna(row.get("High")) or pd.isna(row.get("Low")):
            continue
        if pd.isna(row.get("Volume")):
            continue

        rows.append(
            {
                "symbol_code": symbol_code,
                "date": row_date.isoformat(),
                "open": float(row["Open"]),
                "close": float(row["Close"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "volume": int(float(row["Volume"])),
            }
        )

    return rows


def normalize_split_series(
    symbol_code: str,
    split_series: pd.Series,
    date_from: date | None,
    date_to: date | None,
) -> list[dict[str, Any]]:
    if split_series.empty:
        return []

    split_dates = _to_jst_dates(split_series.index)
    rows: list[dict[str, Any]] = []
    for split_date, ratio in zip(split_dates, split_series.to_list()):
        if date_from is not None and split_date < date_from:
            continue
        if date_to is not None and split_date > date_to:
            continue
        if pd.isna(ratio):
            continue

        ratio_float = float(ratio)
        if ratio_float <= 0:
            continue

        rows.append(
            {
                "symbol_code": symbol_code,
                "date_split": split_date.isoformat(),
                "ratio": ratio_float,
            }
        )

    return rows


class YFinanceClient:
    def __init__(
        self,
        *,
        min_request_interval_seconds: float | None = None,
        retry_policy: RetryPolicy | None = None,
    ) -> None:
        interval_seconds = (
            min_request_interval_seconds
            if min_request_interval_seconds is not None
            else read_env_float("YFINANCE_MIN_REQUEST_INTERVAL_SECONDS", 2.5, min_value=0.0)
        )
        self._throttler = RequestThrottler(min_interval_seconds=interval_seconds)
        self._retry_policy = retry_policy or RetryPolicy(
            max_attempts=read_env_int("YFINANCE_MAX_ATTEMPTS", 4, min_value=1),
            base_backoff_seconds=read_env_float(
                "YFINANCE_BACKOFF_BASE_SECONDS",
                5.0,
                min_value=0.0,
            ),
            max_backoff_seconds=read_env_float(
                "YFINANCE_BACKOFF_MAX_SECONDS",
                60.0,
                min_value=0.0,
            ),
        )

    def _is_probable_rate_limit_error(self, error: Exception) -> bool:
        message = str(error).lower()
        return (
            "too many requests" in message
            or "rate limit" in message
            or "429" in message
        )

    def _run_with_retry(self, fetcher: Callable[[], _T]) -> _T:
        attempts = self._retry_policy.max_attempts
        last_error: Exception | None = None

        for attempt in range(1, attempts + 1):
            self._throttler.wait()
            try:
                return fetcher()
            except yf_exceptions.YFRateLimitError as error:
                last_error = error
            except Exception as error:  # noqa: BLE001
                if not self._is_probable_rate_limit_error(error):
                    raise
                last_error = error

            if attempt >= attempts:
                break
            time.sleep(self._retry_policy.backoff_seconds(attempt))

        if last_error:
            raise last_error
        raise RuntimeError("yfinance request failed after retries.")

    def fetch_daily_prices(
        self,
        symbol_code: str,
        date_from: date,
        date_to: date,
    ) -> list[dict[str, Any]]:
        end_inclusive = date_to + timedelta(days=1)

        def fetcher() -> pd.DataFrame:
            ticker = yf.Ticker(to_tse_ticker(symbol_code))
            return ticker.history(
                start=date_from.isoformat(),
                end=end_inclusive.isoformat(),
                auto_adjust=False,
                actions=False,
            )

        history = self._run_with_retry(fetcher)
        return normalize_history_frame(symbol_code=symbol_code, history=history)

    def fetch_splits(
        self,
        symbol_code: str,
        date_from: date | None,
        date_to: date | None,
    ) -> list[dict[str, Any]]:

        def fetcher() -> pd.Series:
            ticker = yf.Ticker(to_tse_ticker(symbol_code))
            return ticker.splits

        split_series = self._run_with_retry(fetcher)
        return normalize_split_series(
            symbol_code=symbol_code,
            split_series=split_series,
            date_from=date_from,
            date_to=date_to,
        )


def today_jst() -> date:
    return datetime.now(tz=ZoneInfo("Asia/Tokyo")).date()
