# write_file Survives Hard Reset (2026-06-03 verified)

## Key Finding

`write_file` (the tool) creates real filesystem files on disk. These survive `git reset --hard origin/main` even when uncommitted.

`execute_code` writes to a sandboxed temp directory — those files DO NOT survive hard reset.

## Verified Flow (2026-06-03)

```
1. write_file creates docs/$SLUG/index.html + meta.yaml (disk, not git)
2. git push rejected (CI already pushed sync commit)
3. git rebase --abort
4. git reset --hard origin/main  →  git state gone, disk files INTACT
5. ls docs/$SLUG/  →  ✓ files still present
6. python3 scripts/rebuild_index.py && git add + commit + push  →  success
```

The flow fails (files disappear) only if files were in the git index but never written to disk — which can happen if a prior `git commit` was attempted but failed before files hit disk. In that case, just re-run `write_file` to recreate them.

## Implication

When publishing to `infocard-pub` with a potential hard reset in the path, always use `write_file` (not `execute_code`) for the HTML/meta files. This guarantees they survive the reset even if the commit fails before push.