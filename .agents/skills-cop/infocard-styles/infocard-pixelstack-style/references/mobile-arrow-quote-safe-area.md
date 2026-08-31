# Mobile arrow-quote safe area for pixelstack

This note captures the 2026-06-18 Zvec mobile overlap fix.

## Problem pattern
On pixelstack hero stages, the left quote/arrow text is absolutely positioned on top of the stage while the pyramid and character occupy the lower center. Hiding the `.arrow` glyph on mobile is not enough if the quote itself sits too close to the top frame or the stage content.

## Symptom
At 390px width, the top quote can touch or visually collide with:
- the hero stage top border
- the stage background edge
- the character or top pyramid tier when the stage is dense

## Durable fix
Prefer a **stage-safe-area** adjustment, not only quote movement:
1. Increase `.stage` top padding on mobile first.
2. Then nudge `.arrow-quote` down if needed.
3. Keep `.arrow{display:none}` on mobile, but do not assume that alone solves overlap.
4. Re-check with a real 390px screenshot, because DOM rects can look safe while text still feels cramped visually.

## Practical baseline
For dense 4-tier/8-block pixelstack cards, a useful starting point is:
- `.stage` `padding-top`: around `20px–24px`
- `.arrow-quote` `top`: around `20px–24px`

If the card still feels crowded, widen the stage safe area rather than shrinking the quote into unreadability.

## Acceptance
- quote no longer touches the stage border
- no collision with the character or top pyramid tier
- 390px screenshot shows breathing room at the top of the stage
