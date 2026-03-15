from __future__ import annotations

import logging
from pathlib import Path

from capital_lens_ingest.infrastructure.d1 import D1Executor
from capital_lens_ingest.infrastructure.sql import select_active_symbols_sql
from capital_lens_ingest.infrastructure.utils import (
    normalize_symbol_code,
    parse_symbols_text,
    read_symbols_file,
    read_target,
)
from capital_lens_ingest.models import Target


def resolve_symbol_scope(
    d1: D1Executor,
    target: Target,
    symbols_raw: str | None,
    symbols_file: Path | None,
    logger: logging.Logger,
) -> list[str]:
    selected: list[str] = []

    if symbols_raw:
        selected.extend(parse_symbols_text(symbols_raw))

    if symbols_file:
        selected.extend(read_symbols_file(symbols_file))

    deduped: list[str] = []
    seen: set[str] = set()
    for symbol in selected:
        normalized = normalize_symbol_code(symbol)
        if not normalized or normalized in seen:
            continue
        deduped.append(normalized)
        seen.add(normalized)

    if deduped:
        logger.info("Using %s symbols from CLI arguments.", len(deduped))
        return deduped

    read_mode = read_target(target)
    rows = d1.query(select_active_symbols_sql(), target=read_mode)
    symbols_from_db: list[str] = []
    for row in rows:
        symbol = normalize_symbol_code(row.get("code"))
        if symbol:
            symbols_from_db.append(symbol)

    unique_sorted = sorted(set(symbols_from_db))
    logger.info("Loaded %s symbols from %s D1.", len(unique_sorted), read_mode)
    return unique_sorted
