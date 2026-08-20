# Stale commit during rebase recovery

## Symptom

During `git pull --rebase`, a commit you already superseded or a stale commit from a previously aborted rebase attempt reappears. It conflicts with the real new commit, blocking the rebase.

Example symptoms from this session:
```
Rebasing (1/2)
Auto-merging _index.yaml
CONFLICT (content): Merge conflict in _index.yaml
error: could not apply 5d971e7... feat: publish investigative report and info card for book-to-skill
```

The commit `5d971e7` was from a prior rebase attempt that was aborted — it should never have been in play.

## Root cause

When `git rebase --abort` is called after a conflict, Git restores the pre-rebase state. But if the working tree had already been modified (e.g., new files created and staged as part of the commit being rebased), those modifications may remain as an orphan commit in the local DAG after abort. On the next `git pull --rebase`, Git replays that orphan commit as if it were a real pending change.

## Recovery steps

1. **Identify the stale commit.** Look at the rebase output — if it's a commit hash you don't recognize as your most recent work, it's likely stale.

2. **Skip it.** The stale commit's work has already been superseded by your real commit:
   ```bash
   GIT_EDITOR=true git rebase --skip
   ```

3. **Handle remaining conflict normally.** After skipping the stale commit, the real commit will be applied. If it conflicts on `_index.yaml`:
   ```bash
   python3 scripts/rebuild_index.py
   git add _index.yaml
   GIT_EDITOR=true git rebase --continue
   ```

4. **Push.** Verify the push succeeds.

## Prevention

- After `git rebase --abort`, verify the working tree is clean (`git status`) before creating new commits.
- If you see 2+ commits being replayed when you expect only 1, the extra ones are likely stale — skip them.
- When in doubt, `git rebase --abort` and start fresh: `git stash`, `git pull`, `git stash pop`.

## Verification after recovery

- `git log --oneline -3` should show your latest commit on top.
- The remote should accept the push without rejection.
- Public Pages URL should be reachable with the new content.