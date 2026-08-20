# Fixed floating controls and safe-area verification

## Core rule
`position: fixed` is not a defect by itself. The defect is when the control covers正文、流程图、图表、按钮、代码块 or other critical content on a narrow viewport.

## When to inspect
Use this check whenever a card has:
- a bottom-right save/download button
- any sticky or fixed floating action button
- a mobile toolbar that sits above the content

## Verification pattern
1. Open the card at a true mobile viewport, typically 390px wide.
2. Capture a screenshot of the full visible fold.
3. Visually inspect whether the floating control overlaps any meaningful content.
4. If overlap exists, increase bottom safe area / content padding or move the control back into normal flow.
5. Re-check after the fix; do not rely on source HTML alone.

## What counts as a failure
- button hides part of a flowchart or diagram
- button blocks the last paragraph, caption, or legend
- button obscures an action target the user needs to read
- button overlaps only blank padding: acceptable

## What happened in the learn-harness-engineering session
A fixed save button was acceptable in principle, but it initially covered the bottom of the diagram on 390px mobile. Increasing the bottom safe area resolved the issue, and the final re-check passed.

## Practical fix pattern
- keep the floating button fixed if desired
- reserve enough bottom space for the page body
- verify again with a fresh screenshot after the change