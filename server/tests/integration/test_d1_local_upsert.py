from pathlib import Path

from capital_lens_ingest.infrastructure.d1 import D1Executor
from capital_lens_ingest.infrastructure.sql import (
    build_daily_prices_upsert,
    build_splits_upsert,
    build_symbols_upsert,
)
from capital_lens_ingest.infrastructure.utils import find_repo_root


def ensure_schema(d1: D1Executor) -> None:
    repo_root = find_repo_root(Path(__file__))
    schema_path = repo_root / "db" / "migrations" / "date_20260306_initial_schema.sql"
    schema_sql = schema_path.read_text(encoding="utf-8")
    d1.execute_write(schema_sql, target="local")


def test_local_upsert_is_idempotent() -> None:
    d1 = D1Executor()
    ensure_schema(d1)

    cleanup_sql = (
        "DELETE FROM symbol_daily_prices WHERE symbol_code = 'TST1';"
        "DELETE FROM symbol_splits WHERE symbol_code = 'TST1';"
        "DELETE FROM symbols WHERE code = 'TST1';"
    )
    d1.execute_write(cleanup_sql, target="local")

    symbol_sql = build_symbols_upsert(
        [
            {
                "code": "TST1",
                "platform": "TSE",
                "name": "Test Symbol",
                "metadata": {"industry_code_17": "01"},
            }
        ]
    )
    assert symbol_sql is not None
    d1.execute_write(symbol_sql, target="local")

    # Re-upsert with a changed name to verify update semantics.
    symbol_sql_update = build_symbols_upsert(
        [
            {
                "code": "TST1",
                "platform": "TSE",
                "name": "Test Symbol Updated",
                "metadata": {"industry_code_17": "01"},
            }
        ]
    )
    assert symbol_sql_update is not None
    d1.execute_write(symbol_sql_update, target="local")

    price_sql = build_daily_prices_upsert(
        [
            {
                "symbol_code": "TST1",
                "date": "2026-03-10",
                "open": 100.0,
                "close": 101.0,
                "high": 102.0,
                "low": 99.0,
                "volume": 1000,
            }
        ]
    )
    assert price_sql is not None
    d1.execute_write(price_sql, target="local")

    # Same PK, changed close -> should update, not duplicate.
    price_sql_update = build_daily_prices_upsert(
        [
            {
                "symbol_code": "TST1",
                "date": "2026-03-10",
                "open": 100.0,
                "close": 105.0,
                "high": 106.0,
                "low": 99.0,
                "volume": 2000,
            }
        ]
    )
    assert price_sql_update is not None
    d1.execute_write(price_sql_update, target="local")

    split_sql = build_splits_upsert(
        [{"symbol_code": "TST1", "date_split": "2025-10-01", "ratio": 2.0}]
    )
    assert split_sql is not None
    d1.execute_write(split_sql, target="local")

    split_sql_update = build_splits_upsert(
        [{"symbol_code": "TST1", "date_split": "2025-10-01", "ratio": 3.0}]
    )
    assert split_sql_update is not None
    d1.execute_write(split_sql_update, target="local")

    symbol_rows = d1.query(
        "SELECT code, name FROM symbols WHERE code = 'TST1';",
        target="local",
    )
    assert len(symbol_rows) == 1
    assert symbol_rows[0]["name"] == "Test Symbol Updated"

    price_rows = d1.query(
        "SELECT COUNT(*) AS count, MAX(close) AS max_close FROM symbol_daily_prices "
        "WHERE symbol_code = 'TST1' AND date = '2026-03-10';",
        target="local",
    )
    assert int(price_rows[0]["count"]) == 1
    assert float(price_rows[0]["max_close"]) == 105.0

    split_rows = d1.query(
        "SELECT COUNT(*) AS count, MAX(ratio) AS max_ratio FROM symbol_splits "
        "WHERE symbol_code = 'TST1' AND date_split = '2025-10-01';",
        target="local",
    )
    assert int(split_rows[0]["count"]) == 1
    assert float(split_rows[0]["max_ratio"]) == 3.0
