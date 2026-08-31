# Nested `docs/<slug>/index.html` sidecar recovery

## Problem observed
When a card is published as:
- `docs/<slug>/index.html`
- `docs/<slug>/index.html.meta.yaml`

then a plain `docs/<slug>/.meta.yaml` or `docs/<slug>/meta.yaml` will be ignored by the index scanner. The detail page can be live while `_index.yaml` stays stale or the card is omitted entirely.

## Required fields
The sidecar must include at least:
- `slug`
- `path`
- `category`
- `title`
- `date`
- `tags`

Missing `slug` or `path` causes `scripts/rebuild_index.py` to fail or exclude the card.

## Recovery sequence
1. Confirm the actual HTML path.
2. Rename/create the sidecar as `index.html.meta.yaml` in the same folder.
3. Fill in `slug` and `path` to match the nested HTML file.
4. Rebuild and verify `_index.yaml`.
5. Verify the public detail page and homepage entry both exist.

## Example
- HTML: `docs/20260601-example/index.html`
- Sidecar: `docs/20260601-example/index.html.meta.yaml`
- `path`: `docs/20260601-example/index.html`
- `slug`: `20260601-example`
