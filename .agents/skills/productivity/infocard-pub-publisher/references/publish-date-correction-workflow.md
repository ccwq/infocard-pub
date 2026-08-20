# Publish date correction workflow

## When this matters
Use this when a card is already published and the date shown in the URL/title/footer/meta is wrong.

## Durable rule
- Prefer keeping the existing slug/path unless the user explicitly asks for a URL change.
- Fix the sidecar metadata first: `date` and `updated` should match the intended publish wall clock in Asia/Shanghai (UTC+8).
- Then update any visible date strings inside the HTML itself (e.g. footer, hero timestamp, download filename) so the public page does not contradict the metadata.
- Rebuild, verify, commit, and push the whole bundle together so `_index.yaml`, `index.html`, the HTML page, and the meta file stay in sync.

## Common mistake
Changing the page body but leaving the filename/date in the footer or download handler untouched. That makes the page look fixed locally while the published artifact still carries the old date in one or more places.

## Verification checklist
- Detail page shows the corrected date.
- `_index.yaml` contains the corrected `date`/`updated`.
- Homepage search still finds the card.
- Worktree is clean after push.
