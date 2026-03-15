from capital_lens_ingest.infrastructure.sql import (
    build_daily_prices_upsert,
    build_splits_upsert,
    build_symbols_upsert,
)


def test_build_symbols_upsert_contains_conflict_clause() -> None:
    sql = build_symbols_upsert(
        [
            {
                "code": "7203",
                "platform": "TSE",
                "name": "Toyota",
                "metadata": {"industry_code_17": "06"},
            }
        ]
    )

    assert sql is not None
    assert "ON CONFLICT(code) DO UPDATE" in sql
    assert "industry_code_17" in sql


def test_build_daily_prices_upsert_contains_conflict_clause() -> None:
    sql = build_daily_prices_upsert(
        [
            {
                "symbol_code": "7203",
                "date": "2026-03-10",
                "open": 100.0,
                "close": 110.0,
                "high": 112.0,
                "low": 98.0,
                "volume": 1000,
            }
        ]
    )

    assert sql is not None
    assert "ON CONFLICT(symbol_code, date) DO UPDATE" in sql


def test_build_splits_upsert_contains_conflict_clause() -> None:
    sql = build_splits_upsert(
        [{"symbol_code": "7203", "date_split": "2024-10-01", "ratio": 2.0}]
    )

    assert sql is not None
    assert "ON CONFLICT(symbol_code, date_split) DO UPDATE" in sql
