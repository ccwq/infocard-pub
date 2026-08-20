# Header badge / pill spread pattern

## When it applies
Use this pattern when a published info card's hero/header area has a row of badges, pills, chips, or status tokens that feels visually compressed, left-heavy, or unevenly distributed.

## Recommended structure
- Desktop: `display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: ...`
- Mobile: switch to `repeat(2, minmax(0, 1fr))` at the main breakpoint
- For each badge/pill:
  - use `display: flex`
  - center content with `justify-content: center`
  - allow wrapping with `white-space: normal`
  - set `text-align: center`
  - add a small `min-height` so short and long labels line up

## Why this works
A flex-wrap row tends to produce:
- uneven line breaks
- a heavy first row and weak second row
- inconsistent pill widths when labels differ in length

A grid spread gives the header a more intentional editorial feel and makes the top block read as a designed system rather than a casual tag cloud.

## Verification
After applying the change:
1. Check the public Pages URL with a cache-busting query.
2. Confirm the hero/header strip visually spans the full width of the text column.
3. Check the mobile breakpoint to ensure the chips still read as a set and do not collapse into a dense cluster.

## Related note
This pattern is a narrow style fix, not a content expansion. Do not use it to rewrite the whole hero unless the user also asks for a rebuild.
