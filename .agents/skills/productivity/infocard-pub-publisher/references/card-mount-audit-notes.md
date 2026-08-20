# Card mount audit notes

Session-derived checklist for answering: “is this specific infocard mounted on the homepage?”

## Quick verification order
1. Search `_index.yaml` for the exact `slug`.
2. Confirm the `path` in the matching card entry exists.
3. If the path is nested (for example `docs/<slug>/index.html`), treat it as a valid infocard path.
4. Exclude `docs/index.html` from card audits; it is a support/redirect page.
5. Only after the manifest check, verify the rendered homepage if the user specifically needs visual confirmation.

## Notes
- A card can be “present in the repo” yet still be invisible in the browser if the homepage is stale or cached.
- For repo-level audits, compare:
  - `docs/*.html.meta.yaml`
  - `_index.yaml.cards[]`
  - rendered homepage DOM

## Example from this session
- `20260529-yuque-investigation`
- `path: docs/20260529-yuque-investigation/index.html`
- This is a valid mounted card even though it is not a flat `docs/*.html` file.
