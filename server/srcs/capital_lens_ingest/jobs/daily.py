from __future__ import annotations

import logging
from datetime import date
from pathlib import Path
from typing import Any

from capital_lens_ingest.infrastructure.d1 import D1Executor
from capital_lens_ingest.jobs.edinet import run_edinet_fetch
from capital_lens_ingest.jobs.prices import run_prices_sync_yf
from capital_lens_ingest.jobs.splits import run_splits_sync_yf
from capital_lens_ingest.jobs.symbols import run_symbols_sync_jpx
from capital_lens_ingest.models import Target


def run_daily_job(
    *,
    d1: D1Executor,
    target: Target,
    dry_run: bool,
    batch_size: int,
    symbols_raw: str | None,
    symbols_file: Path | None,
    date_from: date | None,
    date_to: date | None,
    output_dir: Path,
    doc_types: list[int],
    source_url: str | None,
    logger: logging.Logger,
) -> dict[str, Any]:
    result_symbols = run_symbols_sync_jpx(
        d1=d1,
        target=target,
        dry_run=dry_run,
        batch_size=batch_size,
        source_url=source_url,
        symbols_raw=symbols_raw,
        symbols_file=symbols_file,
        logger=logger,
    )
    result_prices = run_prices_sync_yf(
        d1=d1,
        target=target,
        dry_run=dry_run,
        batch_size=batch_size,
        symbols_raw=symbols_raw,
        symbols_file=symbols_file,
        date_from=date_from,
        date_to=date_to,
        logger=logger,
    )
    result_splits = run_splits_sync_yf(
        d1=d1,
        target=target,
        dry_run=dry_run,
        batch_size=batch_size,
        symbols_raw=symbols_raw,
        symbols_file=symbols_file,
        date_from=None,
        date_to=None,
        logger=logger,
    )
    result_edinet = run_edinet_fetch(
        d1=d1,
        target=target,
        dry_run=dry_run,
        symbols_raw=symbols_raw,
        symbols_file=symbols_file,
        date_from=date_from,
        date_to=date_to,
        output_dir=output_dir,
        doc_types=doc_types,
        logger=logger,
    )

    return {
        "symbols": result_symbols,
        "prices": result_prices,
        "splits": result_splits,
        "edinet": result_edinet,
    }
