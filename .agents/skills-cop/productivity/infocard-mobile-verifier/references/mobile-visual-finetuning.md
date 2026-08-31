# Mobile visual fine-tuning notes for infocard-pub

Session takeaway: once the mobile layout is structurally correct, remaining issues are usually about **color hierarchy** and **spacing rhythm**, not another structural rewrite.

## What to look for after a structural fix
- **Red is often overused** in technical cards. If the page has multiple red anchors at once (dot, numeric stats, divider, warning border, section tags), the visual center becomes too hot. Prefer one or two red anchor types, not all of them.
- **Auxiliary text should step down gently**. Keep subtitle/meta/help text slightly cooler or grayer than body text so the hierarchy stays legible on 390px screens.
- **Module gaps matter more than card padding** once the layout is stable. The most common remaining issue is a rhythmic mismatch between:
  - hero → meta cards
  - meta cards → stats
  - stats → warning/callout
  - warning → next section
- **Single leftover cards can feel appended**. If a final meta card breaks a 2×2 rhythm, make it read as an intentional summary strip rather than a random fifth card.

## Mobile table pattern that worked
For 390px screens, a wide 3-column table often becomes fragmented. Convert it into stacked rows:
- hide `<thead>`
- render each `<tr>` as a bordered block
- render each `<td>` as a label/value stack
- put the label in a `::before` block above the value
- keep the parameter/value order stable across rows

This keeps the table readable without forcing awkward column compression.

## Visual verification tips
- Capture a top-of-page screenshot and one around the densest content section.
- Check whether the red emphasis is pulling attention away from the title/body.
- Check whether the last item in a grid looks deliberate or appended.
- Check whether the page feels **breathable** rather than merely “fits on screen.”
