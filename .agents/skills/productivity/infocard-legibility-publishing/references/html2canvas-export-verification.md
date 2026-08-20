# html2canvas export verification notes

Session takeaway: a visible “保存 PNG” button is not evidence of export failure. Verify the export chain directly.

## What to check
- Inspect the page function body: `saveCard()` should call `html2canvas(card, ...)` and then trigger a download.
- Confirm the page is in standards mode: `document.compatMode === 'CSS1Compat'`.
- Confirm the helper exists: `typeof html2canvas === 'function'`.
- Run the function in-page and wait for the promise to resolve:
  - `await saveCard()` should return successfully.

## Common false alarms
- `position: fixed` on the save button is normal; it is not itself a rendering bug.
- A page can have no images and still export cleanly.
- If the screenshot looks fine but export is suspected broken, test the JS path directly before changing layout.

## Verification pattern
1. Read `saveCard()` from the rendered page.
2. Check `document.compatMode` and `typeof html2canvas`.
3. Execute `await saveCard()` in the page context.
4. Only then investigate browser download permissions or stale-tab issues if the file still does not appear.
