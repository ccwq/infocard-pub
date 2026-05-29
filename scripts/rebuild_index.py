#!/usr/bin/env python3
import glob
import os
import subprocess
from datetime import datetime, timezone

import yaml

REQUIRED_FIELDS = ["slug", "path", "category", "title", "date", "tags"]


def git_commit_ts(path: str) -> int:
    try:
        out = subprocess.check_output(
            ["git", "log", "-1", "--format=%ct", "--", path],
            text=True,
        ).strip()
        return int(out) if out else 0
    except Exception:
        return 0


def load_entries():
    entries = []
    errors = []
    for meta_path in sorted(glob.glob("**/*.meta.yaml", recursive=True)):
        if ".git" in meta_path:
            continue
        with open(meta_path, "r", encoding="utf-8") as fp:
            data = yaml.safe_load(fp)
        if not isinstance(data, dict):
            errors.append(f"{meta_path}: not a YAML object")
            continue
        missing = [key for key in REQUIRED_FIELDS if key not in data]
        if missing:
            errors.append(f"{meta_path}: missing fields {', '.join(missing)}")
            continue
        card_path = data["path"]
        if not os.path.exists(card_path):
            errors.append(f"{meta_path}: target path missing -> {card_path}")
            continue
        item = dict(data)
        item["_sort_ts"] = git_commit_ts(meta_path)
        entries.append(item)
    return entries, errors


def main():
    entries, errors = load_entries()
    if errors:
        print("Index build failed:")
        for err in errors:
            print(f"- {err}")
        raise SystemExit(1)

    cards = sorted(
        entries,
        key=lambda x: (x.get("_sort_ts", 0), x.get("date", "")),
        reverse=True,
    )
    index = {
        "_count": len(cards),
        "_updated": datetime.now(timezone.utc).isoformat(),
        "cards": cards,
    }
    with open("_index.yaml", "w", encoding="utf-8") as fp:
        yaml.safe_dump(index, fp, allow_unicode=True, sort_keys=False)
    print(f"Index written: {len(cards)} cards")


if __name__ == "__main__":
    main()
