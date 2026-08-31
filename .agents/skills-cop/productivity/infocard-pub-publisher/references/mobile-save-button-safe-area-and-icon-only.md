# Mobile Save Button Safe-Area and Icon-Only Fallback

Use when a published info card has a fixed PNG save button that crowds the last screen on phones.

## Pattern
1. Keep the button `position: fixed`.
2. Add bottom/right safe-area padding to the page or content shell first.
3. Verify on a public 390px viewport screenshot.
4. If the button still overlaps or crowds正文, collapse the label to an icon-only compact FAB instead of moving the button into document flow.
5. Re-verify on the public Pages URL after the CSS change.

## What to check
- The button remains visible and usable.
- The last paragraph / footer block is not covered.
- The export still produces a real PNG download.
- The control is compact enough that the page can keep its own first-fold density.

## Why this pattern exists
Dense cards often need a save affordance, but a wide labeled FAB can steal the right edge on 390px screens. Icon-only mode keeps the export action while preserving reader space.