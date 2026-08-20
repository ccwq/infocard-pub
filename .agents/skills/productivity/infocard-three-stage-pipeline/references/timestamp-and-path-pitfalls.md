# Timestamp and path pitfalls for infocard three-stage publishing

This reference captures non-transient lessons from the current conversation.

## 1) Timestamp format is strict
- `date` and `updated` must be Asia/Shanghai wall-clock timestamps:
  - `YYYY-MM-DD HH:MM:SS`
- Avoid:
  - date only (`YYYY-MM-DD`)
  - ISO strings (`2026-07-09T14:30:52+08:00`)
  - `T`, `Z`, or timezone suffixes
- When fixing a sidecar, rewrite both fields together.

## 2) Path/slug mismatch can be repaired if content is correct
- Sometimes agent2 writes the correct content but the slug/path pairing is slightly off.
- If the HTML body clearly matches the intended subject and the only issue is filename/slug/path alignment, the main thread may normalize the path before publishing.
- The publish report must explicitly mention that the path was corrected.

## 3) Verify failures should block release
- If `npm run verify` fails, stop.
- Do not continue to push or publish on a failed verification.

## 4) Pages/HTTP acceptance needs retries
- Use 3 retries with 10s / 30s / 60s spacing.
- Report the final failing node if all retries fail.

## 5) Meta shape warnings need interpretation
- Historical warnings may appear for old repository content.
- New artifact issues in `slug`, `path`, `date`, or `updated` should be fixed before release.
