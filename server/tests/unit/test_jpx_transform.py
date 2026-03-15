from capital_lens_ingest.infrastructure.jpx import (
    is_common_stock_market,
    transform_jpx_record,
)


def test_is_common_stock_market_accepts_domestic_common_stock() -> None:
    assert is_common_stock_market("プライム（内国株式）")
    assert is_common_stock_market("スタンダード（内国株式）")


def test_is_common_stock_market_rejects_etf() -> None:
    assert not is_common_stock_market("ETF・ETN")


def test_transform_jpx_record_builds_symbol_row() -> None:
    record = {
        "コード": "7203",
        "銘柄名": "トヨタ自動車",
        "市場・商品区分": "プライム（内国株式）",
        "17業種コード": "6",
        "33業種コード": "3700",
        "17業種区分": "輸送用機器",
        "33業種区分": "輸送用機器",
        "規模コード": "7",
        "規模区分": "TOPIX Large 70",
    }

    transformed = transform_jpx_record(record)

    assert transformed is not None
    assert transformed.code == "7203"
    assert transformed.name == "トヨタ自動車"
    assert transformed.platform == "TSE"
    assert transformed.metadata["industry_code_17"] == "06"
    assert transformed.metadata["industry_code_33"] == "3700"


def test_transform_jpx_record_skips_non_common_stock() -> None:
    record = {
        "コード": "1305",
        "銘柄名": "iFreeETF",
        "市場・商品区分": "ETF・ETN",
    }

    assert transform_jpx_record(record) is None
