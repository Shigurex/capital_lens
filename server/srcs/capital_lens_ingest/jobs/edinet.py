from __future__ import annotations

import logging
import os
from datetime import date
from pathlib import Path
from typing import Any

import requests

from capital_lens_ingest.infrastructure.d1 import D1Executor
from capital_lens_ingest.infrastructure.edinet import (
    EdinetClient,
    build_pdf_output_path,
    build_xbrl_output_dir,
    doc_type_slug_from_code,
    filing_from_row,
    safe_extract_zip,
    should_download_doc_type,
)
from capital_lens_ingest.infrastructure.utils import iterate_dates
from capital_lens_ingest.infrastructure.yfinance_client import today_jst
from capital_lens_ingest.jobs.helpers import resolve_symbol_scope
from capital_lens_ingest.models import Target


def _write_bytes(path: Path, content: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(content)


def run_edinet_fetch(
    *,
    d1: D1Executor,
    target: Target,
    dry_run: bool,
    symbols_raw: str | None,
    symbols_file: Path | None,
    date_from: date | None,
    date_to: date | None,
    output_dir: Path,
    doc_types: list[int],
    logger: logging.Logger,
) -> dict[str, Any]:
    api_key = os.getenv("EDINET_API_KEY")
    if not api_key:
        raise ValueError("EDINET_API_KEY is required.")

    start = date_from or today_jst()
    end = date_to or start
    if end < start:
        raise ValueError("--to must be equal to or greater than --from")

    symbols = resolve_symbol_scope(
        d1=d1,
        target=target,
        symbols_raw=symbols_raw,
        symbols_file=symbols_file,
        logger=logger,
    )
    symbol_set = set(symbols)
    logger.info("EDINET target symbols=%s", len(symbol_set))

    client = EdinetClient(api_key=api_key)
    # Kept for future extensions and cache visibility.
    sec_to_edinet = client.sync_edinet_codes(output_dir=output_dir, persist=not dry_run)
    logger.info("Synced EDINET code master entries=%s", len(sec_to_edinet))

    listings_total = 0
    listings_selected = 0
    files_saved = 0
    files_failed = 0

    for target_date in iterate_dates(start, end):
        rows = client.list_documents(target_date=target_date, list_type=2)
        listings_total += len(rows)

        for row in rows:
            filing = filing_from_row(row=row, fallback_date=target_date)
            if filing is None:
                continue
            if filing.sec_code is None:
                continue
            if filing.sec_code not in symbol_set:
                continue

            listings_selected += 1
            doc_type_slug = doc_type_slug_from_code(filing.doc_type_code)
            company_code = filing.sec_code

            for doc_type in doc_types:
                if not should_download_doc_type(row, doc_type):
                    continue

                if dry_run:
                    files_saved += 1
                    continue

                try:
                    binary = client.download_document(doc_id=filing.doc_id, doc_type=doc_type)
                    if doc_type == 1:
                        xbrl_dir = build_xbrl_output_dir(
                            base_dir=output_dir,
                            doc_type_slug=doc_type_slug,
                            company_code=company_code,
                            submit_date=filing.submit_date,
                            doc_id=filing.doc_id,
                        )
                        xbrl_dir.mkdir(parents=True, exist_ok=True)
                        zip_path = xbrl_dir / "original.zip"
                        zip_path.write_bytes(binary)
                        try:
                            safe_extract_zip(binary, xbrl_dir)
                        except Exception as zip_error:  # noqa: BLE001
                            logger.warning(
                                "Failed to extract XBRL zip doc_id=%s: %s",
                                filing.doc_id,
                                zip_error,
                            )
                        files_saved += 1
                    elif doc_type == 2:
                        pdf_path = build_pdf_output_path(
                            base_dir=output_dir,
                            doc_type_slug=doc_type_slug,
                            company_code=company_code,
                            submit_date=filing.submit_date,
                            doc_id=filing.doc_id,
                        )
                        _write_bytes(pdf_path, binary)
                        files_saved += 1
                    else:
                        fallback_path = (
                            output_dir
                            / "edinet"
                            / "raw"
                            / f"type-{doc_type}"
                            / doc_type_slug
                            / company_code
                            / filing.submit_date.isoformat()
                            / f"{filing.doc_id}.bin"
                        )
                        _write_bytes(fallback_path, binary)
                        files_saved += 1
                except requests.RequestException as request_error:
                    files_failed += 1
                    logger.warning(
                        "Failed downloading EDINET doc_id=%s type=%s: %s",
                        filing.doc_id,
                        doc_type,
                        request_error,
                    )

    logger.info(
        "EDINET fetch completed. listings_total=%s selected=%s files=%s failed=%s",
        listings_total,
        listings_selected,
        files_saved,
        files_failed,
    )

    return {
        "from": start.isoformat(),
        "to": end.isoformat(),
        "symbols": len(symbol_set),
        "listings_total": listings_total,
        "listings_selected": listings_selected,
        "files_saved": files_saved,
        "files_failed": files_failed,
        "dry_run": dry_run,
    }
