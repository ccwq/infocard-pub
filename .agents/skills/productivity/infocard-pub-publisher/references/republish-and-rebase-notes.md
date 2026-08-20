# Re-release and rebase notes for infocard-pub

This note captures the reusable pattern that came up during a card re-publication session.

## When to use
- Re-publishing an already shipped infocard with a small visible version bump.
- The branch has diverged and `git push` is rejected with a non-fast-forward / fetch-first error.
- `git pull --rebase` stops because unrelated local changes are still present.
- `_index.yaml` hits a rebase conflict.

## Safe republish pattern
1. Make the smallest visible content change needed for a new deployment (for example, bump a version badge or updated label).
2. Stage only the card files and the generated index files that belong to the release.
3. If unrelated working-tree edits exist, stash them before rebasing.
4. Run `git pull --rebase`, then `git push`.
5. If `_index.yaml` conflicts, regenerate it from the full set of `docs/*.meta.yaml` files instead of hand-editing conflict markers.
6. Verify both:
   - raw GitHub source URL returns the new content
   - GitHub Pages URL returns HTTP 200

## `_index.yaml` conflict recovery
- Treat `_index.yaml` as derived state.
- On conflict, rebuild from source sidecars (`docs/*.html.meta.yaml`) and keep the newly generated ordering/count.
- Do not keep conflict markers or manually merge stale counts.

## Verification checklist
- raw.githubusercontent.com contains the new version marker or changed content.
- `https://ccwq.github.io/infocard-pub/docs/<slug>.html` returns 200.
- `https://ccwq.github.io/infocard-pub/_index.yaml` returns 200.
- The new slug appears in `_index.yaml`.

## Practical note
A lightweight version-badge bump is a safe way to force a meaningful republish when the content itself does not need substantive edits.