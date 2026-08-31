# 2026-06-03 mobile verification notes

Session learnings for mobile infocard verification:

## What counts as failure
- A sticky or floating bottom button that overlaps正文 is a failure even if the rest of the page renders.
- A section that is readable only after zooming in is still a failure if the requested minimum text is larger.
- Dense structure sections should not rely on tiny inline file names or route names on mobile.

## Preferred repairs
- Convert file lists to stacked file cards.
- Convert route directories to name/description rows.
- Collapse summary grids to one column on narrow phones.
- Add a dedicated `@media (max-width: 720px)` cleanup block when the page still feels desktop-ish.

## Verification flow
- First verify static structure and text size.
- Then run browser/mobile screenshot verification.
- If the save/download button exists, ensure it is not covering any section before marking PASS.
