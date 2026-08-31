# Theme gallery visibility and push lag

## What this notes
A session-tested reminder for `infocard-pub` theme-gallery work:

- A new `infocard-*-style` theme only becomes visible on the gallery page after:
  1. `theme/<slug>.html` exists
  2. `_themes.yaml` includes the new entry
  3. `python3 scripts/rebuild_themes.py` regenerates `themes.html`
  4. the commit is pushed to `main`
  5. GitHub Pages finishes redeploying the repo

## Verification sequence

1. Verify local `themes.html` contains the new slug.
2. Verify the committed diff includes `_themes.yaml`, `themes.html`, and `theme/<slug>.html`.
3. Push to `main`.
4. After push, check the live gallery page for the new slug.
5. If the live page still does not show it, treat this first as Pages propagation lag, not as a theme-definition failure.

## Important boundary

- Theme-gallery work does **not** depend on `_index.yaml` or homepage search.
- Absence from the gallery page means the gallery pipeline is incomplete or still deploying, not that the theme is conceptually invalid.
- Do not confuse gallery visibility with `docs/` publish success.
