from __future__ import annotations

import re
from dataclasses import dataclass
from io import BytesIO
from typing import Any
from urllib.parse import urljoin

import requests
import xlrd

from capital_lens_ingest.infrastructure.utils import normalize_symbol_code

JPX_INDEX_URL = "https://www.jpx.co.jp/markets/statistics-equities/misc/01.html"


@dataclass(slots=True)
class JpxSymbolRecord:
    code: str
    name: str
    platform: str
    metadata: dict[str, Any]


def is_common_stock_market(market_category: str) -> bool:
    text = market_category.strip()
    if not text:
        return False

    excluded_keywords = (
        "ETF",
        "ETN",
        "REIT",
        "ベンチャーファンド",
        "インフラファンド",
        "外国株式",
        "受益証券",
        "出資証券",
        "優先出資",
        "PRO Market",
    )
    if any(keyword in text for keyword in excluded_keywords):
        return False

    if "内国株式" in text:
        return True

    # Fallback for source data variants.
    return any(keyword in text for keyword in ("Prime", "Standard", "Growth"))


def normalize_jpx_cell(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def transform_jpx_record(record: dict[str, str]) -> JpxSymbolRecord | None:
    code = normalize_symbol_code(record.get("コード"))
    name = record.get("銘柄名", "").strip()
    market_category = record.get("市場・商品区分", "").strip()

    if not code or not name:
        return None
    if not is_common_stock_market(market_category):
        return None

    metadata: dict[str, Any] = {
        "market_category": market_category,
    }

    industry_code_17 = normalize_jpx_cell(record.get("17業種コード"))
    if industry_code_17 and industry_code_17 != "-":
        metadata["industry_code_17"] = industry_code_17.zfill(2)

    industry_code_33 = normalize_jpx_cell(record.get("33業種コード"))
    if industry_code_33 and industry_code_33 != "-":
        metadata["industry_code_33"] = industry_code_33.zfill(2)

    industry_name_17 = record.get("17業種区分", "").strip()
    if industry_name_17 and industry_name_17 != "-":
        metadata["industry_name_17"] = industry_name_17

    industry_name_33 = record.get("33業種区分", "").strip()
    if industry_name_33 and industry_name_33 != "-":
        metadata["industry_name_33"] = industry_name_33

    size_code = normalize_jpx_cell(record.get("規模コード"))
    if size_code and size_code != "-":
        metadata["size_code"] = size_code

    size_name = record.get("規模区分", "").strip()
    if size_name and size_name != "-":
        metadata["size_name"] = size_name

    return JpxSymbolRecord(
        code=code,
        name=name,
        platform="TSE",
        metadata=metadata,
    )


class JpxClient:
    def __init__(self, session: requests.Session | None = None) -> None:
        self.session = session or requests.Session()

    def resolve_latest_listing_url(self, source_index_url: str = JPX_INDEX_URL) -> str:
        response = self.session.get(source_index_url, timeout=30)
        response.raise_for_status()
        html = response.text

        matches = re.findall(r'href="([^"]+)"', html, flags=re.IGNORECASE)
        candidates = [
            urljoin(source_index_url, href)
            for href in matches
            if href.lower().endswith((".xls", ".xlsx", ".csv"))
        ]
        if not candidates:
            raise RuntimeError("JPX listing file link was not found.")

        preferred = [
            url
            for url in candidates
            if "data_j" in url.lower() or "meigara" in url.lower()
        ]
        return preferred[0] if preferred else candidates[0]

    def fetch_symbols(self, source_url: str | None = None) -> list[JpxSymbolRecord]:
        listing_url = source_url or self.resolve_latest_listing_url()
        response = self.session.get(listing_url, timeout=60)
        response.raise_for_status()

        workbook = xlrd.open_workbook(file_contents=BytesIO(response.content).read())
        sheet = workbook.sheet_by_index(0)

        headers = [normalize_jpx_cell(value) for value in sheet.row_values(0)]
        rows: list[JpxSymbolRecord] = []
        for row_index in range(1, sheet.nrows):
            values = [normalize_jpx_cell(value) for value in sheet.row_values(row_index)]
            record = {
                header: values[index] if index < len(values) else ""
                for index, header in enumerate(headers)
            }
            transformed = transform_jpx_record(record)
            if transformed is not None:
                rows.append(transformed)

        return rows
