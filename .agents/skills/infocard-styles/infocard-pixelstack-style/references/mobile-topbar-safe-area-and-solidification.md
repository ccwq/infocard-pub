# Pixelstack mobile topbar safe area and solidification

Session-derived rules for mobile topbar overlap in pixelstack cards.

## Problem pattern
On narrow mobile viewports, the pixel-dot decoration cluster in the topbar can collide with the first letters of the title text if the topbar remains a single horizontal line.

## Durable fix
- Treat the topbar as a two-row mobile component.
- First row: decoration cluster + title text, with the decoration cluster occupying its own safety column.
- Use a two-column grid on the first row: `max-content minmax(0,1fr)`.
- If the row still feels crowded, increase the column gap rather than shrinking the decoration squares into the text.
- Keep version/year on a second line and right-align it when needed.

## Solidification rule
When the user says the fix needs to be "固化", patch `theme/pixelstack.html` first, then mirror the change into affected cards if they diverge. The template is the source of truth.

## Verification
- Re-render at 390px width.
- Capture a fresh screenshot after the patch.
- Confirm the decoration squares do not touch or overlap the title text.
- Do not rely on older screenshots or stale browser targets.
