# Direct Main Agent Write vs. Subagent Delegation Decision Framework (2026-07-08)

## Core lesson

When the task is a **single self-contained infocard** (one slug, user-provided content fully specified, user explicitly says "主线程负责 build，不 commit/push"), the main agent should **write files directly** rather than dispatching a subagent. This avoids:

- Subagent 600s timeout causing rescue overhead
- Timestamp discipline issues (subagent clock vs. main agent clock)
- Concurrent write race conditions between main session and subagent
- Dirty/merged/conflicted worktree states interfering with delegation

## When direct write is correct (main agent owns file creation)

- User gave complete content structure (user provided素材)
- User explicitly said "不要 commit/push" or "那是主线程的工作"
- Single slug, no external research required beyond quick web search
- Main agent has all facts needed to write the HTML/meta files
- The `infocard-pub` repo is in any non-clean state (mid-rebase, dirty, conflicts)

## When subagent delegation is correct

- Multiple cards to produce in parallel (batch scenario)
- External research requires browser/CDP/extended web scraping
- User provided only a URL/repository link, not content
- Task involves cross-repo operations or wiki sync in the same turn

## Mid-rebase worktree behavior (empirical)

Even when `git status` shows:
```
* (no branch, rebasing refactor/ci-generated-index-artifacts)
UU index.html     # conflicted merge
M  .github/workflows/pages.yml
```

The `docs/` directory is **still fully writable**. `npm run build && npm run verify` run successfully because the build scripts only read from `docs/` and the generated `_index.yaml`/`index.html` can be written regardless of merge conflicts in other files.

**However**: committing and pushing while in this state is risky — the rebase might re-apply during push. The safe pattern is:
1. Write files to `docs/` (✅ safe even mid-rebase)
2. Run `npm run build && npm run verify` (✅ safe)
3. Hand off to main session thread for commit/push (the thread that will rebase/finish the rebase)

## Direct write pattern (confirmed working 2026-07-08)

```bash
# 1. Check repo state
REPO_ROOT="$(git rev-parse --show-toplevel)" || exit 1; cd "$REPO_ROOT" && git status --short | head -5

# 2. If docs/ is writable (usually is), write directly
write_file(path="docs/<slug>.html", content=<HTML>)
write_file(path="docs/<slug>.html.meta.yaml", content=<YAML>)

# 3. Build + verify
npm run build && npm run verify

# 4. Report completion to user — do NOT commit/push
#    (user said 主线程 handles commit/push)
```

## Anti-pattern to avoid

Do NOT dispatch a subagent for a single card when:
- User explicitly requested "不要 commit/push"
- The subagent would have to do everything the main agent could do in 1-2 tool calls
- The content is user-provided and self-contained

Subagent overhead (research → write → build → verify → potential timeout → rescue) far exceeds just writing the files directly in these cases.
