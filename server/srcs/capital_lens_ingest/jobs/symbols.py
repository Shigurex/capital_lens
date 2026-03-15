from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from capital_lens_ingest.infrastructure.d1 import D1Executor
from capital_lens_ingest.infrastructure.jpx import JpxClient
from capital_lens_ingest.infrastructure.sql import build_symbols_upsert
from capital_lens_ingest.infrastructure.utils import (
    chunked,
    normalize_symbol_code,
    read_symbols_file,
)
from capital_lens_ingest.models import Target


def run_symbols_sync_jpx(
    *,
    d1: D1Executor,
    target: Target,
    dry_run: bool,
    batch_size: int,
    source_url: str | None,
    symbols_raw: str | None,
    symbols_file: Path | None,
    logger: logging.Logger,
) -> dict[str, Any]:
    client = JpxClient()
    records = client.fetch_symbols(source_url=source_url)

    selected_symbols: set[str] | None = None
    selected_symbol_values: list[str] = []
    if symbols_raw:
        selected_symbol_values.extend(symbols_raw.split(","))
    if symbols_file:
        selected_symbol_values.extend(read_symbols_file(symbols_file))
    if selected_symbol_values:
        selected_symbols = {
            symbol
            for symbol in (
                normalize_symbol_code(item) for item in selected_symbol_values
            )
            if symbol
        }

    rows = [
        {
            "code": record.code,
            "platform": record.platform,
            "name": record.name,
            "metadata": record.metadata,
        }
        for record in records
        if selected_symbols is None or record.code in selected_symbols
    ]

    logger.info("JPX symbols prepared: %s rows", len(rows))
    if dry_run:
        logger.info("Dry-run enabled: skipped D1 writes for symbols.")
        return {"rows_prepared": len(rows), "rows_written": 0}

    rows_written = 0
    for chunk in chunked(rows, batch_size):
        sql = build_symbols_upsert(chunk)
        if not sql:
            continue
        d1.execute_write(sql=sql, target=target)
        rows_written += len(chunk)

    logger.info("JPX symbols upsert completed: %s rows", rows_written)
    return {"rows_prepared": len(rows), "rows_written": rows_written}
