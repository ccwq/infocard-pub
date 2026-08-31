# Meta desc mandatory gate — 2026-07-08

## What happened
A publish batch produced three cards whose HTML rendered correctly, but the homepage summary line was blank because the sidecar `.meta.yaml` files were missing `desc`.

Affected slugs:
- `20260708-entire-cli`
- `20260708-awesome-design-md`
- `20260708-last30days-skill`

A later build gate also revealed a historical backlog card missing `desc`:
- `20260704-memvid`

## Durable lesson
For infocard publishing, `desc` is not optional metadata. It must be treated as a required publishing field, not a cosmetic summary.

## Fix pattern
1. Add `desc` to every new `.meta.yaml`.
2. Ensure the value is non-empty, not just present.
3. Make the build/index step fail fast if `desc` is missing or blank.
4. Backfill any historical cards uncovered by the stricter gate before re-running build.

## Verification
After the gate landed, `_index.yaml` had 0 cards with empty `desc`.
