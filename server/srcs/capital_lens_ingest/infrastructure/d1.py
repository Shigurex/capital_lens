from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path
from typing import Any

from capital_lens_ingest.models import Target
from capital_lens_ingest.infrastructure.utils import expand_target, find_repo_root


class D1CommandError(RuntimeError):
    """Raised when wrangler d1 execute fails."""


class D1Executor:
    def __init__(self, repo_root: Path | None = None) -> None:
        self.repo_root = repo_root or find_repo_root(Path(__file__))

    def execute_write(self, sql: str, target: Target) -> None:
        for mode in expand_target(target):
            self._ensure_remote_token(mode)
            self._run(sql=sql, target=mode)

    def query(self, sql: str, target: Target) -> list[dict[str, Any]]:
        self._ensure_remote_token(target)
        result = self._run(sql=sql, target=target)
        if not result:
            return []

        payload = result[0]
        records = payload.get("results")
        if not isinstance(records, list):
            return []

        return [row for row in records if isinstance(row, dict)]

    def _run(self, sql: str, target: Target) -> list[dict[str, Any]]:
        command = [
            "pnpm",
            "exec",
            "wrangler",
            "d1",
            "execute",
            "DB",
            "--json",
            "--yes",
            f"--{target}",
            "--command",
            sql,
        ]
        process = subprocess.run(
            command,
            cwd=self.repo_root,
            capture_output=True,
            text=True,
            check=False,
        )
        if process.returncode != 0:
            message = process.stderr.strip() or process.stdout.strip()
            raise D1CommandError(f"wrangler d1 execute failed ({target}): {message}")

        stdout = process.stdout.strip()
        if not stdout:
            return []

        try:
            payload = json.loads(stdout)
        except json.JSONDecodeError as exc:
            raise D1CommandError(f"Failed to parse wrangler JSON output: {stdout}") from exc

        if not isinstance(payload, list):
            raise D1CommandError(f"Unexpected wrangler payload: {payload!r}")

        return payload

    @staticmethod
    def _ensure_remote_token(target: Target) -> None:
        if target != "remote":
            return
        if os.getenv("CLOUDFLARE_API_TOKEN"):
            return
        raise D1CommandError(
            "CLOUDFLARE_API_TOKEN is required for remote D1 execution."
        )
