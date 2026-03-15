from datetime import date
from pathlib import Path

from capital_lens_ingest.infrastructure.edinet import (
    build_pdf_output_path,
    build_xbrl_output_dir,
    doc_type_slug_from_code,
)


def test_doc_type_slug_known_and_unknown() -> None:
    assert doc_type_slug_from_code("120") == "annual_securities_report"
    assert doc_type_slug_from_code("999") == "unknown_docTypeCode_999"


def test_build_edinet_paths() -> None:
    base = Path("/tmp/test-output")

    xbrl_dir = build_xbrl_output_dir(
        base_dir=base,
        doc_type_slug="annual_securities_report",
        company_code="7203",
        submit_date=date(2026, 3, 10),
        doc_id="S100AAAA",
    )
    pdf_path = build_pdf_output_path(
        base_dir=base,
        doc_type_slug="annual_securities_report",
        company_code="7203",
        submit_date=date(2026, 3, 10),
        doc_id="S100AAAA",
    )

    assert str(xbrl_dir).endswith(
        "edinet/xbrl/annual_securities_report/7203/2026-03-10/S100AAAA"
    )
    assert str(pdf_path).endswith(
        "edinet/pdf/annual_securities_report/7203/2026-03-10/S100AAAA.pdf"
    )
