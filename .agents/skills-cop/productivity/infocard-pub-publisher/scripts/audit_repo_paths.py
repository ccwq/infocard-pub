#!/usr/bin/env python3
"""Fail when repo-local Skills contain executable fixed checkout paths."""
from __future__ import annotations

import json
import re
from pathlib import Path

from repo_root import RepoRootError, script_repo_root

LITERALS = (
    "project/" + "infocard-pub",
    "qbox/" + "open" + "dir",
    "hermes-data/home/" + "qbox/" + "open" + "dir",
)
HISTORICAL_LABEL = "历史现场值（不可复制执行）"
SHORT_CHECKOUT = re.compile(r"/home/[^/\s]+/infocard-pub(?:/|\b)")


def audit(skills_root: Path) -> list[dict[str, object]]:
    findings: list[dict[str, object]] = []
    for path in sorted(p for p in skills_root.rglob("*") if p.is_file()):
        if path.suffix not in {".md", ".py", ".sh", ".js", ".mjs"}:
            continue
        lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
        for index, line in enumerate(lines):
            fixed_path = any(literal in line for literal in LITERALS)
            if not fixed_path and not SHORT_CHECKOUT.search(line):
                continue
            is_reference = "references" in path.parts
            historical = is_reference and HISTORICAL_LABEL in line
            findings.append(
                {
                    "path": str(path.relative_to(skills_root)),
                    "line": index + 1,
                    "classification": "historical" if historical else "active",
                    "allowed": historical,
                }
            )
    return findings


def main() -> None:
    try:
        root = script_repo_root(__file__)
    except RepoRootError as exc:
        raise SystemExit(f"ERROR: {exc}") from exc
    findings = audit(root / ".agents" / "skills")
    print(json.dumps({"findings": findings}, ensure_ascii=False, indent=2))
    raise SystemExit(1 if any(not item["allowed"] for item in findings) else 0)


if __name__ == "__main__":
    main()
