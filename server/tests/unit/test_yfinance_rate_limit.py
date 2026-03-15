from datetime import date

import pandas as pd
import pytest
from yfinance.exceptions import YFRateLimitError

from capital_lens_ingest.infrastructure.rate_control import RetryPolicy
from capital_lens_ingest.infrastructure.yfinance_client import YFinanceClient


def test_fetch_daily_prices_retries_on_rate_limit(monkeypatch: pytest.MonkeyPatch) -> None:
    attempts = {"count": 0}

    class FakeTicker:
        def history(self, **_: object) -> pd.DataFrame:
            attempts["count"] += 1
            if attempts["count"] < 3:
                raise YFRateLimitError()
            return pd.DataFrame(
                {
                    "Open": [100.0],
                    "Close": [110.0],
                    "High": [112.0],
                    "Low": [98.0],
                    "Volume": [12345],
                },
                index=pd.to_datetime(["2026-03-01T00:00:00+00:00"]),
            )

    monkeypatch.setattr(
        "capital_lens_ingest.infrastructure.yfinance_client.yf.Ticker",
        lambda _symbol: FakeTicker(),
    )
    monkeypatch.setattr("capital_lens_ingest.infrastructure.yfinance_client.time.sleep", lambda _v: None)

    client = YFinanceClient(
        min_request_interval_seconds=0.0,
        retry_policy=RetryPolicy(
            max_attempts=3,
            base_backoff_seconds=0.0,
            max_backoff_seconds=0.0,
        ),
    )

    rows = client.fetch_daily_prices(
        symbol_code="7203",
        date_from=date(2026, 3, 1),
        date_to=date(2026, 3, 1),
    )

    assert attempts["count"] == 3
    assert len(rows) == 1
    assert rows[0]["symbol_code"] == "7203"


def test_fetch_splits_raises_after_max_attempts(monkeypatch: pytest.MonkeyPatch) -> None:
    class FakeTicker:
        @property
        def splits(self) -> pd.Series:
            raise YFRateLimitError()

    monkeypatch.setattr(
        "capital_lens_ingest.infrastructure.yfinance_client.yf.Ticker",
        lambda _symbol: FakeTicker(),
    )
    monkeypatch.setattr("capital_lens_ingest.infrastructure.yfinance_client.time.sleep", lambda _v: None)

    client = YFinanceClient(
        min_request_interval_seconds=0.0,
        retry_policy=RetryPolicy(
            max_attempts=2,
            base_backoff_seconds=0.0,
            max_backoff_seconds=0.0,
        ),
    )

    with pytest.raises(YFRateLimitError):
        client.fetch_splits(symbol_code="7203", date_from=None, date_to=None)
