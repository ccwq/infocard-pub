# Theme gallery creation + publish workflow

Session note: adding a new `infocard-*-style` theme is a *theme-gallery* change, not a `docs/` card change.

## Canonical sequence
1. Create `theme/<slug>.html`.
2. Add the theme entry to `_themes.yaml`.
3. Rebuild the gallery with `python3 scripts/rebuild_themes.py`.
4. Verify `themes.html` includes:
   - a TOC copy entry for `infocard-<slug>-style`
   - a theme card block for the new slug
   - a preview iframe pointing at `./theme/<slug>.html`
5. Publish by committing/pushing only the theme file, `_themes.yaml`, and generated `themes.html`.

## Verification gates
- Local/LAN preview of `themes.html` renders the new theme card.
- Public `themes.html` returns `HTTP 200` and contains the slug text.
- Public `theme/<slug>.html` returns `HTTP 200` and contains the theme title.

## Pitfalls
- Do not treat `themes.html` as source of truth; `_themes.yaml` is the source.
- Do not expect `_index.yaml` / homepage search to change for theme-only work.
- If a local browser session is crowded, verify the page by fetching the live URL directly before assuming the iframe state is stale.
