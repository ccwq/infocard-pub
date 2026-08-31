# infocard-pub: Empty Listing Recovery

## Symptom
- GitHub Pages homepage shows empty state / 0 cards / no matches
- `ccwq.github.io/infocard-pub/` may load, but the list is blank or incomplete
- Raw source may still be present and correct

## What to check first
1. `_index.yaml` card count vs local `docs/*.meta.yaml` count
2. Whether every card has a valid `docs/*.html.meta.yaml` sidecar
3. Whether any sidecar is malformed and therefore silently skipped
4. Whether Pages is simply lagging behind raw content

## Recovery pattern
- If `_index.yaml` is truncated or stale, restore it from git history and rebuild
- If a card is missing from the index, inspect its `.meta.yaml` format first
- If the `.meta.yaml` is malformed, fix the schema, then rebuild the index
- If a data file is truly missing, recover it from git history before regenerating the manifest
- Push both the file fix and the rebuilt `_index.yaml` so the repo and Pages stay in sync

## Verification
- Raw URL contains the expected card titles / slugs immediately
- `_index.yaml` count matches the number of indexed sidecars
- Homepage shows the expected cards in order after Pages refreshes
- Do not treat a blank homepage as success until the manifest and card list both verify
