#!/usr/bin/env python3
from datetime import date, datetime, timedelta, timezone
import re
from pathlib import Path

import yaml

REQUIRED_FIELDS = ["slug", "path", "category", "title", "date", "tags"]
DATE_ONLY_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
DATETIME_RE = re.compile(
    r"^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$"
)
SHANGHAI_TZ = timezone(timedelta(hours=8))


def file_mtime_ns(path: str) -> int:
    try:
        return Path(path).stat().st_mtime_ns
    except Exception:
        return 0


def latest_source_mtime_ns(*paths: str) -> int:
    ts_values = [file_mtime_ns(path) for path in paths if path]
    return max(ts_values) if ts_values else 0


def fmt_date(ts_ns: int) -> str:
    if not ts_ns:
        return ""
    return datetime.fromtimestamp(
        ts_ns / 1_000_000_000, tz=timezone.utc
    ).astimezone(SHANGHAI_TZ).strftime("%Y-%m-%d %H:%M:%S")


def normalize_date_value(value):
    if isinstance(value, datetime):
        if value.tzinfo is None:
            return value.replace(microsecond=0).strftime("%Y-%m-%d %H:%M:%S")
        return value.astimezone(SHANGHAI_TZ).strftime("%Y-%m-%d %H:%M:%S")
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
            return dt.astimezone(SHANGHAI_TZ).strftime("%Y-%m-%d %H:%M:%S")
        return raw
    return value


def load_entries():
    entries = []
    errors = []
    for meta_path in sorted(Path('docs').glob('**/*.meta.yaml')):
        if '.git' in str(meta_path):
            continue
        with meta_path.open('r', encoding='utf-8') as fp:
            data = yaml.safe_load(fp)
        if not isinstance(data, dict):
            errors.append(f"{meta_path}: not a YAML object")
            continue
        missing = [key for key in REQUIRED_FIELDS if key not in data]
        if missing:
            errors.append(f"{meta_path}: missing fields {', '.join(missing)}")
            continue
        card_path = data['path']
        if not Path(card_path).exists():
            errors.append(f"{meta_path}: target path missing -> {card_path}")
            continue
        item = dict(data)
        item["date"] = normalize_date_value(item["date"])
        sort_ts = latest_source_mtime_ns(str(meta_path), card_path)
        item['_sort_ts'] = sort_ts
        item['_modified_date'] = fmt_date(sort_ts)
        entries.append(item)
    return entries, errors


def main():
    entries, errors = load_entries()
    if errors:
        print('Index build failed:')
        for err in errors:
            print(f'- {err}')
        raise SystemExit(1)

    cards = sorted(
        entries,
        key=lambda x: (
            -int(x.get('_sort_ts', 0)),
            str(x.get('title', '')),
            str(x.get('slug', '')),
        ),
    )
    index = {
        '_count': len(cards),
        '_updated': datetime.now(timezone.utc).isoformat(),
        'cards': cards,
    }
    with open('_index.yaml', 'w', encoding='utf-8') as fp:
        yaml.safe_dump(index, fp, allow_unicode=True, sort_keys=False)
    print(f'Index written: {len(cards)} cards')


if __name__ == '__main__':
    main()
