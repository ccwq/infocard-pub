#!/usr/bin/env python3
"""Audit infocard-pub card files, sidecars, and _index.yaml consistency.
Run from the infocard-pub repository root.
"""
from __future__ import annotations

from collections import Counter
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from repo_root import RepoRootError, resolve_repo_path, script_repo_root

import yaml

REQUIRED = ["slug", "path", "category", "title", "date", "tags"]
SUPPORT_HTML = {"index.html"}

try:
    root = script_repo_root(__file__)
except RepoRootError as exc:
    raise SystemExit(f"ERROR: {exc}") from exc
index_path = root / "_index.yaml"
if not index_path.exists():
    raise SystemExit("ERROR: _index.yaml not found; run from infocard-pub repo root")

docs_dir = root / "docs"
htmls = [p for p in sorted(docs_dir.glob("*.html")) if p.name not in SUPPORT_HTML]
metas = sorted(docs_dir.glob("*.html.meta.yaml"))
index = yaml.safe_load(index_path.read_text(encoding="utf-8")) or {}
cards = index.get("cards", []) or []
indexed_paths = {c.get("path") for c in cards}
indexed_slugs = {c.get("slug") for c in cards}

missing_meta = [str(h.relative_to(root)) for h in htmls if not Path(f"{h}.meta.yaml").exists()]
missing_required = []
not_indexed = []

for mf in metas:
    data = yaml.safe_load(mf.read_text(encoding="utf-8")) or {}
    miss = [k for k in REQUIRED if k not in data]
    if miss:
        missing_required.append((str(mf), miss, list(data.keys())))
        continue
    if data.get("path") not in indexed_paths and data.get("slug") not in indexed_slugs:
        not_indexed.append((str(mf), data.get("slug"), data.get("path")))

index_missing_files = []
for c in cards:
    p = c.get("path")
    if p:
        try:
            target = resolve_repo_path(root, p)
        except RepoRootError:
            index_missing_files.append((c.get("slug"), p))
            continue
        if not target.exists():
            index_missing_files.append((c.get("slug"), p))

dup_slugs = [(k, v) for k, v in Counter(c.get("slug") for c in cards).items() if k and v > 1]
dup_paths = [(k, v) for k, v in Counter(c.get("path") for c in cards).items() if k and v > 1]

print(f"HTML_COUNT {len(htmls)}")
print(f"META_COUNT {len(metas)}")
print(f"INDEX_COUNT_FIELD {index.get('_count')}")
print(f"INDEX_CARDS_LEN {len(cards)}")
print(f"MISSING_META {len(missing_meta)}")
for item in missing_meta:
    print(f"  {item}")
print(f"META_MISSING_REQUIRED {len(missing_required)}")
for mf, miss, keys in missing_required:
    print(f"  {mf} missing={miss} keys={keys}")
print(f"META_NOT_INDEXED {len(not_indexed)}")
for item in not_indexed:
    print(f"  {item}")
print(f"INDEX_POINTS_TO_MISSING_FILE {len(index_missing_files)}")
for item in index_missing_files:
    print(f"  {item}")
print(f"DUP_SLUG {len(dup_slugs)} {dup_slugs[:10]}")
print(f"DUP_PATH {len(dup_paths)} {dup_paths[:10]}")

ok = not (missing_meta or missing_required or not_indexed or index_missing_files or dup_slugs or dup_paths)
ok = ok and index.get("_count") == len(cards) == len(metas)
print("OK" if ok else "FAIL")
raise SystemExit(0 if ok else 1)
