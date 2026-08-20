# PNG Export Button Recovery Notes

## Problem pattern
A published infocard shows a button labeled "保存 PNG" or similar, but clicking it opens the print dialog because the handler is `window.print()` or an equivalent print-only action.

## Fix contract
A true PNG save button must:
1. Bind to an explicit save function (e.g. `saveCard()`), not `window.print()`.
2. Include `html2canvas` (or equivalent raster export path) in the published HTML.
3. Render the target card container to a canvas and download `image/png`.
4. Use a deterministic filename ending in `.png`.
5. Disable/relabel the button during generation, then restore it.

## Verification
- Search the published HTML for `window.print()` — it must not appear in the save path.
- Search for `html2canvas` and the `saveCard` binding.
- Click the button in-browser and confirm it triggers a download, not the print UI.
- After publish, verify both the public HTML and the rendered DOM/snapshot.

## Bad pattern observed in this session
A button with class `save-btn` used `onclick="window.print()"` while still being labeled as PNG save. That is a functional bug, not a cosmetic issue.

## Good pattern (shape)
```html
<button id="save-btn" class="save-btn">保存 PNG</button>
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
<script>
  async function saveCard() {
    const canvas = await html2canvas(document.querySelector('.page'), { scale: 2 });
    const link = document.createElement('a');
    link.download = 'card.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
  document.getElementById('save-btn').addEventListener('click', saveCard);
</script>
```
