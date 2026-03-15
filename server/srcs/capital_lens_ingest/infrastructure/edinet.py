from __future__ import annotations

import csv
import io
import re
import time
import zipfile
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Any

import requests

from capital_lens_ingest.infrastructure.rate_control import (
    RequestThrottler,
    RetryPolicy,
    parse_retry_after_seconds,
    read_env_float,
    read_env_int,
)
from capital_lens_ingest.infrastructure.utils import normalize_sec_code

EDINET_API_BASE = "https://api.edinet-fsa.go.jp/api/v2"
EDINET_CODELIST_ZIP_URL = (
    "https://disclosure2dl.edinet-fsa.go.jp/searchdocument/codelist/Edinetcode.zip"
)

# Minimal mapping for commonly used securities filings. Unknown codes fall back.
DOC_TYPE_CODE_TO_SLUG: dict[str, str] = {
    "120": "annual_securities_report",
    "130": "semi_annual_securities_report",
    "140": "quarterly_securities_report",
    "150": "amended_annual_securities_report",
    "160": "amended_quarterly_securities_report",
    "170": "internal_control_report",
    "180": "amended_internal_control_report",
    "210": "extraordinary_report",
    "220": "amended_extraordinary_report",
    "230": "tender_offer_report",
    "240": "large_shareholding_report",
    "250": "amended_large_shareholding_report",
}


@dataclass(slots=True)
class FilingDocument:
    doc_id: str
    doc_type_code: str
    sec_code: str | None
    submit_date: date
    raw: dict[str, Any]


def doc_type_slug_from_code(doc_type_code: str | None) -> str:
    code = (doc_type_code or "").strip()
    if code in DOC_TYPE_CODE_TO_SLUG:
        return DOC_TYPE_CODE_TO_SLUG[code]
    if code:
        return f"unknown_docTypeCode_{code}"
    return "unknown_docTypeCode_missing"


def _sanitize_path_component(value: str) -> str:
    trimmed = value.strip()
    if not trimmed:
        return "unknown"
    normalized = re.sub(r"[^A-Za-z0-9._-]+", "_", trimmed)
    normalized = normalized.strip("._-")
    return normalized or "unknown"


def build_xbrl_output_dir(
    base_dir: Path,
    doc_type_slug: str,
    company_code: str,
    submit_date: date,
    doc_id: str,
) -> Path:
    return (
        base_dir
        / "edinet"
        / "xbrl"
        / _sanitize_path_component(doc_type_slug)
        / _sanitize_path_component(company_code)
        / submit_date.isoformat()
        / _sanitize_path_component(doc_id)
    )


def build_pdf_output_path(
    base_dir: Path,
    doc_type_slug: str,
    company_code: str,
    submit_date: date,
    doc_id: str,
) -> Path:
    return (
        base_dir
        / "edinet"
        / "pdf"
        / _sanitize_path_component(doc_type_slug)
        / _sanitize_path_component(company_code)
        / submit_date.isoformat()
        / f"{_sanitize_path_component(doc_id)}.pdf"
    )


def extract_edinet_code_map(csv_text: str) -> dict[str, str]:
    reader = csv.DictReader(io.StringIO(csv_text))
    mapping: dict[str, str] = {}
    for row in reader:
        edinet_code = (row.get("ＥＤＩＮＥＴコード") or row.get("EDINETコード") or "").strip()
        sec_code = normalize_sec_code(row.get("証券コード"))
        if not edinet_code or not sec_code:
            continue
        mapping[sec_code] = edinet_code
    return mapping


def safe_extract_zip(zip_bytes: bytes, output_dir: Path) -> None:
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as archive:
        for member in archive.infolist():
            destination = output_dir / member.filename
            resolved = destination.resolve()
            if output_dir.resolve() not in [resolved, *resolved.parents]:
                raise RuntimeError(f"Blocked zip path traversal entry: {member.filename}")
        archive.extractall(output_dir)


class EdinetClient:
    def __init__(
        self,
        api_key: str,
        session: requests.Session | None = None,
        min_request_interval_seconds: float | None = None,
        retry_policy: RetryPolicy | None = None,
    ) -> None:
        if not api_key:
            raise ValueError("EDINET API key is required.")
        self.api_key = api_key
        self.session = session or requests.Session()
        self.session.headers.update({"User-Agent": "capital-lens-ingest/0.1"})
        interval_seconds = (
            min_request_interval_seconds
            if min_request_interval_seconds is not None
            else read_env_float("EDINET_MIN_REQUEST_INTERVAL_SECONDS", 1.0, min_value=0.0)
        )
        self._throttler = RequestThrottler(min_interval_seconds=interval_seconds)
        self._retry_policy = retry_policy or RetryPolicy(
            max_attempts=read_env_int("EDINET_MAX_ATTEMPTS", 4, min_value=1),
            base_backoff_seconds=read_env_float(
                "EDINET_BACKOFF_BASE_SECONDS",
                1.0,
                min_value=0.0,
            ),
            max_backoff_seconds=read_env_float(
                "EDINET_BACKOFF_MAX_SECONDS",
                30.0,
                min_value=0.0,
            ),
        )

    def _should_retry_status(self, status_code: int) -> bool:
        return status_code in {429, 500, 502, 503, 504}

    def _get(
        self,
        url: str,
        *,
        params: dict[str, Any] | None = None,
        timeout: int = 60,
    ) -> requests.Response:
        attempts = self._retry_policy.max_attempts
        for attempt in range(1, attempts + 1):
            self._throttler.wait()
            try:
                response = self.session.get(url, params=params, timeout=timeout)
            except requests.RequestException:
                if attempt >= attempts:
                    raise
                time.sleep(self._retry_policy.backoff_seconds(attempt))
                continue

            if response.status_code < 400:
                return response

            if self._should_retry_status(response.status_code) and attempt < attempts:
                retry_after = parse_retry_after_seconds(response.headers.get("Retry-After"))
                time.sleep(
                    self._retry_policy.backoff_seconds(
                        attempt,
                        retry_after_seconds=retry_after,
                    )
                )
                continue

            response.raise_for_status()

        raise RuntimeError("EDINET request failed after retries.")

    def list_documents(self, target_date: date, list_type: int = 2) -> list[dict[str, Any]]:
        response = self._get(
            f"{EDINET_API_BASE}/documents.json",
            params={
                "date": target_date.isoformat(),
                "type": list_type,
                "Subscription-Key": self.api_key,
            },
            timeout=60,
        )
        payload = response.json()
        results = payload.get("results")
        if not isinstance(results, list):
            return []
        return [row for row in results if isinstance(row, dict)]

    def download_document(self, doc_id: str, doc_type: int) -> bytes:
        response = self._get(
            f"{EDINET_API_BASE}/documents/{doc_id}",
            params={"type": doc_type, "Subscription-Key": self.api_key},
            timeout=120,
        )
        return response.content

    def sync_edinet_codes(
        self,
        output_dir: Path,
        persist: bool = True,
    ) -> dict[str, str]:
        response = self._get(EDINET_CODELIST_ZIP_URL, timeout=120)

        zip_bytes = response.content
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as archive:
            csv_name = next(
                (name for name in archive.namelist() if name.lower().endswith(".csv")),
                None,
            )
            if not csv_name:
                raise RuntimeError("EDINET code list CSV was not found in the downloaded ZIP.")
            csv_bytes = archive.read(csv_name)

        csv_text = csv_bytes.decode("cp932")
        mapping = extract_edinet_code_map(csv_text)

        if persist:
            master_dir = output_dir / "edinet" / "masters"
            master_dir.mkdir(parents=True, exist_ok=True)
            (master_dir / "Edinetcode.zip").write_bytes(zip_bytes)
            (master_dir / "EdinetcodeDlInfo.csv").write_text(csv_text, encoding="utf-8")

        return mapping


def should_download_doc_type(row: dict[str, Any], doc_type: int) -> bool:
    flag_field_by_type = {
        1: "xbrlFlag",
        2: "pdfFlag",
        3: "attachDocFlag",
        4: "englishDocFlag",
        5: "csvFlag",
    }
    field = flag_field_by_type.get(doc_type)
    if not field:
        return True

    value = row.get(field)
    if value is None:
        return True
    return str(value).strip() == "1"


def filing_from_row(row: dict[str, Any], fallback_date: date) -> FilingDocument | None:
    doc_id = str(row.get("docID") or "").strip()
    if not doc_id:
        return None

    submit_raw = str(row.get("submitDateTime") or "").strip()
    submit_date = fallback_date
    if submit_raw:
        try:
            submit_date = date.fromisoformat(submit_raw[:10])
        except ValueError:
            submit_date = fallback_date

    sec_code = normalize_sec_code(row.get("secCode"))
    doc_type_code = str(row.get("docTypeCode") or "").strip()

    return FilingDocument(
        doc_id=doc_id,
        doc_type_code=doc_type_code,
        sec_code=sec_code,
        submit_date=submit_date,
        raw=row,
    )
