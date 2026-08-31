#!/usr/bin/env python3
"""Rebuild _index.yaml from all *.meta.yaml files in the active checkout."""
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parent))
from repo_root import RepoRootError, script_repo_root


def main():
    try:
        repo = script_repo_root(__file__)
    except RepoRootError as exc:
        raise SystemExit(f"ERROR: {exc}") from exc
    entries = []
    for f in sorted(repo.glob("**/*.meta.yaml")):
        if ".git" in f.parts:
            continue
        try:
            data = yaml.safe_load(f.read_text(encoding="utf-8"))
            if data is None or not isinstance(data, dict) or "slug" not in data:
                continue
        except Exception:
            continue
        try:
            ts = subprocess.check_output(
                ["git", "log", "-1", "--format=%ct", "--", str(f.relative_to(repo))],
                text=True, cwd=repo,
            ).strip()
            data["_sort_ts"] = int(ts) if ts else 0
        except Exception:
            data["_sort_ts"] = 0
        entries.append(data)
    index = {
        "_count": len(entries),
        "_updated": datetime.now(timezone.utc).isoformat(),
        "cards": sorted(entries, key=lambda x: (x.get("_sort_ts", 0), x.get("date", "")), reverse=True),
    }
    (repo / "_index.yaml").write_text(yaml.safe_dump(index, allow_unicode=True, sort_keys=False), encoding="utf-8")
    print(f"Written: {len(entries)} cards")


if __name__ == "__main__":
    main()
