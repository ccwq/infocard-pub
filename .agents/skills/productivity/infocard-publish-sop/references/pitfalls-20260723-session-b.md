# Pitfalls — 2026-07-23 Session (Session B)

## P1 · Stale local branch blocks worktree branch creation

**Symptom**: `git worktree add /tmp/xxx origin/main` succeeds but `git checkout -b publish/xxx-20260723` fails with:

```
fatal: a branch named 'publish/xxx-20260723' already exists
```

**Root cause**: `git worktree remove --force` deletes the worktree directory but leaves the local branch ref intact. `git branch -a` still shows it. `checkout -b` refuses to create.

**Deterministic recovery**:

```bash
# From main repo:
git branch -D publish/xxx-20260723      # delete stale local branch FIRST
git worktree remove /tmp/xxx --force      # then remove worktree
git worktree add /tmp/xxx origin/main     # fresh worktree from main
cd /tmp/xxx
git checkout -b publish/xxx-20260723    # now succeeds
```

**Prevention checklist before creating worktree+branch**:
1. `git branch | grep publish/xxx`
2. `git branch -r | grep origin/publish/xxx`
3. Delete both if found

---

## P2 · Source file gone after worktree force-remove

**Symptom**: `cp /tmp/old/docs/card.html /tmp/new/docs/` → `cannot stat: No such file or directory`. The source file no longer exists.

**Root cause**: `git worktree remove --force` recursively deletes the entire worktree directory. Any file generated inside that worktree is gone. Cannot `cp` from a deleted directory.

**Prevention**: Never hold unreferenced files inside a worktree that may be force-removed. Options:
- Write HTML to a path outside any active worktree, then `cp` into the new one.
- Keep the worktree until after `commit + push + PR merge` is confirmed.
- If forced to recover: re-write the file content directly to the new worktree path (main thread takeover pattern).

---

## P3 · HAR/network-sniff fallback for SPA image enumeration (xhs-cdp-extract)

**Signal**: `agent-browser eval` sometimes returns fewer image URLs than the carousel actually contains, especially on subsequent visits or after scroll.

**Fallback: capture HAR traffic**

```bash
# Start Chrome with networking logging
google-chrome \
  --save-page-as-completed \
  --no-sandbox

# After page load, use CDP to capture Network.dataReceived
# Or: intercept XHR/fetch requests containing "xhscdn"
npx --yes agent-browser eval '
JSON.stringify(performance.getEntriesByType("resource")
  .filter(r => r.name.includes("xhscdn") && !r.name.includes("avatar"))
  .map(r => r.name))
'
```

**Key insight**: `performance.getEntriesByType("resource")` captures all loaded network resources including lazy-loaded carousel images that may not yet be in `document.querySelectorAll("img")`. Use it as a superset for image URL enumeration.

This supplements — not replaces — the DOM query approach. Merge both result sets, deduplicate by `notes_pre_post/<token>`.
