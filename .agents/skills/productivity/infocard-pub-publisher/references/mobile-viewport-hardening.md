# Mobile viewport hardening for infocard-pub pages

This note captures a recurring class of publishing bugs: Pages look correct on desktop but the right edge is clipped or decorative borders disappear on mobile.

## Symptoms
- Content extends beyond the screen on narrow phones.
- Right-side border/line is not visible even after obvious padding fixes.
- User suspects cache because an older layout may still be served.

## Fix pattern
1. Add a visible in-page version marker near the top banner, e.g. `version: <short-commit> → vN`.
2. Reduce content density, not just CSS spacing.
   - Use a shorter mobile-only subtitle if the banner text is too long.
   - Collapse multi-column sections to a single column at <=720px.
   - Add a second break at <=400px for extreme narrow screens.
3. Harden layout against clipping:
   - `body { overflow-x: hidden; }`
   - `.page { width: 100%; max-width: min(780px, 100vw); }`
   - use `min-width: 0` on grid children and cards
   - use `overflow-wrap: anywhere; word-break: break-word;`
   - add `env(safe-area-inset-left/right)` to outer padding on mobile
4. If a decorative outer border is still getting hidden, move it inward:
   - prefer an internal divider or inset line over a right-edge frame line
   - avoid relying on the far-right edge for important visual cues

## Verification
- The visible version marker must change after each publish.
- Recheck on a narrow viewport after deploy; do not rely on desktop.
- If the page still looks wrong but the version marker changed, the issue is real layout, not cache.

## Notes
- This pattern is especially relevant for long infocards with cards, stats grids, and ASCII/diagram blocks.
- When mobile legibility conflicts with the desktop design, adjust the content for mobile instead of only tuning CSS.
