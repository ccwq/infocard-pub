# Homepage ordering + cache recovery recipe

This note captures the session pattern for `infocard-pub` homepage edits.

## What changed in this session
- Homepage order was updated to follow the **latest effective modification time** for each card.
- The effective sort key should use the **newest timestamp across the card HTML and its `.meta.yaml` sidecar**.
- The rendered row kept all information, but the date column was compacted into two lines:
  - `新增`
  - `更新`

## Practical implementation rule
1. Rebuild `_index.yaml` from all sidecars after any metadata or sort-semantic change.
2. In the homepage renderer, sort again client-side using:
   - `desc(_sort_ts)`
   - then `date desc`
   - then `title/slug` for deterministic ties
3. Keep the row dense, but do not drop elements when compressing layout.

## Cache / stale DOM recovery
If the raw HTML is updated but the live browser still shows an older note or layout:
1. Open the live page with a cache-busting query param.
2. If the DOM still looks stale, inspect service worker registrations.
3. Unregister the SW and clear `caches` in the browser context.
4. Reload and re-check the DOM text, not just the screenshot.

## Verification checklist
- `curl` the public HTML to confirm the new markup exists.
- Check the browser DOM text for the new note.
- Confirm the homepage still shows all card elements under the tighter layout.
- Ensure the row order matches the latest update order, not just file name order.
