# Integration recovery

Use only after the isolated worktree has a valid content commit and `origin/main` advanced before push.

## Stash-before-rebase pattern (2026-07-19)

When `_index.yaml` and `index.html` are **modified but not staged** (`npm run build` ran in worktree but not yet committed), rebasing fails with "You have unstaged changes":

```
git stash push -m "build artifacts" -- _index.yaml index.html
git fetch origin main
git rebase origin/main
# rebase succeeds cleanly (generated files stashed)
# ... continue with push ...
```

If stash pop causes merge conflicts on generated files after rebase:
```
git checkout --theirs _index.yaml index.html   # take remote generated version
git add _index.yaml index.html
git commit --amend --no-edit   # amend merges generated files into rebased commit
git push
```

**Critical distinction**: `--theirs` on rebase = "incoming remote version" — correct for generated files. `--ours` = stale local generated files, always wrong.

If `rebase --continue` fails after resolving conflicts:
```
git rebase --abort
git checkout -b <branch-name> origin/main   # fresh branch from remote
git cherry-pick <old-commit-sha>           # apply the card commit
# then handle conflicts with checkout --theirs on generated files
```

## Worktree git remote may be wrong (2026-07-19)

If the worktree was created while another process was active (e.g., during a batch run), the worktree's `.git` file may point to the wrong bare repo. Verify before push:

```
git remote -v
# Expected: the repository's configured remote identity; local absolute paths are historical evidence only
# Wrong:   /tmp/pureslop-bare.git  or other stray paths
```

If wrong, stop and inspect the configured remote. Do not set `origin` to a machine-local absolute `.git` path.

The active repository root must contain `package.json` and `scripts/`; resolve it with `git rev-parse --show-toplevel`. Historical mirror paths are not executable instructions.

## New-file-first rebase pattern (2026-07-17)

When a new card's HTML + meta.yaml are written but **not yet committed** and `origin/main` has advanced:

```
git add docs/<slug>.html docs/<slug>.html.meta.yaml
git commit -m "feat: publish <title>"
git pull --rebase          # origin/main may have new index artifacts
# → _index.yaml and index.html may CONFLICT (both modified)
git checkout --theirs _index.yaml index.html   # take remote generated version
npm run build              # regenerate from clean remote base
git add _index.yaml index.html
git commit --amend --no-edit   # amend merges generated files into rebased commit
git push
```

Key insight: generated files (index artifacts) always conflict on rebase because both sides independently modified them. `checkout --theirs` + rebuild is always correct — never hand-merge generated JSON.

## Anti-pattern: cherry-pick is not the multi-card integration tool

A writing worktree may contain its own generated `_index.yaml`, `index.html`, and timestamps. Cherry-picking several such commits into another worktree creates predictable generated-file conflicts and may leave the publication worktree in an indeterminate state.

Correct patterns:
- **Single card:** fetch and rebase the writing worktree on fresh `origin/main`, regenerate affected artifacts, rerun gates, then push directly from that isolated worktree.
- **Multiple cards:** create one fresh integration/publish worktree from `origin/main`; copy only each card's bundle allowlist source artifacts; run one build to regenerate shared indexes; audit spillover; commit and push once.

Do not cherry-pick child commits containing independently generated shared artifacts. If a cherry-pick has already conflicted, abort it, verify the worktree state, and restart integration from a fresh remote base rather than hand-merging generated indexes.
