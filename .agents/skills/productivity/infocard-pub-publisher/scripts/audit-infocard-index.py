#!/usr/bin/env python3
"""Audit infocard-pub card/index consistency.

Run from the infocard-pub repository root:
    python3 scripts/audit-infocard-index.py

Checks:
- every docs/*.html card (except docs/index.html redirect/support page) has a sidecar .meta.yaml
- every sidecar has required fields
- every sidecar path is present in _index.yaml
- every _index.yaml path exists
- duplicate slug/path entries
"""
from __future__ import annotations

import glob
import os
from collections import Counter
from pathlib import Path

import yaml

REQUIRED = ["slug", "path", "category", "title", "date", "tags"]
SUPPORT_HTML = {"docs/index.html"}

root = Path.cwd()
index_path = root / "_index.yaml"
if not index_path.exists():
    raise SystemExit("FAIL: _index.yaml not found; run from infocard-pub repo root")

htmls = sorted(p for p in glob.glob("docs/*.html") if p not in SUPPORT_HTML)
metas = sorted(glob.glob("docs/*.html.meta.yaml"))
index = yaml.safe_load(index_path.read_text(encoding="utf-8")) or {}
cards = index.get("cards", []) or []
indexed_paths = {c.get("path") for c in cards}
indexed_slugs = {c.get("slug") for c in cards}

missing_meta = [h for h in htmls if not Path(h + ".meta.yaml").exists()]
missing_required = []
not_indexed = []
for mf in metas:
    data = yaml.safe_load(Path(mf).read_text(encoding="utf-8")) or {}
    miss = [k for k in REQUIRED if k not in data]
    if miss:
        missing_required.append((mf, miss, list(data.keys())))
    if data.get("path") and data.get("slug"):
        if data["path"] not in indexed_paths and data["slug"] not in indexed_slugs:
            not_indexed.append((mf, data["slug"], data["path"]))

index_missing_files = [(c.get("slug"), c.get("path")) for c in cards if c.get("path") and not Path(c["path"]).exists()]
dup_slugs = [(k, v) for k, v in Counter(c.get("slug") for c in cards).items() if k and v > 1]
dup_paths = [(k, v) for k, v in Counter(c.get("path") for c in cards).items() if k and v > 1]

print(f"HTML_COUNT {len(htmls)}")
print(f"META_COUNT {len(metas)}")
print(f"INDEX_COUNT_FIELD {index.get('_count')}")
print(f"INDEX_CARDS_LEN {len(cards)}")
print(f"MISSING_META {len(missing_meta)}")
for item in missing_meta:
    print("  ", item)
print(f"META_MISSING_REQUIRED {len(missing_required)}")
for item in missing_required:
    print("  ", item)
print(f"META_NOT_INDEXED {len(not_indexed)}")
for item in not_indexed:
    print("  ", item)
print(f"INDEX_POINTS_TO_MISSING_FILE {len(index_missing_files)}")
for item in index_missing_files:
    print("  ", item)
print(f"DUP_SLUG {len(dup_slugs)} {dup_slugs}")
print(f"DUP_PATH {len(dup_paths)} {dup_paths}")

failed = any([missing_meta, missing_required, not_indexed, index_missing_files, dup_slugs, dup_paths])
if index.get("_count") != len(cards):
    print(f"COUNT_MISMATCH _count={index.get('_count')} cards={len(cards)}")
    failed = True
if len(metas) != len(cards):
    print(f"META_INDEX_COUNT_MISMATCH metas={len(metas)} cards={len(cards)}")
    failed = True

raise SystemExit(1 if failed else 0)
