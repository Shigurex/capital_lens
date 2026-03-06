# Database Design

## Overview

Target tables:

- `symbols`
- `symbol_daily_prices`
- `symbol_splits`
- `symbol_bookmarks`
- `symbol_history`
- `users`
- `symbol_summaries`

## Table Relationships

- `symbols.code` is referenced by `symbol_daily_prices.symbol_code`
- `symbols.code` is referenced by `symbol_splits.symbol_code`
- `symbols.code` is referenced by `symbol_bookmarks.symbol_code`
- `symbols.code` is referenced by `symbol_history.symbol_code`
- `symbols.code` is referenced by `symbol_summaries.symbol_code`
- `users.id` is referenced by `symbol_bookmarks.user`
- `users.id` is referenced by `symbol_history.user`
- `users.id` is linked to `auth.users.id`

## Common Conventions

- Most tables use either a `uuid` primary key or a business key primary key.
- Most operational tables include `created_at`, `updated_at`, and `deleted_at`.
- `updated_at` is automatically updated by triggers on the main tables.
- Tables that support soft delete should use a surrogate `id` primary key when records may be re-created after deletion.
- Business uniqueness for soft-deleted tables should be enforced with partial unique indexes filtered by `deleted_at IS NULL`.

## `symbols`

### Purpose

Master table for listed companies and securities. Other domain tables reference `symbols.code`.

### Columns

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `created_at` | `timestamptz` | NO | `now()` | Created timestamp |
| `updated_at` | `timestamptz` | NO | `now()` | Updated timestamp |
| `deleted_at` | `timestamptz` | YES | - | Soft delete |
| `code` | `text` | NO | - | Primary key |
| `platform` | `text` | NO | - | Market/platform |
| `metadata` | `jsonb` | YES | `'{}'::jsonb` | Flexible attributes |
| `name` | `text` | NO | - | Current display name |

### Constraints

- Primary key: `code`

### Indexes

- PK index on `code`
- GIN index on `metadata`
- B-tree partial indexes on `metadata->>'industry_code_17'` and `metadata->>'industry_code_33'`

### Notes

- Earlier schema versions had `short_name`, `long_name`, and `edinet_code`, but the current design consolidates extensible attributes into `metadata`.

## `symbol_daily_prices`

### Purpose

Stores daily OHLCV price data for each symbol.

### Columns

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `created_at` | `timestamptz` | NO | `now()` | Created timestamp |
| `updated_at` | `timestamptz` | NO | `now()` | Updated timestamp |
| `deleted_at` | `timestamptz` | YES | - | Soft delete |
| `symbol_code` | `text` | NO | - | Primary key, FK to `symbols.code` |
| `date` | `date` | NO | - | Primary key, trading date |
| `open` | `double precision` | NO | - | Open price |
| `close` | `double precision` | NO | - | Close price |
| `high` | `double precision` | NO | - | High price |
| `low` | `double precision` | NO | - | Low price |
| `volume` | `numeric` | NO | - | Trading volume |

### Constraints

- Primary key: `(symbol_code, date)`
- Foreign key: `symbol_code -> symbols(code)`

### Indexes

- PK index on `(symbol_code, date)`

### Notes

- The initial schema had `dividents` and `splits`, but the current table definition no longer includes them.

## `symbol_splits`

### Purpose

Stores stock split events by symbol and effective date.

### Columns

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `created_at` | `timestamptz` | NO | `now()` | Created timestamp |
| `updated_at` | `timestamptz` | NO | `now()` | Updated timestamp |
| `deleted_at` | `timestamptz` | YES | - | Soft delete |
| `symbol_code` | `text` | NO | - | Primary key, FK to `symbols.code` |
| `date_split` | `date` | NO | - | Primary key, split date |
| `ratio` | `double precision` | NO | - | Split ratio |

### Constraints

- Primary key: `(symbol_code, date_split)`
- Foreign key: `symbol_code -> symbols(code)`

### Indexes

- PK index on `(symbol_code, date_split)`

## `symbol_bookmarks`

### Purpose

Stores the symbols bookmarked by each user.

### Columns

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `created_at` | `timestamptz` | NO | `now()` | Created timestamp |
| `updated_at` | `timestamptz` | NO | `now()` | Updated timestamp |
| `deleted_at` | `timestamptz` | YES | - | Soft delete |
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `user` | `uuid` | NO | - | FK to `users.id` |
| `symbol_code` | `text` | NO | - | FK to `symbols.code` |

### Constraints

- Primary key: `id`
- Foreign key: `user -> users(id)`
- Foreign key: `symbol_code -> symbols(code)`
- Partial unique index on `(user, symbol_code)` where `deleted_at IS NULL`

### Indexes

- PK index on `id`
- Partial unique index on `(user, symbol_code)` where `deleted_at IS NULL`

### Notes

- One user can have only one active bookmark per symbol, while still allowing re-bookmarking after soft delete.

## `symbol_history`

### Purpose

Stores append-only per-user symbol viewing history.

### Columns

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `created_at` | `timestamptz` | NO | `now()` | Created timestamp |
| `updated_at` | `timestamptz` | NO | `now()` | Updated timestamp |
| `deleted_at` | `timestamptz` | YES | - | Soft delete |
| `id` | `uuid` | NO | `gen_random_uuid()` | Primary key |
| `user` | `uuid` | NO | - | FK to `users.id` |
| `symbol_code` | `text` | NO | - | FK to `symbols.code` |
| `viewed_at` | `timestamptz` | NO | `now()` | When the symbol was viewed |

### Constraints

- Primary key: `id`
- Foreign key: `user -> users(id)`
- Foreign key: `symbol_code -> symbols(code)`

### Indexes

- PK index on `id`
- Index on `(user, viewed_at DESC)`
- Index on `(symbol_code, viewed_at DESC)`

### Notes

- This table is intended to preserve chronological view events. Multiple rows per user and symbol are allowed.
- If only the latest viewed state is needed, a separate derived table or materialized view should be used instead of changing this event log design.

## `users`

### Purpose

Application user profile table linked to Supabase Auth.

### Columns

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | NO | - | Primary key, also FK to `auth.users.id` |
| `created_at` | `timestamptz` | NO | `now()` | Created timestamp |
| `updated_at` | `timestamptz` | NO | `now()` | Updated timestamp |
| `deleted_at` | `timestamptz` | YES | - | Soft delete |
| `name` | `text` | NO | - | Display name |
| `email` | `text` | NO | - | Unique email |
| `icon` | `text` | YES | - | Avatar URL or icon path |

### Constraints

- Primary key: `id`
- Partial unique index on `email` where `deleted_at IS NULL`
- Foreign key: `id -> auth.users(id)` with `ON DELETE CASCADE`

### Indexes

- PK index on `id`
- Partial unique index on `email` where `deleted_at IS NULL`

### Notes

- A trigger inserts into `public.users` when a new `auth.users` row is created, reusing the `auth.users.id` value directly.
- Policies are defined for authenticated read access and self-update behavior.
- `id` should not generate an independent UUID because this table is keyed by Supabase Auth user ID.

## `symbol_summaries`

### Purpose

Precomputed summary table for screening, ranking, and fast retrieval of investment metrics per symbol.

### Columns

| Column | Type | Null | Default | Notes |
| --- | --- | --- | --- | --- |
| `symbol_code` | `text` | NO | - | Primary key, FK to `symbols.code` |
| `latest_fiscal_year_end` | `date` | NO | - | Latest fiscal year end |
| `latest_fiscal_year_source` | `text` | NO | - | `financials` or `financials_irbank` |
| `latest_fiscal_year_doc_id` | `text` | YES | - | Doc ID when source is `financials` |
| `latest_net_sales` | `numeric` | YES | - | Latest net sales |
| `latest_operating_income` | `numeric` | YES | - | Latest operating income |
| `latest_profit_loss` | `numeric` | YES | - | Latest profit/loss |
| `latest_total_assets` | `numeric` | YES | - | Latest total assets |
| `latest_net_assets` | `numeric` | YES | - | Latest net assets |
| `latest_return_on_equity` | `numeric` | YES | - | Latest ROE |
| `latest_equity_to_asset_ratio` | `numeric` | YES | - | Latest equity ratio |
| `latest_earnings_per_share` | `numeric` | YES | - | Latest EPS |
| `latest_earnings_per_share_adjusted` | `numeric` | YES | - | Latest adjusted EPS |
| `latest_dividend_per_share` | `numeric` | YES | - | Latest DPS |
| `latest_dividend_per_share_adjusted` | `numeric` | YES | - | Latest adjusted DPS |
| `consecutive_dividend_years` | `integer` | YES | `0` | Consecutive dividend years |
| `sales_cagr_3y` | `numeric` | YES | - | 3Y sales CAGR |
| `sales_cagr_5y` | `numeric` | YES | - | 5Y sales CAGR |
| `avg_roe_3y` | `numeric` | YES | - | 3Y average ROE |
| `avg_roe_5y` | `numeric` | YES | - | 5Y average ROE |
| `avg_operating_margin_3y` | `numeric` | YES | - | 3Y average operating margin |
| `avg_operating_margin_5y` | `numeric` | YES | - | 5Y average operating margin |
| `avg_dividend_payout_ratio_3y` | `numeric` | YES | - | 3Y average payout ratio |
| `avg_dividend_payout_ratio_5y` | `numeric` | YES | - | 5Y average payout ratio |
| `latest_high_price` | `numeric` | YES | - | Latest high price |
| `latest_low_price` | `numeric` | YES | - | Latest low price |
| `latest_dividend_yield_high` | `numeric` | YES | - | Latest yield at high price |
| `latest_dividend_yield_low` | `numeric` | YES | - | Latest yield at low price |
| `data_quality_score` | `numeric` | YES | `0` | Completeness score |
| `available_years_count` | `integer` | YES | `0` | Available fiscal years |
| `has_edinet_data` | `boolean` | YES | `false` | Whether EDINET data exists |
| `created_at` | `timestamptz` | NO | `now()` | Created timestamp |
| `updated_at` | `timestamptz` | NO | `now()` | Updated timestamp |

### Constraints

- Primary key: `symbol_code`
- Foreign key: `symbol_code -> symbols(code)` with `ON DELETE CASCADE`
- Check constraint: `latest_fiscal_year_source IN ('financials', 'financials_irbank')`

### Indexes

- PK index on `symbol_code`
- Index on `latest_fiscal_year_end DESC`
- Index on `consecutive_dividend_years DESC`
- Index on `avg_roe_5y DESC NULLS LAST`
- Index on `sales_cagr_5y DESC NULLS LAST`
- Index on `data_quality_score DESC`

### Notes

- This is a derived table and should be treated as a cache or materialized summary layer rather than a source-of-truth transactional table.
