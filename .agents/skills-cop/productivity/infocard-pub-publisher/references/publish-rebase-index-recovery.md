# Publish rebase / _index.yaml conflict recovery

This note captures the recovery pattern when publishing an infocard to `infocard-pub` and Git rejects the push because remote moved first.

## Symptoms
- `git push` is rejected with `fetch first`
- `git pull --rebase` stops on `_index.yaml` conflict
- working tree has unrelated local edits that block the rebase
- `git rebase --continue` opens an editor in a non-interactive shell

## Recovery pattern
1. **Stash unrelated edits first**
   - Stash only files not part of the publish to keep the release diff clean.
2. **Pull with rebase**
   - Rebase the publish commit on top of the new remote state.
3. **If `_index.yaml` conflicts, do not hand-edit markers**
   - Regenerate `_index.yaml` from all `docs/*.meta.yaml` sidecars.
   - Ensure the rebuilt file contains the new slug and the expected count.
4. **Stage the regenerated index and continue**
   - If `rebase --continue` needs a commit message in a dumb terminal, use `GIT_EDITOR=true git rebase --continue`.
5. **Push again**
   - Verify the raw HTML, raw meta, raw index, and public Pages URL after push.

## Why regenerate instead of manual merge
- The index is a derived artifact; merging conflict markers by hand risks dropping entries.
- Rebuilding from sidecars preserves every card and is less error-prone than patching the manifest line by line.

## Useful verification
- `grep` / raw fetch for the new slug in `_index.yaml`
- `curl -I` for the raw HTML and public Pages URL
- confirm the homepage index shows the new card after deploy
