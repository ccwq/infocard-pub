# PNG export button safe-area and verification

This note captures a recurring fix pattern for published infocard detail pages that need a visible PNG export button in a branded style.

## When to use
- User points to a specific published page and says the download / PNG button is missing.
- The page is otherwise healthy, but the bottom export affordance was omitted during authoring or republishing.
- The page needs a fixed floating button that matches the card palette.

## Recovery pattern
1. Inspect the exact source HTML for the target slug.
2. Add a fixed `#save-btn` button with a palette-matched style (not a generic system gray button).
3. Bind the button to an actual PNG export path:
   - include `html2canvas`
   - render the card container (`.page` is a reliable baseline)
   - download a deterministic `slug.png`
4. On mobile, do not move the button to static flow. Keep `position: fixed` and create safety room instead:
   - enlarge bottom padding on the page/card shell
   - if needed, add right-side safe padding so the FAB does not cover the last visible content block
   - verify at 390px after each adjustment
5. Verify from both angles:
   - raw public HTML contains `save-btn`, `html2canvas`, and `保存 PNG`
   - rendered public page exposes the button and clicking it produces a download

## Verification checklist
- 390px screenshot shows the button without covering正文
- Clicking the button triggers a download, not the print dialog
- Download filename ends with `.png`
- Public HTML and public rendered page both show the affordance

## Pitfalls
- Do not treat this as a cache-only problem when the source HTML is missing the affordance.
- Do not switch the button to `position: static` on mobile; that often pushes it into the page bottom instead of keeping it as a proper FAB.
- If the page still overlaps after a first padding tweak, widen the safe area further rather than shrinking the button into illegibility.
- Keep the recovery scoped to the exact target URL; do not broaden the fix into unrelated files or neighboring cards.
