from datetime import date

import pandas as pd

from capital_lens_ingest.infrastructure.yfinance_client import (
    normalize_history_frame,
    normalize_split_series,
)


def test_normalize_history_frame_converts_ohlcv_rows() -> None:
    frame = pd.DataFrame(
        {
            "Open": [100.0],
            "Close": [110.0],
            "High": [112.0],
            "Low": [98.0],
            "Volume": [12345],
        },
        index=pd.to_datetime(["2026-03-01T00:00:00+00:00"]),
    )

    rows = normalize_history_frame("7203", frame)

    assert len(rows) == 1
    assert rows[0]["symbol_code"] == "7203"
    assert rows[0]["open"] == 100.0
    assert rows[0]["close"] == 110.0
    assert rows[0]["volume"] == 12345


def test_normalize_split_series_filters_range() -> None:
    series = pd.Series(
        [2.0, 3.0],
        index=pd.to_datetime(
            ["2024-10-01T00:00:00+09:00", "2025-10-01T00:00:00+09:00"]
        ),
    )

    rows = normalize_split_series(
        symbol_code="7203",
        split_series=series,
        date_from=date(2025, 1, 1),
        date_to=date(2025, 12, 31),
    )

    assert rows == [
        {
            "symbol_code": "7203",
            "date_split": "2025-10-01",
            "ratio": 3.0,
        }
    ]
