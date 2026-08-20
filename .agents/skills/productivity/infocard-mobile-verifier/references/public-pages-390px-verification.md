# Public Pages 390px Verification Playbook

This note captures the mobile verification pattern that repeatedly proved useful for infocard public releases.

## Checklist
1. Always verify on the **public GitHub Pages URL**, not just the local file.
2. Use a **390px-wide mobile viewport** (typical iPhone width) with cache-busting if the page was just republished.
3. Check the actual overflow condition with JS:
   - `document.documentElement.scrollWidth <= window.innerWidth`
   - if false, treat it as a real mobile overflow bug.
4. If images appear broken in the screenshot, confirm both:
   - public asset URLs return HTTP 200
   - `naturalWidth > 0` in the rendered DOM
5. When layout still overflows even though elements look normal, inspect for:
   - wrapper missing `width: 100%`
   - images missing `max-width: 100%`
   - quirk-mode / legacy rendering causing width constraints to behave unexpectedly
6. If the page is readable but looks like a shrunk desktop layout, fix **mobile typography and grid collapse** before doing more spacing tweaks.

## Practical repair notes
- For wrapper shells, prefer `width: 100%` plus a max-width cap; do not rely on `max-width` alone.
- For all images, use a global `img { max-width: 100%; height: auto; display: block; }` safety rule.
- If the page uses a fixed bottom-right save button, keep the button fixed and add bottom safe-area padding to the content shell rather than changing the button to static.
- For cards with a first-fold stats strip, collapse 4-up grids to 2-up on mobile before shrinking text further.

## Reusable verification sequence
1. Load the public URL.
2. Set mobile metrics to 390×844.
3. Read `scrollWidth`, `innerWidth`, and `overflowX`.
4. Capture screenshot.
5. If needed, inspect the screenshot visually and only then patch CSS.
