# Asset path rules for infocard-pub cards

Use this when a card embeds locally stored images from `docs/assets/images/`.

## Path resolution matrix

- `docs/{slug}.html` → use `assets/images/<file>`
- `docs/{slug}/index.html` → use `../assets/images/<file>`
- `docs/{a}/{slug}/index.html` → use `../../assets/images/<file>`

## Why it matters

The browser resolves `src` relative to the HTML file location, not the repository root. A common failure mode is using a path that looks correct in the repo but points to the wrong URL once deployed.

## Verification

1. Open the public detail page.
2. Confirm the image renders in `browser_vision`.
3. If the image is broken, check the `src` path first before blaming cache or Pages.
4. Re-check after a cache-busting query string if the HTML is correct but the old image still appears.

## Session note

This rule was reinforced while publishing a flat `docs/{slug}.html` X-status card whose poster image only rendered after changing the path to `assets/images/...`.