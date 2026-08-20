# Mobile border skeleton vs double-line regression (2026-06-10)

## What happened
A mobile infocard was first corrected for border overlap/double-line pressure, then later over-corrected by removing borders broadly in the mobile breakpoint. The page briefly looked cleaner but lost its structural skeleton.

## Lesson
For infocards, border is often part of the information hierarchy, not decoration.

### Keep
- outer shell border
- section separators
- card boundaries
- figure / codebox framing when they anchor content

### Remove or soften
- only the duplicated adjacent border that causes the double-line effect
- shadows that visually pile up next to borders
- redundant nested borders where one boundary already communicates the division

## Anti-pattern
Avoid mobile CSS that looks like:
```css
.stat,.card,.mini,.chip,.tag,.alert,.section-no,.codebox{border:0;box-shadow:none}
.section{border-top:0}
.shell{border:0}
```
That pattern deletes the whole skeleton instead of fixing the overlap.

## Safer fix sequence
1. Identify the two adjacent elements creating the visual double-line.
2. Remove only one of the two touching borders.
3. Restore gap/padding before deleting any more borders.
4. Re-check at 390px viewport.
5. If the user says "stop", freeze the accepted version and do not keep iterating.

## Verification cue
A good mobile result should still read as an information card:
- boundaries visible
- hierarchy visible
- no border collapse
- no obvious double-line pressure
- no horizontal overflow
