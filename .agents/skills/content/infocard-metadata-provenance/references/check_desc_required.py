#!/usr/bin/env python3
"""Check infocard meta sidecars for required desc field.

Usage:
  python3 references/check_desc_required.py [docs_dir]

Rules:
- Walk *.meta.yaml files under docs_dir (default: docs/).
- Print any sidecars where desc/description is missing or empty.
- Exit 1 if violations exist.
"""

from __future__ import annotations

import pathlib
import sys

import yaml


def main() -> int:
    root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "docs")
    bad: list[str] = []
    for meta in sorted(root.rglob("*.meta.yaml")):
        try:
            data = yaml.safe_load(meta.read_text(encoding="utf-8")) or {}
        except Exception as exc:  # pragma: no cover
            bad.append(f"{meta}: YAML parse error: {exc}")
            continue
        desc = (data.get("desc") or data.get("description") or "").strip()
        if not desc:
            bad.append(f"{meta}: missing desc")
    if bad:
        for line in bad:
            print(line)
        return 1
    print(f"OK: {len(list(root.rglob('*.meta.yaml')))} meta files have desc")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
