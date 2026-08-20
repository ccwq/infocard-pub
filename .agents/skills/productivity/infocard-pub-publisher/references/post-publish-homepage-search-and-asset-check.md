# Post-publish homepage search and asset check

This note captures the verification pattern that worked for repo-backed info cards with embedded images and a client-rendered homepage.

## Recommended post-publish sequence

1. `npm run build`
2. `npm run verify`
3. Commit the generated index artifacts together with the card bundle (`docs/{slug}.html`, `docs/{slug}.html.meta.yaml`, `docs/{slug}/report.md`, assets, `_index.yaml`, `index.html` when build mutates them)
4. Push to `main`
5. Wait 70–90 seconds for GitHub Pages propagation
6. Verify the detail page returns HTTP 200
7. Use the homepage search box to confirm the title keyword returns exactly one result
8. If the homepage is client-rendered, confirm the visible row matches the intended title and release time, not just the raw meta
9. Check `git status --short` is clean

## Asset verification pattern

For cards that embed external screenshots, logos, or diagrams:

- Prefer local copies under `docs/assets/images/<slug>/`
- Verify the live page exposes the expected images via `browser_get_images()` or equivalent DOM inspection
- Use browser console DOM checks to confirm `document.images` are loaded (`complete && naturalWidth > 0`)
- For narrow/mobile acceptance, confirm `scrollWidth === innerWidth` at the target viewport

## Useful browser-console probes

```js
JSON.stringify({
  innerWidth: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  imagesLoaded: [...document.images].every(i => i.complete && i.naturalWidth > 0),
  imageCount: document.images.length,
  searchHits: [...document.querySelectorAll('a')].filter(a => a.href.includes('SLUG_OR_KEYWORD')).length,
})
```

When the homepage is searchable by title, the search box is part of acceptance; when the page is image-backed, image load is part of acceptance.
