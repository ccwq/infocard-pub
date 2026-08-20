# PNG export and preview verification

Use this note when a card includes a "保存 PNG" button or any html2canvas-style export path.

## Proven workflow
- Prefer verifying the final export on a local HTTP preview, not `file://`.
- `file://` preview can produce tainted canvas behavior in html2canvas, causing `toDataURL()` export failure even when the page visually looks correct.
- Start a simple local server for the repo, open the published card through `http://127.0.0.1:<port>/...`, then click the export button.
- Confirm the downloaded artifact is a real `.png` file in the user download folder, not a print dialog or placeholder action.

## Verification checklist
1. Open the card through HTTP.
2. Click the save button.
3. Confirm the browser downloads a `.png` file.
4. If export fails on `file://`, retest under HTTP before changing the export code.
