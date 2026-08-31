# Rough-box mobile regeneration note

When a handline card uses JS-generated rough borders, changing viewport metrics can leave the SVG border geometry stale until a resize pass runs.

## Observed fix pattern
- After switching to a mobile emulation width, run `window.dispatchEvent(new Event('resize'))` once.
- Then re-check `document.body.scrollWidth`, `document.documentElement.scrollWidth`, and the card container width.
- If overflow remains, inspect `.rough-box svg` elements before judging the layout.

## Use case
Use this note when verifying handline / sketch cards that rely on runtime-drawn SVG borders, especially if the first 390px read looks wider than the actual viewport until a redraw occurs.
