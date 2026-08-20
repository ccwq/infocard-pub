# Subagent timeout rescue & dist cleanup

## When to use
An infocard subagent times out after 600s — but the HTML/meta may already be on disk. Follow this flow before rewriting anything.

## Decision tree

```
timeout notification arrives
  → does docs/<slug>.html exist locally?
    → YES: test public URL
      → HTTP 200 → done, skip
      → HTTP 404 → main thread rescues: build / commit / push / verify
    → NO: check git status for untracked output
      → has untracked → rescue same way
      → nothing → project does not exist, stop
```

## Key patterns verified this session

- **Parallel subagents timeout but files land**: When multiple cards are dispatched together, even timed-out subagents can leave valid HTML/meta on disk. Always test HTTP first — never rewrite blindly.
- **ENOTEMPTY on dist/**: `npm run build` fails with `ENOTEMPTY, Directory not empty: .../dist`. Fix: `rm -rf dist && npm run build`. This is a publish idempotency issue, not an environment problem.
- **Parallel batch commit skip**: When main thread does `git add docs/20260709-X.*` and only some files commit, remaining files were already committed in a prior push. Test public URLs individually.
- **Dist dir stale between commits**: Build cleans `dist/`, writes new index. If `dist/` still has old content during `rm -rf dist && npm run build`, it's safe to delete.

## What NOT to capture
- Generic environment failures (missing binaries, command-not-found)
- One-off project narratives
- Negative claims about tools hardening into refusals
