from __future__ import annotations

import re
from datetime import date, timedelta
from pathlib import Path
from typing import Iterable, Iterator

from capital_lens_ingest.models import Target


def find_repo_root(start: Path) -> Path:
    current = start.resolve()
    for candidate in [current, *current.parents]:
        if (candidate / "wrangler.toml").exists() and (candidate / "package.json").exists():
            return candidate
    raise FileNotFoundError("Could not locate repository root containing wrangler.toml")


def chunked[T](items: Iterable[T], chunk_size: int) -> Iterator[list[T]]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than 0")

    chunk: list[T] = []
    for item in items:
        chunk.append(item)
        if len(chunk) >= chunk_size:
            yield chunk
            chunk = []
    if chunk:
        yield chunk


def normalize_symbol_code(raw: object) -> str | None:
    if raw is None:
        return None

    text = str(raw).strip()
    if not text or text == "-":
        return None

    if text.endswith(".0") and text.replace(".", "", 1).isdigit():
        text = text[:-2]

    normalized = re.sub(r"[^0-9A-Za-z]", "", text).upper()
    return normalized or None


def normalize_sec_code(raw: object) -> str | None:
    normalized = normalize_symbol_code(raw)
    if not normalized:
        return None

    digits = re.sub(r"\D", "", normalized)
    if len(digits) >= 4:
        return digits[:4]

    return None


def parse_symbols_text(raw: str) -> list[str]:
    pieces = re.split(r"[\s,]+", raw.strip())
    symbols: list[str] = []
    seen: set[str] = set()
    for piece in pieces:
        if not piece:
            continue
        normalized = normalize_symbol_code(piece)
        if not normalized or normalized in seen:
            continue
        symbols.append(normalized)
        seen.add(normalized)
    return symbols


def read_symbols_file(path: Path) -> list[str]:
    return parse_symbols_text(path.read_text(encoding="utf-8"))


def iterate_dates(start: date, end: date) -> Iterator[date]:
    current = start
    while current <= end:
        yield current
        current += timedelta(days=1)


def expand_target(target: Target) -> list[Target]:
    if target == "both":
        return ["local", "remote"]
    return [target]


def read_target(target: Target) -> Target:
    if target == "both":
        return "local"
    return target
