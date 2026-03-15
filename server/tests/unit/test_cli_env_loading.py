from pathlib import Path

import os

from capital_lens_ingest.cli import _parse_env_line, load_local_env_files


def test_parse_env_line_supports_comments_and_export() -> None:
    assert _parse_env_line(" # comment ") is None
    assert _parse_env_line("NO_EQUALS") is None
    assert _parse_env_line("KEY=value") == ("KEY", "value")
    assert _parse_env_line("export KEY2='quoted value'") == ("KEY2", "quoted value")


def test_load_local_env_files_reads_root_and_server(
    tmp_path: Path,
    monkeypatch,
) -> None:
    root_dir = tmp_path / "root"
    server_dir = root_dir / "server"
    root_dir.mkdir()
    server_dir.mkdir()

    (root_dir / ".env.local").write_text("EDINET_API_KEY=root_key\nA=1\n", encoding="utf-8")
    (server_dir / ".env.local").write_text("EDINET_API_KEY=server_key\nB=2\n", encoding="utf-8")
    (root_dir / ".env").write_text("C=3\n", encoding="utf-8")
    (server_dir / ".env").write_text("D=4\n", encoding="utf-8")

    monkeypatch.delenv("EDINET_API_KEY", raising=False)
    monkeypatch.delenv("A", raising=False)
    monkeypatch.delenv("B", raising=False)
    monkeypatch.delenv("C", raising=False)
    monkeypatch.delenv("D", raising=False)
    monkeypatch.setenv("B", "preset")

    loaded = load_local_env_files(root_dir=root_dir, server_dir=server_dir)

    assert loaded == [
        root_dir / ".env.local",
        server_dir / ".env.local",
        root_dir / ".env",
        server_dir / ".env",
    ]
    assert os.environ["EDINET_API_KEY"] == "root_key"
    assert os.environ["A"] == "1"
    assert os.environ["B"] == "preset"
    assert os.environ["C"] == "3"
    assert os.environ["D"] == "4"
