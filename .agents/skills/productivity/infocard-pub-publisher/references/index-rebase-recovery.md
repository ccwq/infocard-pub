# _index.yaml rebase recovery recipe

Use this when a publish rebase or concurrent push creates an `_index.yaml` conflict.

## Safe recovery steps
1. Abort any attempt to manually resolve conflict markers in `_index.yaml`.
2. Regenerate `_index.yaml` from all `docs/*.meta.yaml` files in the repo.
3. Re-stage `docs/<slug>.html`, `docs/<slug>.html.meta.yaml`, and `_index.yaml` together.
4. Continue the rebase with a non-interactive editor setting if needed.
5. Verify:
   - raw GitHub file exists
   - Pages URL returns 200
   - `_index.yaml` contains the new slug

## Notes
- This keeps the manifest and the published page in sync.
- The regenerated `_index.yaml` should reflect the full repo, not only the files touched in the publish commit.
