# Mobile CTA and table reflow note

Session pattern observed on a 390px subtitle workflow card:

## Problem
- A fixed `save`/`download` button overlaid正文 in mobile viewport.
- A 4-column comparison table was too dense for narrow screens.

## Fix pattern
1. Convert dense compare tables into stacked tool cards or key-value lists on mobile.
2. Move the CTA out of `position: fixed` and place it in normal document flow at the bottom on small screens.
3. Re-run 390px browser verification and confirm:
   - no horizontal overflow (`scrollWidth <= innerWidth`)
   - CTA does not overlap visible text
   - section headings remain readable without truncation

## Takeaway
For blue-technical-manual cards, treat mobile legibility as a structural rewrite problem, not a font-size tweak.