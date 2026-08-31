# Nested index pages and missing-sidecar recovery

## What happened
A card at `docs/20260531-book-to-skill/index.html` was published, but the homepage index did not include it even though the HTML and report were committed and the repo-side `_index.yaml` had been rebuilt locally.

## Root cause
The repo’s index builder only scans `docs/**/*.meta.yaml`. The published card used a nested path (`docs/<slug>/index.html`), so the sidecar had to be named:

- `docs/<slug>/index.html.meta.yaml`

A sidecar named only `.meta.yaml` was invisible to the index builder and therefore silently excluded from both local and deployed `_index.yaml`.

## Recovery pattern
1. Put the sidecar next to the actual HTML basename.
2. Rebuild `_index.yaml` locally.
3. Verify the new slug appears in local `_index.yaml`.
4. Push and wait for GitHub Actions to complete.
5. Verify the public `/_index.yaml` now contains the slug before declaring success.

## Pitfalls
- Do not assume `docs/<slug>/.meta.yaml` is valid for nested `index.html` pages; it is not scanned.
- Do not stop at a successful git push. The public Pages `_index.yaml` can lag or fail separately.
- When the homepage count looks stale, verify the deployed raw `_index.yaml` with a cache-busting request.
