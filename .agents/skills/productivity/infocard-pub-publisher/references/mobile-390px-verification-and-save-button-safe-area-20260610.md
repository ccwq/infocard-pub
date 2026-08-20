# 390px mobile verification and save-button safe-area notes

Session-derived publishing pattern for mobile legibility and export controls.

## What to verify at 390px
- Use a real mobile viewport, e.g. 390×844, not a desktop screenshot.
- Check first screen for: title legibility, tag wrapping, stats readability, and whether the bottom button overlaps正文.
- Check the tail area too; fixed controls often only show up as a problem near the bottom of the scroll.

## Save button patterns
- If a save/export button is `position: fixed` on desktop, re-check it at 390px.
- If it visually grazes or overlaps body text on mobile, prefer one of:
  1. move it back into normal document flow on mobile (`position: static` / block-level footer button), or
  2. reduce size and reserve explicit bottom safe area.
- Do not rely on bottom padding alone if the button still obscures copy.

## CDP screenshot recovery pattern
When the live browser session is stale or `browser_navigate` times out on `Page.enable` / screenshot capture:
1. Create a fresh tab target with `Target.createTarget`.
2. Enable `Page` and `Runtime` on the new target.
3. Navigate the new target directly to the local HTTP preview URL.
4. Evaluate basic readiness (`document.readyState`, title, key selectors).
5. Capture the screenshot from that fresh target.

This avoids carrying a stale attached target forward from earlier tabs.

## Verification order
1. Local HTTP preview returns 200.
2. Desktop screenshot sanity check.
3. 390px screenshot sanity check.
4. Confirm no body overlap from floating controls.
5. If an image is used, confirm the asset actually loaded in the live page.
