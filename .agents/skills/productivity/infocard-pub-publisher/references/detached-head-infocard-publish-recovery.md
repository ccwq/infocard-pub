# Detached HEAD publish recovery for infocard-pub

## Failure signature

This pattern appears during infocard publishing when a card is created while the repository is not on `main`:

- `git status -sb` shows `## HEAD (no branch)` or `rebasing main`.
- A local commit succeeds, but `git push origin main` is rejected or pushes the wrong ref, because `main` does not point at the detached commit.
- A recovery attempt uses `git reset --hard origin/main`, which deletes the just-created card files from the working tree.
- Repeating `write_file -> commit -> reset --hard` creates a loop where the card never reaches `origin/main`.

## Root cause

The new card commit exists only on detached `HEAD` / reflog. `git push origin main` refers to the local `main` branch, not the detached commit. `git reset --hard origin/main` then makes the working tree match the remote and removes any card files that exist only in the detached commit or working tree.

## Correct recovery

Do not force-push and do not keep hard-resetting the current worktree.

```bash
# 1. Abort any partial rebase state.
git rebase --abort 2>/dev/null || true

# 2. Find the orphan card commit.
git reflog --date=iso | grep '<slug-or-commit-message>'

# 3. Start from the real remote main.
git fetch origin
git checkout -B publish/<slug> origin/main

# 4. Refuse overwrite if files already exist.
test ! -e docs/<slug>.html
test ! -e docs/<slug>.html.meta.yaml

# 5. Recover only the card bundle from the orphan commit.
git checkout <orphan-commit> -- docs/<slug>.html docs/<slug>.html.meta.yaml

# 6. Rebuild generated artifacts and verify.
npm run build
npm run verify

# 7. Stage only this card bundle plus generated artifacts.
git add docs/<slug>.html docs/<slug>.html.meta.yaml _index.yaml index.html
git commit -m "feat: add <slug>"
GIT_HTTP_VERSION=HTTP/1.1 git push origin HEAD:main
```

## Prevention

Before writing a card or committing:

```bash
git fetch origin
git status -sb
git rev-parse --abbrev-ref HEAD
```

If the branch is `HEAD`, `(no branch)`, or a rebase is in progress, re-anchor first:

```bash
git rebase --abort 2>/dev/null || true
git checkout -B publish/<slug> origin/main
```

## Reporting discipline

If this failure happens, report the root cause once, then fix it. Do not repeatedly ask the user whether to continue after they have already instructed “continue / direct publish / 不要废话”.
