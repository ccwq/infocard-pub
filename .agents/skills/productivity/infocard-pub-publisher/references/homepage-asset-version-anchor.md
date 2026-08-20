# Homepage asset-version anchor for infocard-pub

## When this matters

If a homepage redesign or taxonomy refactor changes `assets/home/index.js` / `assets/home/index.css`, GitHub Pages can still look unchanged even after a successful push.

## Root cause

The real deploy unit is not only the JS/CSS source files. The homepage shell must also point at the new asset version:

- `index.html`
  - `<meta name="generator" ...>`
  - `<meta name="version" ...>`
  - `assets/home/index.css?v=...`
  - `assets/home/index.js?v=...`
- `docs/version.json`

If source files changed but `index.html` still references the old `?v=...` query string, Pages serves the old cached asset and the user sees "no change".

## Safe release sequence

1. Edit homepage source files (`assets/home/index.js`, `assets/home/index.css`, etc.).
2. Generate a fresh Asia/Shanghai version stamp.
3. Update **both** homepage asset URLs in `index.html`.
4. Update `meta generator/version` in `index.html`.
5. Update `docs/version.json` changelog + version.
6. Run `npm run build && npm run verify`.
7. Commit the homepage source files **and** `index.html` + `docs/version.json` together.
8. After push, verify public homepage HTML references the expected version string before judging the redesign success.

## Public verification checklist

- Homepage HTML is `HTTP 200`
- Public `index.html` references the expected `assets/home/index.js?v=<new>` and `assets/home/index.css?v=<new>`
- Public `docs/version.json` matches the same version
- Only then inspect layout/interaction changes

## Why this belongs in the skill

This is not a generic GitHub Pages delay issue. It is a homepage-specific release pitfall: source changed, push succeeded, but the shell still points at stale assets so the user sees no difference.
