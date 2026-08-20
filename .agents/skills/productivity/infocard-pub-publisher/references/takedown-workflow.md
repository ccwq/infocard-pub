# Card takedown / deletion workflow

Use this when the user explicitly asks to delete/remove a published infocard and the target is unambiguous.

## What to remove
- the rendered card HTML
- the matching `.meta.yaml` sidecar
- any paired `report.md` or other source bundle files in the same slug directory
- empty directories left behind by the deletion

## Minimal execution pattern
1. Remove all artifacts for the slug together; do not delete only the HTML and leave the sidecar behind.
2. Rebuild the index from source metadata.
3. Run index verification.
4. Commit, then push.
5. If push is rejected because the remote advanced, rebase, regenerate `_index.yaml` if needed, continue the rebase, then push again.
6. Confirm the worktree is clean at the end.

## Practical notes
- For published infocards, deletion is a normal operator action when the user clearly requests it; do not add extra confirmation loops.
- If the repo uses a generated `_index.yaml`, treat it as derived state and rebuild it after deletion rather than hand-editing it.
- After a deletion commit, verify the repo is still internally consistent by rerunning the same index validation used for publishing.

## Example outcome to verify
- removed slug directory/files
- `_index.yaml` count decreased accordingly
- `git status --short` is empty after push