INSERT INTO users (id, name, email, icon)
VALUES
  ('user_test_1', 'Test User', 'test1@example.com', 'https://example.com/avatar1.png'),
  ('user_test_2', 'Demo User', 'test2@example.com', 'https://example.com/avatar2.png');

INSERT INTO symbols (code, platform, metadata, name)
VALUES
  ('7203', 'TSE', '{"industry_code_17":"06","industry_code_33":"3700"}', 'Toyota Motor'),
  ('6758', 'TSE', '{"industry_code_17":"13","industry_code_33":"3650"}', 'Sony Group'),
  ('8306', 'TSE', '{"industry_code_17":"16","industry_code_33":"8350"}', 'Mitsubishi UFJ Financial Group');

INSERT INTO symbol_daily_prices (symbol_code, date, open, close, high, low, volume)
VALUES
  ('7203', '2026-03-05', 2785.0, 2812.5, 2824.0, 2771.5, 12500400),
  ('6758', '2026-03-05', 14320.0, 14510.0, 14580.0, 14290.0, 5342100),
  ('8306', '2026-03-05', 1820.5, 1836.0, 1842.5, 1811.0, 18944300);

INSERT INTO symbol_splits (symbol_code, date_split, ratio)
VALUES
  ('7203', '2024-10-01', 2.0),
  ('6758', '2023-10-01', 5.0);

INSERT INTO symbol_bookmarks (id, user, symbol_code)
VALUES
  ('bookmark_test_1', 'user_test_1', '7203'),
  ('bookmark_test_2', 'user_test_1', '6758'),
  ('bookmark_test_3', 'user_test_2', '8306');

INSERT INTO symbol_history (id, user, symbol_code, viewed_at)
VALUES
  ('history_test_1', 'user_test_1', '7203', '2026-03-06 09:00:00'),
  ('history_test_2', 'user_test_1', '6758', '2026-03-06 09:30:00'),
  ('history_test_3', 'user_test_1', '7203', '2026-03-06 15:10:00'),
  ('history_test_4', 'user_test_2', '8306', '2026-03-06 10:15:00');

INSERT INTO symbol_summaries (
  symbol_code,
  latest_fiscal_year_end,
  latest_fiscal_year_source,
  latest_fiscal_year_doc_id,
  latest_net_sales,
  latest_operating_income,
  latest_profit_loss,
  latest_total_assets,
  latest_net_assets,
  latest_return_on_equity,
  latest_equity_to_asset_ratio,
  latest_earnings_per_share,
  latest_earnings_per_share_adjusted,
  latest_dividend_per_share,
  latest_dividend_per_share_adjusted,
  consecutive_dividend_years,
  sales_cagr_3y,
  sales_cagr_5y,
  avg_roe_3y,
  avg_roe_5y,
  avg_operating_margin_3y,
  avg_operating_margin_5y,
  avg_dividend_payout_ratio_3y,
  avg_dividend_payout_ratio_5y,
  latest_high_price,
  latest_low_price,
  latest_dividend_yield_high,
  latest_dividend_yield_low,
  data_quality_score,
  available_years_count,
  has_edinet_data
)
VALUES
  (
    '7203',
    '2025-03-31',
    'financials',
    'doc_toyota_2025',
    45500000,
    5100000,
    4300000,
    92000000,
    31000000,
    13.9,
    33.7,
    402.15,
    398.44,
    90.0,
    88.5,
    15,
    8.4,
    7.1,
    12.9,
    12.3,
    11.2,
    10.8,
    28.0,
    29.4,
    2824.0,
    2771.5,
    3.19,
    3.25,
    96.5,
    5,
    1
  ),
  (
    '6758',
    '2025-03-31',
    'financials_irbank',
    NULL,
    13100000,
    1210000,
    980000,
    31000000,
    8700000,
    11.4,
    28.1,
    745.2,
    742.9,
    95.0,
    95.0,
    6,
    5.2,
    4.4,
    10.7,
    10.1,
    9.6,
    9.1,
    21.5,
    22.0,
    14580.0,
    14290.0,
    0.65,
    0.66,
    88.0,
    5,
    1
  ),
  (
    '8306',
    '2025-03-31',
    'financials',
    'doc_mufg_2025',
    9800000,
    0,
    1490000,
    402000000,
    19800000,
    8.1,
    4.9,
    184.2,
    184.2,
    64.0,
    64.0,
    9,
    6.1,
    5.8,
    7.4,
    7.0,
    0.0,
    0.0,
    34.7,
    35.2,
    1842.5,
    1811.0,
    3.47,
    3.53,
    84.0,
    5,
    1
  );
