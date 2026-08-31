# Shared preview port isolation for infocard-pub

When working in a multi-worker or multi-session `infocard-pub` environment, the standard preview port may already be serving another card or another worktree. Do not keep testing against a shared port if it returns the wrong page.

## Pattern
1. Verify the target URL directly with `curl -I` or browser navigation.
2. If the shared preview does not serve the current card, launch an isolated `live-server` instance on a spare port inside the current repo worktree.
3. Use that isolated URL for browser/CDP/screenshot verification until publish is complete.

## Known-good local preview shape
```bash
live-server --host=0.0.0.0 --port=5589 --no-browser .
```

## Why this matters
- Avoids cross-session contamination from another card or another task.
- Gives deterministic visual verification for the current worktree.
- Prevents accidental acceptance of a stale page from a shared preview service.
