PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS symbols (
  code TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  metadata TEXT DEFAULT '{}' CHECK (metadata IS NULL OR json_valid(metadata)),
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
) STRICT;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  icon TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
) STRICT;

CREATE TABLE IF NOT EXISTS symbol_daily_prices (
  symbol_code TEXT NOT NULL,
  date TEXT NOT NULL,
  open REAL NOT NULL,
  close REAL NOT NULL,
  high REAL NOT NULL,
  low REAL NOT NULL,
  volume INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  PRIMARY KEY (symbol_code, date),
  FOREIGN KEY (symbol_code) REFERENCES symbols(code) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS symbol_splits (
  symbol_code TEXT NOT NULL,
  date_split TEXT NOT NULL,
  ratio REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  PRIMARY KEY (symbol_code, date_split),
  FOREIGN KEY (symbol_code) REFERENCES symbols(code) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS symbol_bookmarks (
  id TEXT PRIMARY KEY,
  user TEXT NOT NULL,
  symbol_code TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (symbol_code) REFERENCES symbols(code) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS symbol_history (
  id TEXT PRIMARY KEY,
  user TEXT NOT NULL,
  symbol_code TEXT NOT NULL,
  viewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT,
  FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (symbol_code) REFERENCES symbols(code) ON DELETE CASCADE
) STRICT;

CREATE TABLE IF NOT EXISTS symbol_summaries (
  symbol_code TEXT PRIMARY KEY,
  latest_fiscal_year_end TEXT NOT NULL,
  latest_fiscal_year_source TEXT NOT NULL CHECK (latest_fiscal_year_source IN ('financials', 'financials_irbank')),
  latest_fiscal_year_doc_id TEXT,
  latest_net_sales REAL,
  latest_operating_income REAL,
  latest_profit_loss REAL,
  latest_total_assets REAL,
  latest_net_assets REAL,
  latest_return_on_equity REAL,
  latest_equity_to_asset_ratio REAL,
  latest_earnings_per_share REAL,
  latest_earnings_per_share_adjusted REAL,
  latest_dividend_per_share REAL,
  latest_dividend_per_share_adjusted REAL,
  consecutive_dividend_years INTEGER DEFAULT 0,
  sales_cagr_3y REAL,
  sales_cagr_5y REAL,
  avg_roe_3y REAL,
  avg_roe_5y REAL,
  avg_operating_margin_3y REAL,
  avg_operating_margin_5y REAL,
  avg_dividend_payout_ratio_3y REAL,
  avg_dividend_payout_ratio_5y REAL,
  latest_high_price REAL,
  latest_low_price REAL,
  latest_dividend_yield_high REAL,
  latest_dividend_yield_low REAL,
  data_quality_score REAL DEFAULT 0,
  available_years_count INTEGER DEFAULT 0,
  has_edinet_data INTEGER NOT NULL DEFAULT 0 CHECK (has_edinet_data IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (symbol_code) REFERENCES symbols(code) ON DELETE CASCADE
) STRICT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_active
  ON users(email)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_symbols_metadata
  ON symbols(metadata);

CREATE INDEX IF NOT EXISTS idx_symbols_industry_code_17
  ON symbols(json_extract(metadata, '$.industry_code_17'))
  WHERE deleted_at IS NULL AND json_extract(metadata, '$.industry_code_17') IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_symbols_industry_code_33
  ON symbols(json_extract(metadata, '$.industry_code_33'))
  WHERE deleted_at IS NULL AND json_extract(metadata, '$.industry_code_33') IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_symbol_bookmarks_active_unique
  ON symbol_bookmarks(user, symbol_code)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_symbol_history_user_viewed_at
  ON symbol_history(user, viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_symbol_history_symbol_viewed_at
  ON symbol_history(symbol_code, viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_symbol_summaries_latest_fiscal_year_end
  ON symbol_summaries(latest_fiscal_year_end DESC);

CREATE INDEX IF NOT EXISTS idx_symbol_summaries_consecutive_dividend_years
  ON symbol_summaries(consecutive_dividend_years DESC);

CREATE INDEX IF NOT EXISTS idx_symbol_summaries_avg_roe_5y
  ON symbol_summaries(avg_roe_5y DESC);

CREATE INDEX IF NOT EXISTS idx_symbol_summaries_sales_cagr_5y
  ON symbol_summaries(sales_cagr_5y DESC);

CREATE INDEX IF NOT EXISTS idx_symbol_summaries_data_quality_score
  ON symbol_summaries(data_quality_score DESC);

CREATE TRIGGER IF NOT EXISTS trg_symbols_updated_at
AFTER UPDATE ON symbols
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE symbols
  SET updated_at = CURRENT_TIMESTAMP
  WHERE code = NEW.code;
END;

CREATE TRIGGER IF NOT EXISTS trg_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE users
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_symbol_daily_prices_updated_at
AFTER UPDATE ON symbol_daily_prices
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE symbol_daily_prices
  SET updated_at = CURRENT_TIMESTAMP
  WHERE symbol_code = NEW.symbol_code
    AND date = NEW.date;
END;

CREATE TRIGGER IF NOT EXISTS trg_symbol_splits_updated_at
AFTER UPDATE ON symbol_splits
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE symbol_splits
  SET updated_at = CURRENT_TIMESTAMP
  WHERE symbol_code = NEW.symbol_code
    AND date_split = NEW.date_split;
END;

CREATE TRIGGER IF NOT EXISTS trg_symbol_bookmarks_updated_at
AFTER UPDATE ON symbol_bookmarks
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE symbol_bookmarks
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_symbol_history_updated_at
AFTER UPDATE ON symbol_history
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE symbol_history
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_symbol_summaries_updated_at
AFTER UPDATE ON symbol_summaries
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE symbol_summaries
  SET updated_at = CURRENT_TIMESTAMP
  WHERE symbol_code = NEW.symbol_code;
END;
