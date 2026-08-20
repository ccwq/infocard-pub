# Mobile overflow checklist for infocard-pub pages

Use when a published infocard looks clipped on phones, especially on the right edge.

## Symptoms
- Right edge of content is cut off
- Cards or banners appear wider than the viewport
- One padding tweak helps a little, but content is still incomplete on narrow devices

## Fix order
1. Add `overflow-x: hidden` to `body`.
2. Ensure the main wrapper uses `max-width: min(780px, 100vw)` or equivalent.
3. Clamp the card container with `max-width: 100%`.
4. Reduce mobile padding on `banner`, `grid`, and `footer` to around `1rem`.
5. Add a narrower breakpoint, e.g. `@media (max-width: 400px)`, for ultra-small devices.
6. Switch narrow grids to `minmax(0, 1fr)` if content still overflows.
7. Apply `overflow-wrap: anywhere; word-break: break-word;` to long text blocks.
8. Re-check the actual published URL after push, not just the local file.

## Verification
- Inspect at both `720px` and `400px` widths.
- Confirm the last row/rightmost card is fully visible.
- Confirm long labels and URLs wrap instead of extending horizontally.
- If the HTML looks correct locally but the public page is stale, verify the deployed `Last-Modified` / `ETag` changed after the push.

## Common pitfall
A single reduction like `2.2rem -> 1rem` may not be enough. Very narrow devices often need both:
- smaller outer padding
- smaller title/stat typography
- tighter grid constraints
- explicit text wrapping rules
