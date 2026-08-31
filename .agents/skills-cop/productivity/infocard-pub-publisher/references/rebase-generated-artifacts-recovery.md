# Rebase recovery for generated artifacts

Use this when a publish commit is rebased onto an updated `main` and the conflict set includes generated files such as `_index.yaml` or `index.html`.

## Symptom

- `git rebase origin/main` stops with conflicts in `_index.yaml` / `index.html`
- The worktree may show `UU` on generated artifacts after a build has been rerun during the rebase

## Recovery

1. Keep the card source files (`docs/<slug>.html`, `.meta.yaml`, assets) as the real payload.
2. For generated files, discard the conflicted merge state and take the current branch version:
   - `git checkout --ours _index.yaml index.html`
3. Rerun the generator:
   - `npm run build && npm run verify`
4. Stage the regenerated artifacts and resume the rebase:
   - `git add _index.yaml index.html docs/...`
   - `GIT_EDITOR=true git rebase --continue`

## Rule

Do not hand-merge generated index/homepage artifacts. If they conflict, regenerate them after resetting their merge state.
