# Border spacing verification order

## When this matters
Use this note when a hardblue / dense-grid card looks like the outer shell border and inner content border are merging, or when card blocks feel visually stuck to the frame.

## Observed pattern
- A `shell` container with no inner padding can make the first child border appear fused with the outer frame.
- Dense `grid-2` / `grid-3` layouts with 2px borders and offset shadows can create a separate but related "black-line merge" illusion.

## Correct order
1. Fix the *specific visual defect* first.
2. Re-open the page locally and verify with screenshot / browser inspection.
3. Only after verification, write the reusable rule into the SKILL.md / pitfall list.

## Practical remedy
- For outer-frame collision: add inner `padding` to the shell before tuning inner grids.
- For dense-grid collision: widen `gap` first, then reduce shadow, and only then consider border changes.

## Anti-pattern
Do **not** promote a hypothesis into a reusable rule before the visual fix is actually verified. If the fix is wrong, the skill should capture the corrected rule, not the first guess.
