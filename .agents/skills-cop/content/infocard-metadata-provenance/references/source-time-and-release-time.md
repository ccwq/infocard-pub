# Source time vs release time

Use this note when a card is built from X/status/API data and the timestamp meaning is ambiguous.

## Rules
- Upstream X/status APIs often emit the source post time in UTC.
- Convert the source time to Asia/Shanghai when you need a human-readable local time.
- In `infocard-pub`, the card metadata `date` / `updated` are the card's release/issuance timestamps, not the source post timestamp.
- When republishing a card, update `date` and `updated` to the current Asia/Shanghai wall-clock time unless the user explicitly wants archival/source-time preservation.
- If the source publication time matters, preserve it separately in the report or narrative as `source time`, not in the release timestamp fields.

## Verification
1. Read the upstream source timestamp.
2. Normalize it to Asia/Shanghai if you need to compare it with repo timestamps.
3. Rebuild `_index.yaml` and confirm homepage ordering/time display after the release timestamp update.
4. Re-check the public page after deployment.
