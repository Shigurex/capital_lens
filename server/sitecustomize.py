from __future__ import annotations

import sys
from pathlib import Path

SRCS_DIR = Path(__file__).resolve().parent / "srcs"
if SRCS_DIR.is_dir():
    srcs_path = str(SRCS_DIR)
    if srcs_path not in sys.path:
        sys.path.insert(0, srcs_path)
