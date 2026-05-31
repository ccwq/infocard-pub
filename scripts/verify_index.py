#!/usr/bin/env python3
import glob
import os
import re
from datetime import date, datetime, timezone

import yaml

REQUIRED_FIELDS = ["slug", "path", "category", "title", "date", "tags"]
DATE_ONLY_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
DATETIME_RE = re.compile(
    r"^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$"
)


def normalize_date_value(value):
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(microsecond=0).strftime("%Y-%m-%d %H:%M:%S")
        return value.astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    if isinstance(value, date):
        return value.strftime("%Y-%m-%d")
    if isinstance(value, str):
        raw = value.strip().strip('"').strip("'")
        if DATE_ONLY_RE.fullmatch(raw):
            return raw
        if DATETIME_RE.fullmatch(raw):
            candidate = raw.replace(" ", "T", 1)
            dt = datetime.fromisoformat(candidate.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                return dt.replace(microsecond=0).strftime("%Y-%m-%d %H:%M:%S")
            return dt.astimezone(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        return raw
    return value


def main():
    meta_files = sorted(
        f for f in glob.glob("**/*.meta.yaml", recursive=True) if ".git" not in f
    )
    with open("_index.yaml", "r", encoding="utf-8") as fp:
        index = yaml.safe_load(fp)

    cards = index.get("cards") or []
    by_slug = {}
    errors = []

    for card in cards:
        if not isinstance(card, dict):
            errors.append("_index.yaml contains a non-object card entry")
            continue
        missing = [key for key in REQUIRED_FIELDS if key not in card]
        if missing:
            errors.append(
                f"index entry {card.get('slug', '<missing-slug>')}: missing fields {', '.join(missing)}"
            )
            continue
        slug = card["slug"]
        if slug in by_slug:
            errors.append(f"duplicate slug in _index.yaml: {slug}")
            continue
        by_slug[slug] = card
        if not os.path.exists(card["path"]):
            errors.append(f"index entry {slug}: missing target file {card['path']}")

    expected = []
    for meta_path in meta_files:
        with open(meta_path, "r", encoding="utf-8") as fp:
            data = yaml.safe_load(fp)
        if not isinstance(data, dict):
            errors.append(f"{meta_path}: not a YAML object")
            continue
        missing = [key for key in REQUIRED_FIELDS if key not in data]
        if missing:
            errors.append(f"{meta_path}: missing fields {', '.join(missing)}")
            continue
        expected.append((meta_path, data))

    for meta_path, data in expected:
        slug = data["slug"]
        if slug not in by_slug:
            errors.append(f"{meta_path}: slug {slug} missing from _index.yaml")
            continue
        card = by_slug[slug]
        for key in REQUIRED_FIELDS:
            meta_value = normalize_date_value(data.get(key)) if key == "date" else data.get(key)
            card_value = normalize_date_value(card.get(key)) if key == "date" else card.get(key)
            if card_value != meta_value:
                errors.append(
                    f"{meta_path}: field mismatch for {slug} -> {key}: meta={meta_value!r} index={card_value!r}"
                )

    if index.get("_count") != len(cards):
        errors.append(f"_count mismatch: header={index.get('_count')} actual={len(cards)}")
    if len(cards) != len(expected):
        errors.append(f"card count mismatch: index={len(cards)} meta={len(expected)}")

    if errors:
        print("Index verification failed:")
        for err in errors:
            print(f"- {err}")
        raise SystemExit(1)

    print(f"Index verification OK: {len(cards)} cards")


if __name__ == "__main__":
    main()
