# Dense grid border/shadow gap pitfall

## Symptom
In hardblue cards, `grid-2` / `grid-3` layouts can visually collapse when adjacent cards use:
- 2px borders
- offset shadows (6–8px)
- small gutters

The result is a "merged border" / "double-black-line" look, especially in dense 2-col and 3-col sections.

## Root cause
The border + shadow stack visually thickens the edge. When the gap is too small, neighboring shadows and borders align into one heavy stripe instead of two separate card boundaries.

## Fix order
1. Increase `gap` first.
2. Reduce shadow offset / strength second.
3. Only then consider softening the border.

## Practical threshold
- `gap: 12px` is often too tight for dense card grids in hardblue.
- `gap: 16px` is a safer baseline.

## Verify
- Look for a clear white gutter between cards.
- Ensure each card edge reads as an independent rectangle.
- Zoom the dense grid sections (03/04/05-like blocks) and confirm no black-line merging illusion remains.
