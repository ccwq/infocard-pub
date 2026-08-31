# Mobile viewport recovery for infocard-pub

When a card looks fine on desktop but the right side is clipped on phone, treat it as a *content + layout* problem, not just a CSS bug.

## Checklist

1. **Add a visible version marker first**
   - Put a small badge in the banner/footer like `version: <shortsha> → vN`.
   - This helps distinguish cache issues from real layout issues.

2. **Reduce mobile density intentionally**
   - Shorten the banner subtitle on small screens.
   - Reduce title size, stat padding, and quote/body font size.
   - Collapse multi-column blocks to a single column earlier than desktop.

3. **Make grid items shrink safely**
   - Add `min-width: 0` to cards, tiles, tags, and tool items.
   - Add `overflow-wrap: anywhere` / `word-break: break-word` to long labels.
   - Use `repeat(n, minmax(0, 1fr))` for dense grids.

4. **Protect against safe-area clipping**
   - Use `padding: ... env(safe-area-inset-left/right)` on the page shell and banner when the design needs edge-to-edge structure.
   - Prefer `width: 100%` + `max-width` over relying on `100vw` for the main card shell.

5. **If a right border still disappears**
   - Don’t assume it is a cache issue.
   - Convert the edge treatment to an *inner divider* or inset rule that does not depend on the viewport edge.
   - Verify on the smallest expected phone width before shipping.

## Practical pattern

- Keep the desktop layout intact.
- Use a dedicated `@media (max-width: 720px)` rule for the first compression pass.
- Add a second `@media (max-width: 400px)` rule for extreme narrow devices.
- Keep a visible version pill on the page until the layout is confirmed stable.

## Verification

- Reload the public URL with a cache-busting query if needed.
- Confirm the version pill changed.
- Confirm no horizontal overflow on a narrow viewport.
- Confirm the rightmost decorative line/border remains visible or is intentionally converted to an inset element.