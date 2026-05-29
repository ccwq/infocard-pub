#!/usr/bin/env python3
import glob
import os

import yaml

REQUIRED_FIELDS = ["slug", "path", "category", "title", "date", "tags"]


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
            if card.get(key) != data.get(key):
                errors.append(
                    f"{meta_path}: field mismatch for {slug} -> {key}: meta={data.get(key)!r} index={card.get(key)!r}"
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
