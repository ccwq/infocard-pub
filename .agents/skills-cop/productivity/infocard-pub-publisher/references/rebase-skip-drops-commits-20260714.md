# git rebase --skip drops ENTIRE commits — not just index conflicts

**Date**: 2026-07-14  
**Context**: `git pull --rebase origin main` on infocard-pub conflicts on `_index.yaml` / `index.html` during rebase. Ran `git rebase --skip` → entire commit silently discarded.

## What happened

```bash
# commit 3a85e78 added 4 files:
#   _index.yaml  (generated artifact)
#   docs/20260714-jiangfangzhou-academic-fraud.html  (new card)
#   docs/20260714-jiangfangzhou-academic-fraud.html.meta.yaml  (new card)
#   index.html  (generated artifact)

git pull --rebase origin main
# CONFLICT in _index.yaml and index.html

git rebase --skip
# Result: "Successfully rebased" — but 3a85e78 is GONE from history.
# The HTML file was deleted from worktree.
```

**Root cause**: `--skip` skips the current rebasing commit entirely — not just the conflicting hunks. When the conflict is in a generated artifact (`_index.yaml`), the skip still discards the whole commit including unrelated new files.

## Recovery

```bash
# Find the dropped commit (it's still reachable via reflog)
git reflog | grep jiangfangzhou
# 3a85e78 feat: add jiangfangzhou academic fraud investigation card

# Restore files from dropped commit
git show 3a85e78:docs/20260714-jiangfangzhou-academic-fraud.html > docs/20260714-jiangfangzhou-academic-fraud.html
git show 3a85e78:docs/20260714-jiangfangzhou-academic-fraud.html.meta.yaml > docs/20260714-jiangfangzhou-academic-fraud.html.meta.yaml
```

## Safe pattern: resolve, don't skip

When `_index.yaml` / `index.html` conflict during rebase:

```bash
git pull --rebase origin main
# CONFLICT on _index.yaml and index.html

# CORRECT approach: resolve with dist/ artifacts
cp dist/_index.yaml _index.yaml
cp dist/index.html index.html
git add _index.yaml index.html
git rebase --continue   # ← continues, does NOT skip the commit

# WRONG approach (skipping drops unrelated new files):
git rebase --skip
```

The `dist/` directory always has the correct post-build state. Using it to resolve the conflict preserves the rebasing commit including all its file additions.

## Rule

**Never `git rebase --skip`** when the conflict is in `_index.yaml` or `index.html`. Always resolve with `cp dist/*.yaml . && git add . && git rebase --continue`.

## Related

- `references/rebase-index-overwritten-recovery-20260621.md` — related rebase recovery
- `references/git-untracked-block-pull-recovery-20260713.md` — untracked files blocking pull
