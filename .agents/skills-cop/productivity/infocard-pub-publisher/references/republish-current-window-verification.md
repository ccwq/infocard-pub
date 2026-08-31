# Republish current-window verification

This note captures a recurring publish pattern:

## Trigger
The user says things like:
- “把时间切到当前”
- “重新调查最近 N 天的更新”
- “替换掉现在的内容发布”

Treat this as a **full republish of the same slug**, not a minor metadata tweak.

## Practical workflow
1. Recompute the evidence window from the current source of truth (usually the active remote branch or the latest authoritative repo state), not from the old card date.
2. Rewrite the card title and summary so the time window is explicit.
3. Update the `.meta.yaml` date to the current wall-clock time when the request is to publish the refreshed investigation, not to preserve the old publication timestamp.
4. Rebuild `_index.yaml` from sidecars; never hand-edit a conflicted manifest.
5. Verify the public HTML and `_index.yaml` separately, using cache-busting query strings when needed.
6. If browser-based verification is unavailable, fall back to direct HTTP fetches for the Pages URL and `_index.yaml`.

## Verification checklist
- Public detail page returns 200.
- Detail page title/body reflects the new window.
- Public `_index.yaml` contains the updated title for the slug.
- `git status` is clean after push.
