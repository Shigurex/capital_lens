from typing import Any

from capital_lens_ingest.infrastructure.d1 import D1Executor


def test_execute_write_both_calls_local_and_remote(monkeypatch) -> None:
    called_targets: list[str] = []

    def fake_run(self: D1Executor, sql: str, target: str) -> list[dict[str, Any]]:
        called_targets.append(target)
        return []

    monkeypatch.setenv("CLOUDFLARE_API_TOKEN", "dummy-token")
    monkeypatch.setattr(D1Executor, "_run", fake_run)

    d1 = D1Executor()
    d1.execute_write("SELECT 1;", target="both")

    assert called_targets == ["local", "remote"]
