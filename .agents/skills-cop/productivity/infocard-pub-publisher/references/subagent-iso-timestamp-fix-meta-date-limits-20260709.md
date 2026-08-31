# ISO Timestamp `+08:00` Suffix: Meta Fix Limitations

## Symptom

After a subagent writes `meta.yaml`, the `date` and `updated` fields are written in ISO format with timezone suffix:
```yaml
date: "2026-07-09T12:07:59+08:00"
updated: "2026-07-09T12:07:59+08:00"
```

This is WRONG. The repo requires **Asia/Shanghai wall-clock format** (no T, no timezone suffix, quoted strings):
```yaml
date: '2026-07-09 12:07:59'
updated: '2026-07-09 12:07:59'
```

## Why `fix-meta-date.js` Doesn't Catch This

`fix-meta-date.js` uses `--date-source first` by default, which:
1. Only fills in **missing** `date`/`updated` fields
2. Does NOT overwrite or fix **existing** malformed values
3. The `force=false` mode (default) is specifically designed to leave valid-looking existing values alone

Since `"2026-07-09T12:07:59+08:00"` parses as a valid YAML timestamp, it passes the check.

## Fix (Subagent Prompt Prevention)

Every subagent prompt must include:
```
Time formatting rule: Use TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S" — output as single quoted string, e.g. date: '2026-07-09 12:07:59'. NEVER use ISO format (no T, no +08:00, no Z suffix).
```

## Fix (Main Thread Correction — Already Working)

The main thread already does this correctly:
```bash
# Detect
grep "T[0-9][0-9]:[0-9][0-9]:[0-9][0-9]" docs/TARGET.meta.yaml

# Fix via patch
patch(path, old_string='date: "2026-07-09T12:07:59+08:00"',
      new_string="date: '2026-07-09 12:07:59'")
```

## Pattern

This consistently happens when subagents use Python's `datetime.isoformat()` or JavaScript's `Date.toISOString()` instead of the shell `date` command with the explicit format string.

## Related

- Memory note: "meta.yaml时间戳：写时必须用 `TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S`（不写裸日期...）"
- The bare-date issue (unquoted `2026-07-09`) is already fixed for all 417 cards as of 2026-07-04
- ISO with timezone suffix (`+08:00`) is a different format and still slips through
