from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from pathlib import Path
from typing import Literal

Target = Literal["local", "remote", "both"]


@dataclass(slots=True)
class CommonOptions:
    target: Target
    dry_run: bool
    batch_size: int


@dataclass(slots=True)
class DateRange:
    start: date
    end: date


@dataclass(slots=True)
class SymbolScope:
    symbols: list[str] | None = None
    symbols_file: Path | None = None
