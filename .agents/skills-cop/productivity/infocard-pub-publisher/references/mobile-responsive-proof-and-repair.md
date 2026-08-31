# Mobile responsive proof & repair pattern

Use this pattern when a user reports a published info card still has mobile issues.

## What to verify first
- Reproduce on the **public Pages URL**, not only local files.
- Use a **390px** viewport and a cache-busting query string when validating the live page.
- Inspect the **exact section the user pointed to**; do not generalize the bug to the whole page if only one section is broken.

## Repair strategy
- If a section is compressed by multi-column layout on mobile, convert **that section only** to a single-column card stack or a 2-col-to-1-col responsive grid.
- If the floating save button overlaps正文, prefer:
  1. mobile-only button reposition/scale, and/or
  2. extra safe-area padding on the affected content container.
- Avoid ad hoc global spacing changes when the issue is local to one section.

## Proof standard
- After the fix, capture a new **public** mobile screenshot and inspect it visually.
- The screenshot must show the user-flagged area in its fixed state.
- If the button or layout still touches正文, keep iterating; do not claim success from a local-only pass.

## Common pitfall
A page can be “better” locally but still fail on the deployed Pages URL due to a stale deploy or a section-specific CSS override. Always re-check the public page before closing.