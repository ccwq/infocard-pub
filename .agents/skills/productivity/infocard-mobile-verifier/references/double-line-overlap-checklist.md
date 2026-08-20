# Double-line / border-overlap checklist

Use this when a card screenshot looks like borders are “stacked”, especially around hero/stats/figure boundaries.

## Reproduction
- Verify on the actual target viewport first: mobile cards need a 390px-wide mobile emulation; desktop claims need a 390px-wide mobile emulation; desktop claims need a desktop viewport.
- Re-open the live page after changing viewport; do not trust a stale snapshot from a previous mode.

## Common failure pattern
- A major block ends with a border and the next block begins with another border, producing a double-line illusion.
- The most common trio is: hero bottom border + stats top border + figure/section border.
- A visually equivalent failure is **black border + grey antialias/shadow edge**. Even if it is not a true double border in CSS, treat it as a user-visible defect when the user rejects it.

## Fix order
1. Keep only one boundary line between major blocks.
2. Remove the border from the block whose boundary is visually redundant (usually the hero bottom or the stats top, not both).
3. If the line still feels heavy, relax padding/gap before touching shadows.
4. Neutralize figure/card border stacking by removing the outer border first, then the figcaption/top rule if needed.
5. If the user still sees grey edges after ordinary fixes, enter strict visual-clean mode instead of continuing to argue semantics.

## Strict visual-clean mode
Use this when the user still rejects the result after ordinary double-line fixes, or explicitly treats **black border + grey antialias/shadow** as failure.

- Do not keep arguing “it is only antialiasing” or “not a real double border”. Treat the user-visible grey edge as the bug.
- Verify computed styles, not just screenshots: target elements should report `boxShadow: none`; if the user still sees grey edge, reduce or remove `border`, not just shadow.
- For mobile-only failures, use a mobile media-query override to zero or flatten the visual language:
  - `.shell{box-shadow:none;border:0}`
  - `.stat,.card,.mini,.chip,.tag,.alert,.section-no,.codebox{border:0;box-shadow:none}`
  - `.section{border-top:0}`
- Preserve content hierarchy with background color, spacing, typography and section labels instead of hard borders.
- Publish only after GitHub Actions Pages deploy succeeds; raw GitHub reflecting the commit is not enough.

## Verification
- Check the join point at normal zoom and at the actual mobile width.
- Confirm there is a single divider, not two parallel lines or a dark L-shaped corner.
- In strict visual-clean mode, computed border widths for the complained mobile elements should be `0px` and `boxShadow` should be `none`.
- Re-check both mobile and desktop if the card has responsive rules.
