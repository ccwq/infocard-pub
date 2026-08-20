# Mobile responsive remediation notes

## Session-specific repro
- Target page: `docs/20260525-cloakbrowser.html`
- Symptom: on 390px-wide mobile emulation the page behaved like a scaled-down desktop layout.
- Initial DOM metrics on the broken version:
  - `body.scrollWidth = 780`
  - `documentElement.scrollWidth = 780`
  - `meta[name="viewport"]` missing

## Fix applied
- Added `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`
- Changed page wrapper from fixed desktop width to `width: 100%; max-width: 780px;`
- Added `overflow-x: hidden` plus `overflow-wrap:anywhere` / `word-break: break-word`
- Added narrow-width media queries to collapse:
  - banner row → column
  - 2-column grids → 1 column
  - comparison tables → stacked blocks
  - identity tables → stacked rows

## Verification that passed
- After reload at 390px width:
  - `body.scrollWidth = 375`
  - `documentElement.clientWidth = 375`
  - `meta viewport` present and correct
  - comparison tables computed as `display: block`
  - banner computed `flex-direction: column`
- Browser vision confirmed the page was readable, not merely technically rendered.

## Practical lesson
- A page can be “complete” in HTML but still fail mobile acceptance if it is still visually desktop-scaled or too tightly packed on the first fold.
- When the user points out “字体小到看不清”, check both the scaling root cause and the density/spacing of the first fold.
