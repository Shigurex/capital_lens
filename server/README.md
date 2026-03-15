# Capital Lens Ingestion CLI

`server` contains a Python CLI that ingests:

- JPX symbol master data into `symbols`
- yfinance daily OHLCV into `symbol_daily_prices`
- yfinance split events into `symbol_splits`
- EDINET original files (XBRL/PDF) to local filesystem

The existing D1 schema is reused as-is (no schema migration required).

## Setup

```bash
cd server
uv sync
```

Environment variables:

```bash
# Required for EDINET API
export EDINET_API_KEY=...

# Required only when --target remote or --target both
export CLOUDFLARE_API_TOKEN=...

# Optional: request pacing / retry tuning (safe defaults are built in)
export EDINET_MIN_REQUEST_INTERVAL_SECONDS=1.0
export EDINET_MAX_ATTEMPTS=4
export EDINET_BACKOFF_BASE_SECONDS=1.0
export EDINET_BACKOFF_MAX_SECONDS=30.0
export YFINANCE_MIN_REQUEST_INTERVAL_SECONDS=2.5
export YFINANCE_MAX_ATTEMPTS=4
export YFINANCE_BACKOFF_BASE_SECONDS=5.0
export YFINANCE_BACKOFF_MAX_SECONDS=60.0
```

`capital_lens_ingest.cli` automatically loads `.env.local`/`.env` from the repository root and `server/` directory (without overriding already-exported environment variables).

Rate-control defaults:

- EDINET requests are paced to at most 1 request/second per process, with exponential backoff retries for `429` and transient `5xx`.
- yfinance requests are paced to one call every 2.5 seconds per process, with exponential backoff retries when `YFRateLimitError` occurs.
- If you repeatedly poll same-day EDINET listings, increase `EDINET_MIN_REQUEST_INTERVAL_SECONDS` to `60` to match EDINET FAQ guidance.

## CLI Entry Point

```bash
cd server
uv run python -m capital_lens_ingest.cli --help
```

Subcommands:

- `symbols sync-jpx`
- `prices sync-yf`
- `splits sync-yf`
- `edinet fetch`
- `jobs daily`

Common options:

- `--target local|remote|both`
- `--dry-run`
- `--batch-size`
- `--log-level`
- `--symbols 7203,6758`
- `--symbols-file path/to/symbols.txt`

## Usage Examples

Sync JPX symbols to local D1:

```bash
uv run python -m capital_lens_ingest.cli symbols sync-jpx --target local
```

Sync daily prices for selected symbols and dates:

```bash
uv run python -m capital_lens_ingest.cli prices sync-yf \
  --target local \
  --symbols 7203,6758 \
  --from 2026-03-01 \
  --to 2026-03-10
```

Sync split history for all symbols in D1:

```bash
uv run python -m capital_lens_ingest.cli splits sync-yf --target local
```

Fetch EDINET files (`type=1,2` default) to `server/data/edinet/...`:

```bash
uv run python -m capital_lens_ingest.cli edinet fetch \
  --target local \
  --from 2026-03-10 \
  --to 2026-03-10
```

Run daily pipeline (`symbols -> prices -> splits -> edinet`):

```bash
uv run python -m capital_lens_ingest.cli jobs daily --target local
```

## EDINET Output Layout

Default root directory: `server/data`

- `edinet/xbrl/{doc_type_slug}/{company_code}/{date}/{doc_id}/`
- `edinet/pdf/{doc_type_slug}/{company_code}/{date}/{doc_id}.pdf`

Unknown `docTypeCode` values are stored under `unknown_docTypeCode_<code>`.

## Tests

```bash
cd server
uv run --with pytest pytest -q
```

Includes:

- Unit tests for JPX transform, yfinance normalization, EDINET pathing, SQL upsert builders
- Integration tests for local D1 idempotent upserts and `--target both` branching behavior

## Cron Note (Next Phase)

This CLI is designed to be triggered externally (for example by Cloudflare Worker Cron trigger -> webhook/queue -> Python runner). The Worker itself is not expected to execute yfinance logic directly.
