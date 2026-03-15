from __future__ import annotations

import logging
from datetime import date
from pathlib import Path
from typing import Any

from capital_lens_ingest.infrastructure.d1 import D1Executor
from capital_lens_ingest.infrastructure.sql import build_splits_upsert
from capital_lens_ingest.infrastructure.utils import chunked
from capital_lens_ingest.infrastructure.yfinance_client import YFinanceClient
from capital_lens_ingest.jobs.helpers import resolve_symbol_scope
from capital_lens_ingest.models import Target


def run_splits_sync_yf(
    *,
    d1: D1Executor,
    target: Target,
    dry_run: bool,
    batch_size: int,
    symbols_raw: str | None,
    symbols_file: Path | None,
    date_from: date | None,
    date_to: date | None,
    logger: logging.Logger,
) -> dict[str, Any]:
    if date_from and date_to and date_to < date_from:
        raise ValueError("--to must be equal to or greater than --from")

    symbols = resolve_symbol_scope(
        d1=d1,
        target=target,
        symbols_raw=symbols_raw,
        symbols_file=symbols_file,
        logger=logger,
    )
    if not symbols:
        logger.warning("No symbols to process for splits.")
        return {"symbols": 0, "rows_prepared": 0, "rows_written": 0}

    client = YFinanceClient()
    prepared_rows = 0
    written_rows = 0

    for symbol in symbols:
        rows = client.fetch_splits(symbol_code=symbol, date_from=date_from, date_to=date_to)
        prepared_rows += len(rows)
        if not rows:
            continue

        if dry_run:
            continue

        for chunk in chunked(rows, batch_size):
            sql = build_splits_upsert(chunk)
            if not sql:
                continue
            d1.execute_write(sql=sql, target=target)
            written_rows += len(chunk)

    logger.info(
        "Split sync completed. symbols=%s prepared=%s written=%s",
        len(symbols),
        prepared_rows,
        0 if dry_run else written_rows,
    )

    return {
        "symbols": len(symbols),
        "rows_prepared": prepared_rows,
        "rows_written": 0 if dry_run else written_rows,
        "from": date_from.isoformat() if date_from else None,
        "to": date_to.isoformat() if date_to else None,
    }
