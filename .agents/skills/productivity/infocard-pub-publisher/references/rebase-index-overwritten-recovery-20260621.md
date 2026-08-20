# Rebase Conflict: Index Files Overwritten by --theirs → Rebuild + Amend

**Pattern confirmed**: 2026-06-21, `agent-loop-7-scenarios-method` card.

## Symptom

```
git pull --rebase  →  CONFLICT in _index.yaml and index.html
git checkout --theirs _index.yaml index.html  →  both restored to remote version
git rebase --continue  →  EDITOR unset error
git commit -m "..."  →  succeeds (detached HEAD)
git push  →  "fatal: not on a branch"
git push origin HEAD:main  →  succeeds BUT index still has old remote version
curl page → 404  (because _index.yaml doesn't include the new slug)
```

## Root Cause

`--theirs` in a rebase = the incoming (remote) version. Checkout `--theirs` restores the pre-rebase state of both files, which already lacks the new card. The rebase merge commit inherits this old state.

## Correct Recovery Sequence

```bash
# 1. Get back to a clean origin/main state
git fetch origin
git reset --hard origin/main   # throws away detached HEAD

# 2. Verify card files still exist (they were committed before the bad rebase)
ls docs/<slug>.html           # should be present

# 3. Rebuild to regenerate _index.yaml with the card included
npm run build
npm run verify                 # must pass

# 4. Commit the regenerated index (amend to avoid new diverging commit)
git add _index.yaml index.html
git commit --amend -m "resolve conflict + rebuild _index.yaml with <slug> card"

# 5. Force-push with lease (safe: we just verified against origin/main)
git push origin HEAD:main --force-with-lease

# 6. Wait for Pages, verify HTTP 200
sleep 55 && curl -s -o /dev/null -w "%{http_code}" "https://ccwq.github.io/infocard-pub/docs/<slug>.html"
```

## Prevention

After any `git stash && git pull --rebase && git stash pop`, always run:
```bash
npm run build && npm run verify
git add _index.yaml index.html
git commit --amend  # or new commit if not amending
```

Do NOT assume `--theirs` checkout of index files restores the correct state. It restores the **pre-conflict** state, which may already be stale.

## Related

- `references/remote-ahead-stash-rebase-push.md` — stash → rebase → pop → push pattern
- `references/publish-rebase-index-recovery.md` — index-only recovery
- `references/force-push-main-recovery.md` — full force-push prevention and recovery
