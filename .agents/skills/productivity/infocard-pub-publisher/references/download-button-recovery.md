# Detail-page download button recovery

Use this when a published infocard detail page is live, but the user reports the bottom download/export button is missing.

## Symptom
- Detail page loads normally
- Card content is present
- Bottom download button is absent
- User specifically points to one published page URL

## Fast diagnosis rule
Do not start with cache blame.
First inspect whether the page source actually contains the export affordance contract.

Check for all of these:
1. visible button element / button label (`下载图片`, `保存为 PNG`, etc.)
2. export library include (`html2canvas` or equivalent)
3. export function and filename logic (`saveCard()`, `a.download = 'xxx.png'`)

If the public HTML and local source both lack all three, the issue is source omission, not rendering drift.

## Recovery pattern
Restore the export block as one unit:
- bottom sticky save bar or footer action area
- button markup with stable id
- export script include
- save function that disables the button while rendering, saves PNG, then restores label/state

Typical implementation shape:
- `button#save-btn`
- `html2canvas(document.querySelector('.card'), { scale: 2, useCORS: true, scrollY: -window.scrollY })`
- `a.download = '<slug>.png'`

## Verification contract
Do both checks before reporting success:

### A. Raw HTML markers
Confirm the public HTML contains markers like:
- button label text
- `html2canvas`
- target PNG filename

### B. Rendered DOM check
Confirm browser-side DOM exposes the button, e.g.:
- `hasButton: true`
- `html2canvasLoaded: true`

Optional final evidence:
- screenshot proving the red bottom button is visually present

## Pitfall
A republished or hand-authored infocard can be visually complete yet functionally incomplete because the export affordance was omitted. Treat this as a page-completeness bug, not a generic Pages/CDN bug.
