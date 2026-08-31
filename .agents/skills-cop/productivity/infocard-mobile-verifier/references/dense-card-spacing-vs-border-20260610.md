# Dense Card Midsection: spacing vs border overlap

Session note (2026-06-10): when a 390px screenshot shows a dense midsection such as stats → section number → first role card, do not assume true border overlap from a single cropped image.

## What we learned
- Midsection “double-line” complaints can come from shadow compression and tight vertical rhythm, not from two actual borders touching.
- The correct verification order is:
  1. confirm the live page is at the same viewport and scroll position as the user’s screenshot;
  2. check computed gaps between the last stats row, the section header, and the first card;
  3. inspect box-shadow and border-top/border-bottom on adjacent blocks;
  4. only then decide whether border removal is needed.
- If the DOM shows zero border overlap but the section still feels cramped, the first fix should be spacing/gap/padding, not border deletion.

## Practical checks
- Use browser DOM metrics for the exact blocks the user pointed at.
- Re-open the live page after any viewport change before concluding.
- For dense evidence cards, a “looks like overlap” report should name the strongest candidate cause as one of:
  - true border overlap
  - shadow貼边 / shadow compression
  - spacing too tight

## Related session patterns
- Stats grids, numbered section blocks, and the first role card are the highest-risk trio for false overlap reports.
- The middle of the page often needs a breathing-room fix even when borders are already clean.
