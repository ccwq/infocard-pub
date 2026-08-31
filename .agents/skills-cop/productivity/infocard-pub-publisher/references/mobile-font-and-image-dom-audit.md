# Mobile Font and Image Verification for Infocard Publishing

## Trigger

Use during infocard-pub publication whenever a card contains dense custom CSS, screenshot galleries, terminal UI text, captions, mono labels, or lazy-loaded images.

## Pattern

After local browser/mobile verification, run a DOM-level audit at 390px:

```js
(() => {
  const els = [...document.querySelectorAll('body *')];
  const badOverflow = els
    .filter(el => el.scrollWidth > document.documentElement.clientWidth + 2)
    .slice(0, 10)
    .map(el => ({ tag: el.tagName, cls: String(el.className), sw: el.scrollWidth, cw: el.clientWidth, text: (el.innerText || '').slice(0,80) }));

  const tooSmall = els.map(el => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { tag: el.tagName, cls: String(el.className), fs: parseFloat(cs.fontSize), w: r.width, h: r.height, display: cs.display, vis: cs.visibility, text: (el.innerText || el.textContent || '').trim().slice(0,40) };
  }).filter(x => x.w > 0 && x.h > 0 && x.display !== 'none' && x.vis !== 'hidden' && x.fs < 11.2);

  const imgs = [...document.images].map(img => ({ src: img.getAttribute('src'), complete: img.complete, nw: img.naturalWidth, nh: img.naturalHeight }));
  return { clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, badOverflow, tooSmall, imgs };
})()
```

## Acceptance

- `scrollWidth <= clientWidth`
- `badOverflow` empty
- visible `tooSmall` empty, unless the card has a documented and user-approved exception
- core content images `complete=true` and `naturalWidth/naturalHeight > 0`

## Common fixes

- Raise caption classes (`.screen-cap` etc.) to at least `11.2px`.
- Raise mono labels (`.section-label`, `.cmp-head`, `.card-kicker`, `.panel-kicker`, `.label`) to at least `11.2px` when visible on mobile.
- If below-fold images are verified by natural dimensions, do not leave them lazy-loaded; use `loading="eager" decoding="async"` for deterministic verification.
- After every CSS or loading change, rebuild (`npm run build && npm run verify`) before committing.

## Pitfall from coralline card

The page passed overflow checks, but CDP revealed hidden legibility misses: `screen-cap` captions at 10.5px and mono section labels at 11px. A simple min-font calculation is not enough unless it is restricted to visible elements and class-level offenders are listed.
