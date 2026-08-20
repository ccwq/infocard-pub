# Dense Catalog Mobile Legibility Notes

Context from a real publish session involving a 39-item Claude Code thinking-skills card.

## What changed the outcome
- A skill-catalog card with two-column tiles was readable on desktop but still felt cramped on mobile.
- The most effective repair was *not* more decorative styling; it was reducing per-tile payload.
- Final card shape that read better on phones:
  - title + summary at the top
  - each tile keeps only `name + capability intro`
  - secondary principle text is hidden or moved to the report for narrow screens
  - keep the CTA save button fixed and visible

## Practical rule
If a card contains many repeated entries (skills, tools, models, workflows), optimize in this order:
1. remove redundant per-item fields
2. increase tile typography modestly
3. collapse two-column grids to one column on narrow screens
4. verify at 390px / mobile screenshot before shipping

## Verification tip
Use a visual pass to check whether the page still looks like a compressed desktop layout. If it does, the problem is usually content density, not just margins.
