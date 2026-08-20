# Mobile border skeleton vs double-line regression (2026-06-10)

## What happened
A mobile infocard was first corrected for border overlap/double-line pressure, then later over-corrected by removing borders broadly in the mobile breakpoint. The page briefly looked cleaner but lost its structural skeleton.

## Lesson
For infocards, border is often part of the information hierarchy, not decoration.

## Safe rule
When fixing mobile border overlap:
1. identify the duplicated boundary
2. remove only that boundary
3. keep the page skeleton visible
4. re-check at 390px
5. freeze the accepted version once the user says stop

## Anti-pattern
Avoid mobile CSS that clears every border in one sweep:
```css
.stat,.card,.mini,.chip,.tag,.alert,.section-no,.codebox{border:0;box-shadow:none}
.section{border-top:0}
.shell{border:0}
```
That pattern removes the information architecture, not just the overlap.

## Useful verification cues
- The page still reads as an information card.
- Sections remain visually separable.
- Cards still have boundaries.
- There is no horizontal overflow.
- The mobile screenshot shows structure, not just content on white paper.
