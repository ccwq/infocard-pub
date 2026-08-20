#!/usr/bin/env python3
"""Rebuild _index.yaml from all *.meta.yaml files in the repo."""
import glob, subprocess, yaml
from datetime import datetime, timezone

REPO = "/home/ccwq/qbox/opendir/project/infocard-pub"

def main():
    entries = []
    for f in sorted(glob.glob("**/*.meta.yaml", recursive=True)):
        if ".git" in f:
            continue
        try:
            with open(f) as fp:
                data = yaml.safe_load(fp)
            # yaml.safe_load can return None for empty/invalid files
            if data is None or not isinstance(data, dict) or "slug" not in data:
                continue
        except Exception:
            continue
        try:
            ts = subprocess.check_output(
                ["git", "log", "-1", "--format=%ct", "--", f],
                text=True, cwd=REPO,
            ).strip()
            data["_sort_ts"] = int(ts) if ts else 0
        except Exception:
            data["_sort_ts"] = 0
        entries.append(data)

    index = {
        "_count": len(entries),
        "_updated": datetime.now(timezone.utc).isoformat(),
        "cards": sorted(
            entries,
            key=lambda x: (x.get("_sort_ts", 0), x.get("date", "")),
            reverse=True,
        ),
    }
    with open("_index.yaml", "w") as fp:
        yaml.safe_dump(index, fp, allow_unicode=True, sort_keys=False)
    print(f"Written: {len(entries)} cards")

if __name__ == "__main__":
    main()