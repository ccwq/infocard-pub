# Mobile infocard repair notes

## Session takeaway: desktop-looking page that is actually mobile-broken

A page can appear acceptable on desktop while still failing mobile because the root layout is locked to a fixed width and the viewport meta tag is missing.

### Case pattern
- `html, body { width: 780px; }` or similar hardcoded root width
- no `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
- mobile screenshot looks like a shrunken desktop page
- text is technically present, but too small to read comfortably

### What to verify
- `document.querySelector('meta[name="viewport"]')?.content`
- `window.innerWidth` vs `document.body.scrollWidth`
- `document.documentElement.clientWidth`
- computed font sizes for body/title/table text

### Fix pattern
1. Add viewport meta.
2. Replace hardcoded root width with `width: 100%; max-width: 780px;`.
3. Add `overflow-x: hidden` at the page root.
4. Collapse multi-column sections to one column under ~720px.
5. Convert wide tables to stacked rows on narrow screens.
6. Recheck on a 390px-wide device emulation and confirm the page is readable without zoom.

### Acceptance rule
If the page still reads like a desktop page compressed into a phone, treat it as FAIL even if nothing is visibly clipped.
