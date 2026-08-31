# 390px grid2 / stealth override verification

This note captures the mobile-layout failure pattern seen on infocard-pub pages when browsing through a stealth-enabled Browserbase/Chrome session.

## Symptom
- Page looks fine on desktop.
- At 390px mobile width, a `.grid2` section shows uneven columns or a visually large blank band on one side.
- `scrollWidth` may still equal the viewport, so the issue is not overflow but bad grid sizing.

## Root cause pattern
- A stealth / CDP override can inject a `grid` shorthand or otherwise alter the computed layout.
- Patching only `grid-template-columns` may fail if `display` or `gap` is also being overridden.
- Child boxes can also expand because of intrinsic min-width.

## Recovery pattern
Use an inline override on the grid container:
```html
<div class="grid2" style="display: grid !important; grid-template-columns: calc(50% - 4px) calc(50% - 4px) !important; gap: 8px !important;">
```
And ensure child cards have:
```css
.box { min-width: 0; min-height: 0; overflow: hidden; }
```

## Verification checklist
1. Open the page at 390px mobile width.
2. Confirm `document.documentElement.scrollWidth === 390`.
3. Inspect `getComputedStyle(grid).gridTemplateColumns` and confirm equal widths.
4. Check the left/right bounds of the grid rows are aligned.
5. Re-screenshot after deployment to verify the visual gap is gone.

## Notes
- This is a Browserbase/stealth-session pitfall, not a general CSS rule.
- Prefer the smallest inline override that restores equal-width columns.
- If the page still looks off, inspect `display`, `gap`, and `min-width` together rather than one property at a time.
