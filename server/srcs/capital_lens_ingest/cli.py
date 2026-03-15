from __future__ import annotations

import argparse
import json
import logging
import os
from datetime import date
from pathlib import Path
from typing import Any

from capital_lens_ingest.infrastructure.d1 import D1Executor
from capital_lens_ingest.jobs.daily import run_daily_job
from capital_lens_ingest.jobs.edinet import run_edinet_fetch
from capital_lens_ingest.jobs.prices import run_prices_sync_yf
from capital_lens_ingest.jobs.splits import run_splits_sync_yf
from capital_lens_ingest.jobs.symbols import run_symbols_sync_jpx
from capital_lens_ingest.models import Target


def parse_date(value: str) -> date:
    try:
        return date.fromisoformat(value)
    except ValueError as exc:
        raise argparse.ArgumentTypeError(
            f"Invalid date: {value}. Use YYYY-MM-DD."
        ) from exc


def parse_doc_types(value: str) -> list[int]:
    result: list[int] = []
    for token in value.split(","):
        token = token.strip()
        if not token:
            continue
        try:
            doc_type = int(token)
        except ValueError as exc:
            raise argparse.ArgumentTypeError(
                f"Invalid doc type: {token}"
            ) from exc
        if doc_type < 1 or doc_type > 5:
            raise argparse.ArgumentTypeError(
                f"doc type must be between 1 and 5: {doc_type}"
            )
        result.append(doc_type)

    unique_sorted = sorted(set(result))
    if not unique_sorted:
        raise argparse.ArgumentTypeError("At least one doc type is required.")
    return unique_sorted


def default_output_dir() -> Path:
    return Path(__file__).resolve().parents[2] / "data"


def _parse_env_line(line: str) -> tuple[str, str] | None:
    stripped = line.strip()
    if not stripped or stripped.startswith("#"):
        return None
    if stripped.startswith("export "):
        stripped = stripped[7:].strip()
    if "=" not in stripped:
        return None
    key, value = stripped.split("=", 1)
    env_key = key.strip()
    if not env_key:
        return None
    env_value = value.strip()
    if len(env_value) >= 2 and env_value[0] == env_value[-1] and env_value[0] in {"'", '"'}:
        env_value = env_value[1:-1]
    return env_key, env_value


def load_local_env_files(
    *,
    root_dir: Path | None = None,
    server_dir: Path | None = None,
) -> list[Path]:
    resolved_root = root_dir or Path(__file__).resolve().parents[3]
    resolved_server = server_dir or Path(__file__).resolve().parents[2]
    env_files = [
        resolved_root / ".env.local",
        resolved_server / ".env.local",
        resolved_root / ".env",
        resolved_server / ".env",
    ]

    loaded: list[Path] = []
    for env_file in env_files:
        if not env_file.is_file():
            continue
        for line in env_file.read_text(encoding="utf-8").splitlines():
            parsed = _parse_env_line(line)
            if parsed is None:
                continue
            key, value = parsed
            os.environ.setdefault(key, value)
        loaded.append(env_file)
    return loaded


def add_common_options(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--target",
        choices=["local", "remote", "both"],
        default="local",
        help="D1 target. both = local then remote",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run without writing to D1/files.",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=200,
        help="Rows per upsert batch.",
    )
    parser.add_argument(
        "--log-level",
        default="INFO",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
    )


def add_symbol_scope_options(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--symbols",
        help="Comma separated symbol codes. Example: 7203,6758",
    )
    parser.add_argument(
        "--symbols-file",
        type=Path,
        help="Path to file containing symbol codes (comma/space/newline separated).",
    )


def add_date_range_options(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--from", dest="date_from", type=parse_date)
    parser.add_argument("--to", dest="date_to", type=parse_date)


def configure_logging(level: str) -> logging.Logger:
    logging.basicConfig(
        level=getattr(logging, level),
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    return logging.getLogger("capital_lens_ingest")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="python -m capital_lens_ingest.cli",
        description="Capital Lens ingestion commands",
    )
    subparsers = parser.add_subparsers(dest="resource", required=True)

    symbols_parser = subparsers.add_parser("symbols", help="Symbol ingestion commands")
    symbols_sub = symbols_parser.add_subparsers(dest="action", required=True)
    symbols_sync_jpx = symbols_sub.add_parser("sync-jpx", help="Sync JPX symbols")
    add_common_options(symbols_sync_jpx)
    add_symbol_scope_options(symbols_sync_jpx)
    symbols_sync_jpx.add_argument("--source-url", help="Override JPX listing file URL")

    prices_parser = subparsers.add_parser("prices", help="Price ingestion commands")
    prices_sub = prices_parser.add_subparsers(dest="action", required=True)
    prices_sync_yf = prices_sub.add_parser("sync-yf", help="Sync daily prices from yfinance")
    add_common_options(prices_sync_yf)
    add_symbol_scope_options(prices_sync_yf)
    add_date_range_options(prices_sync_yf)

    splits_parser = subparsers.add_parser("splits", help="Split ingestion commands")
    splits_sub = splits_parser.add_subparsers(dest="action", required=True)
    splits_sync_yf = splits_sub.add_parser("sync-yf", help="Sync splits from yfinance")
    add_common_options(splits_sync_yf)
    add_symbol_scope_options(splits_sync_yf)
    add_date_range_options(splits_sync_yf)

    edinet_parser = subparsers.add_parser("edinet", help="EDINET ingestion commands")
    edinet_sub = edinet_parser.add_subparsers(dest="action", required=True)
    edinet_fetch = edinet_sub.add_parser("fetch", help="Fetch EDINET files")
    add_common_options(edinet_fetch)
    add_symbol_scope_options(edinet_fetch)
    add_date_range_options(edinet_fetch)
    edinet_fetch.add_argument(
        "--doc-types",
        type=parse_doc_types,
        default=[1, 2],
        help="Comma separated EDINET document types. default=1,2",
    )
    edinet_fetch.add_argument(
        "--output-dir",
        type=Path,
        default=default_output_dir(),
        help="Root output directory for EDINET files.",
    )

    jobs_parser = subparsers.add_parser("jobs", help="Combined jobs")
    jobs_sub = jobs_parser.add_subparsers(dest="action", required=True)
    jobs_daily = jobs_sub.add_parser("daily", help="Run symbols->prices->splits->edinet")
    add_common_options(jobs_daily)
    add_symbol_scope_options(jobs_daily)
    add_date_range_options(jobs_daily)
    jobs_daily.add_argument(
        "--doc-types",
        type=parse_doc_types,
        default=[1, 2],
        help="Comma separated EDINET document types. default=1,2",
    )
    jobs_daily.add_argument(
        "--output-dir",
        type=Path,
        default=default_output_dir(),
        help="Root output directory for EDINET files.",
    )
    jobs_daily.add_argument("--source-url", help="Override JPX listing file URL")

    return parser


def _require_batch_size(batch_size: int) -> None:
    if batch_size <= 0:
        raise ValueError("--batch-size must be greater than 0")


def _emit_result(result: dict[str, Any]) -> None:
    print(json.dumps(result, ensure_ascii=False, indent=2))


def main(argv: list[str] | None = None) -> int:
    load_local_env_files()

    parser = build_parser()
    args = parser.parse_args(argv)

    _require_batch_size(args.batch_size)
    logger = configure_logging(args.log_level)

    d1 = D1Executor()
    target = args.target

    if args.resource == "symbols" and args.action == "sync-jpx":
        result = run_symbols_sync_jpx(
            d1=d1,
            target=target,
            dry_run=args.dry_run,
            batch_size=args.batch_size,
            source_url=args.source_url,
            symbols_raw=args.symbols,
            symbols_file=args.symbols_file,
            logger=logger,
        )
        _emit_result(result)
        return 0

    if args.resource == "prices" and args.action == "sync-yf":
        result = run_prices_sync_yf(
            d1=d1,
            target=target,
            dry_run=args.dry_run,
            batch_size=args.batch_size,
            symbols_raw=args.symbols,
            symbols_file=args.symbols_file,
            date_from=args.date_from,
            date_to=args.date_to,
            logger=logger,
        )
        _emit_result(result)
        return 0

    if args.resource == "splits" and args.action == "sync-yf":
        result = run_splits_sync_yf(
            d1=d1,
            target=target,
            dry_run=args.dry_run,
            batch_size=args.batch_size,
            symbols_raw=args.symbols,
            symbols_file=args.symbols_file,
            date_from=args.date_from,
            date_to=args.date_to,
            logger=logger,
        )
        _emit_result(result)
        return 0

    if args.resource == "edinet" and args.action == "fetch":
        result = run_edinet_fetch(
            d1=d1,
            target=target,
            dry_run=args.dry_run,
            symbols_raw=args.symbols,
            symbols_file=args.symbols_file,
            date_from=args.date_from,
            date_to=args.date_to,
            output_dir=args.output_dir,
            doc_types=args.doc_types,
            logger=logger,
        )
        _emit_result(result)
        return 0

    if args.resource == "jobs" and args.action == "daily":
        result = run_daily_job(
            d1=d1,
            target=target,
            dry_run=args.dry_run,
            batch_size=args.batch_size,
            symbols_raw=args.symbols,
            symbols_file=args.symbols_file,
            date_from=args.date_from,
            date_to=args.date_to,
            output_dir=args.output_dir,
            doc_types=args.doc_types,
            source_url=args.source_url,
            logger=logger,
        )
        _emit_result(result)
        return 0

    parser.error("Unsupported command")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
