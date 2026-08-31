# Local asset paths for `docs/*.html`

Session-learned rule for infocard-pub publish flows that embed local images.

## Rule

If the HTML file lives **directly under `docs/`** like:

- `docs/YYYYMMDD-slug.html`

then local assets should be referenced as:

- `assets/...`

not `../assets/...`.

Use `../assets/...` **only** when the HTML itself is nested one level down, such as:

- `docs/YYYYMMDD-slug/index.html`

## Why

`docs/YYYYMMDD-slug.html` and `docs/assets/...` share the same `docs/` base directory, so the asset path is relative to the HTML file itself, not to a hypothetical subdirectory.

## Common failure modes

1. **Wrong relative prefix**
   - broken: `../assets/images/slug/hero.svg`
   - correct: `assets/images/slug/hero.svg`

2. **Wrong file extension**
   - broken: HTML points to `.png`
   - actual file is `.svg` (or vice versa)
   - always match the real localized asset filename exactly

3. **HTML/asset path mismatch after localization**
   - if you `cp` an image into `docs/assets/images/<slug>/hero.svg`, the HTML must reference the same filename and extension

## Verification

After changing the path, always:

1. run `npm run build && npm run verify`
2. push
3. wait for Pages
4. load the page and confirm the image is not rendered as a broken image icon

## Useful pattern

For flat cards, prefer:

```html
<img src="assets/images/20260620-example/hero.svg" alt="..." />
```

For nested cards, prefer:

```html
<img src="../assets/images/20260620-example/hero.svg" alt="..." />
```

## Notes from this session

- A flat `docs/*.html` card failed because it used `../assets/...` instead of `assets/...`.
- Another broken image happened because the HTML referenced `.png` while the actual localized file was `.svg`.
- The fix was to keep the asset folder slug-shaped and match the real extension exactly.
