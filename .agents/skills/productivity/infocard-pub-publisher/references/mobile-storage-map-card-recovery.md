# Mobile Storage-Map Card Recovery

Use this pattern when an infocard section that looks fine on desktop becomes cramped on 390px mobile, especially when it shows a technical table or matrix.

## Symptom
- A section rendered as a multi-column table on desktop compresses into unreadable narrow columns on mobile.
- Text wraps into tiny fragments, making the section look dense but not legible.
- The issue often appears in sections that explain storage maps, config matrices, capability matrices, or other tabular data.

## Recovery pattern
1. Convert the table into a stack of cards or list items on mobile.
2. Keep desktop multi-column layout only above the mobile breakpoint.
3. Give each card a short title and 2-3 labeled rows such as `归属 / 存储 / 说明`.
4. Increase mobile padding around the section so the save button and the content do not collide.
5. Re-verify on a real 390px screenshot, not just by reading the CSS.

## Verification
- 390px viewport: section should read top-to-bottom without narrow table columns.
- No horizontal overflow.
- No fixed save button covering the last content block.
- The section should remain visually dense, but each item must be individually readable.

## Tip
If the source used a `<table>` purely for visual alignment, prefer replacing it with semantic card/list markup rather than trying to force the table to behave responsively.
