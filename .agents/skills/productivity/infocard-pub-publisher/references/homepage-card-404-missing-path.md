# Homepage card 404 from missing `path` in index

## Trigger
Use this when the `infocard-pub` homepage renders a card, but clicking one result opens GitHub Pages 404.

## Symptom
- `https://ccwq.github.io/infocard-pub/` loads normally.
- A specific list item is visible on the homepage.
- Clicking it navigates to a 404 or a slug-only fallback URL.
- `_index.yaml` entry for that card has `slug`, `category`, `title`, `date`, `tags`, but no `path`.

## Root cause
The homepage link builder depends on `path`. If an entry lacks `path`, the client may fall back to an invalid slug-derived URL even though the actual HTML file exists under `docs/`.

Usually both places need fixing:
- `docs/<slug>.html.meta.yaml`
- `_index.yaml`

## Minimal repair flow
1. Identify the broken homepage item and expected HTML path.
2. Confirm the file exists locally, e.g. `docs/<slug>.html`.
3. Patch the sidecar to include:
   ```yaml
   path: docs/<slug>.html
   ```
4. Patch the corresponding `_index.yaml` card entry with the same `path`.
5. Validate locally that every index card has a non-empty `path` and the path exists.
6. Commit only the sidecar + `_index.yaml` minimal diff when possible.
7. Push and verify:
   - homepage `200`
   - `_index.yaml` contains `path: docs/<slug>.html`
   - target card URL `200`
   - browser/CDP-rendered homepage second/target link points to the fixed URL
   - clicking the homepage item opens the target card, not 404

## Pitfall: avoid unnecessary full index rebuilds
If the current `_index.yaml` order uses workflow/runtime `_sort_ts`, a local full rebuild can reorder many entries because local git timestamps differ. For a one-card missing-path 404, prefer a minimal two-line repair over regenerating the whole index.

If a full rebuild is required, expect unrelated diff churn and audit it carefully before committing.

## Pitfall: `docs/index.html`
`docs/index.html` may be a PWA/legacy redirect fallback and not a publishable card. A naive `docs/*.html` vs `docs/*.meta.yaml` audit can report it as missing meta. Treat it as an exception unless the repo conventions change.
