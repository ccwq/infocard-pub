# Vision / DOM Reconciliation for Dense Infocards

Session note: on a dense 39-skill card, browser vision at 390px suggested the first fold was still “two-column / not fully single-column”, but DOM inspection showed the grid was already a single column and `document.querySelectorAll('.skill-card').length` returned 39. The issue was a visual interpretation mismatch, not a layout bug.

## Use when
- A mobile screenshot *looks* cramped or ambiguous, but the page may still be structurally correct.
- The page is dense enough that screenshot perception is unreliable.

## Verification order
1. Check the screenshot for actual clipping/overflow/overlap.
2. If the visual read is ambiguous, inspect DOM structure and computed styles.
3. Confirm counts and layout facts, e.g.:
   - total card count matches source
   - `gridTemplateColumns` collapses as expected on mobile
   - key headings exist in the rendered DOM
4. Only then decide whether to change structure.

## Pitfall
- Do not rewrite a dense but structurally correct layout just because the screenshot *feels* like it is still multi-column.
- On narrow cards, vision can misread tight spacing as a layout failure; DOM facts should arbitrate.