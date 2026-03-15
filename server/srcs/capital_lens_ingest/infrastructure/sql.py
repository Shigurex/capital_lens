from __future__ import annotations

import json
import math
from typing import Any, Iterable


def quote_string(value: str) -> str:
    escaped = value.replace("'", "''")
    return f"'{escaped}'"


def quote_number(value: int | float) -> str:
    if isinstance(value, bool):
        return "1" if value else "0"
    if isinstance(value, int):
        return str(value)
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            raise ValueError(f"Invalid numeric value: {value}")
        return repr(value)
    raise TypeError(f"Unsupported numeric type: {type(value)!r}")


def quote_json(data: dict[str, Any]) -> str:
    return quote_string(json.dumps(data, ensure_ascii=False, separators=(",", ":")))


def build_symbols_upsert(rows: Iterable[dict[str, Any]]) -> str | None:
    values: list[str] = []
    for row in rows:
        code = row["code"]
        platform = row.get("platform", "TSE")
        name = row["name"]
        metadata = row.get("metadata", {})
        values.append(
            "(" + ", ".join(
                [
                    quote_string(str(code)),
                    quote_string(str(platform)),
                    quote_json(metadata),
                    quote_string(str(name)),
                ]
            ) + ")"
        )

    if not values:
        return None

    return (
        "INSERT INTO symbols (code, platform, metadata, name) VALUES\n"
        + ",\n".join(values)
        + "\nON CONFLICT(code) DO UPDATE SET\n"
        "  platform = excluded.platform,\n"
        "  metadata = excluded.metadata,\n"
        "  name = excluded.name,\n"
        "  updated_at = CURRENT_TIMESTAMP;"
    )


def build_daily_prices_upsert(rows: Iterable[dict[str, Any]]) -> str | None:
    values: list[str] = []
    for row in rows:
        values.append(
            "(" + ", ".join(
                [
                    quote_string(str(row["symbol_code"])),
                    quote_string(str(row["date"])),
                    quote_number(float(row["open"])),
                    quote_number(float(row["close"])),
                    quote_number(float(row["high"])),
                    quote_number(float(row["low"])),
                    quote_number(int(row["volume"])),
                ]
            ) + ")"
        )

    if not values:
        return None

    return (
        "INSERT INTO symbol_daily_prices (symbol_code, date, open, close, high, low, volume) VALUES\n"
        + ",\n".join(values)
        + "\nON CONFLICT(symbol_code, date) DO UPDATE SET\n"
        "  open = excluded.open,\n"
        "  close = excluded.close,\n"
        "  high = excluded.high,\n"
        "  low = excluded.low,\n"
        "  volume = excluded.volume,\n"
        "  updated_at = CURRENT_TIMESTAMP;"
    )


def build_splits_upsert(rows: Iterable[dict[str, Any]]) -> str | None:
    values: list[str] = []
    for row in rows:
        values.append(
            "(" + ", ".join(
                [
                    quote_string(str(row["symbol_code"])),
                    quote_string(str(row["date_split"])),
                    quote_number(float(row["ratio"])),
                ]
            ) + ")"
        )

    if not values:
        return None

    return (
        "INSERT INTO symbol_splits (symbol_code, date_split, ratio) VALUES\n"
        + ",\n".join(values)
        + "\nON CONFLICT(symbol_code, date_split) DO UPDATE SET\n"
        "  ratio = excluded.ratio,\n"
        "  updated_at = CURRENT_TIMESTAMP;"
    )


def select_active_symbols_sql() -> str:
    return (
        "SELECT code FROM symbols "
        "WHERE deleted_at IS NULL "
        "ORDER BY code;"
    )
