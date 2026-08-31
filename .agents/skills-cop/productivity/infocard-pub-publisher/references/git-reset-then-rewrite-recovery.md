# Git Reset-Then-Rewrite Recovery Pattern

## Trigger

When `git pull --rebase` or `git push` fails with remote divergence AND manual conflict resolution is blocked by the size/complexity of `_index.yaml` conflicts.

## The Problem

The remote has new commits (e.g. CI auto-synced `_index.yaml` or another card). Local has unsynced changes to HTML/meta files. Rebase produces conflict markers in `_index.yaml` that are large and not worth hand-editing.

## Recovery Pattern (verified correct)

```
# Step 1: Abort the rebase
git rebase --abort

# Step 2: Hard reset to remote tip (discards local _index.yaml but keeps the HTML/meta files)
git reset --hard origin/main

# Step 3: Rewrite the files you need to republish
# (write_file the HTML + meta.yaml with the updated content)

# Step 4: Rebuild _index.yaml from all sidecars
python3 scripts/rebuild_index.py
python3 scripts/verify_index.py

# Step 5: Commit and push (now a clean fast-forward)
git add -A
git commit -m "your descriptive message"
git push
```

## Why This Works

- `git reset --hard origin/main` discards the bad local `_index.yaml` and the stale commit that conflicted
- The actual HTML/meta files are still on disk — they survive because they were committed in the stale commit before the reset
- After reset, rewrite HTML/meta files, rebuild `_index.yaml`, and push a clean commit
- No hand-editing of conflict markers needed

## Why `git pull --no-rebase` Fails Here Too

`git pull --no-rebase` (merge) also produces `_index.yaml` conflicts requiring hand-merging or abort. The reset-then-rewrite pattern is more reliable because it gives a clean slate.

## Key Files Surviving the Hard Reset

Only files that were **committed** survive `reset --hard origin/main`. If files were only `write_file`'d to disk but never committed, they disappear on reset.

**Safeguard**: Always commit HTML/meta before attempting any pull/rebase:

```bash
git add docs/20260602-skillopt-cookbook.html docs/20260602-skillopt-cookbook.html.meta.yaml
git commit -m "wip: expanding skillopt cookbook"
git push   # may fail but commits your files
```

Then reset is safe — committed files are retrievable from the local commit graph.

## Related

- `references/stale-commit-rebase-recovery.md` — for the stale orphan commit variant
- `references/infocard-pub-rebase-conflict-resolution.md` — index-level conflict resolution