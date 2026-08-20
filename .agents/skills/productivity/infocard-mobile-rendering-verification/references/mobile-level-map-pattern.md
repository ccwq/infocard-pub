# Mobile Level-Map Pattern

When a card contains a five-level route, maturity ladder, or audience map, desktop and mobile layouts have different obligations.

## Desktop

A five-column row is acceptable when every label and caption remains readable, the columns are stable, and the route is visually legible at the target desktop width.

## 390px mobile

Do not preserve five compressed columns just because `document.documentElement.scrollWidth <= 390`. That check catches overflow, not readability. If audience names or captions wrap into fragments, use one of these patterns:

- vertical level list: one full-width row per level, with the level code in a fixed narrow column;
- dedicated horizontal-scroll region: preserve card width and make the map itself scrollable, never the page;
- compact route strip plus a separate vertical detail list.

The default for explanatory cards is the vertical list because it keeps all five levels discoverable without gesture dependency.

## Acceptance

At 390px verify both:

1. mechanical: page scroll width is no wider than the viewport;
2. visual: level labels, audience names, and captions are readable, not clipped, and not reduced to tiny fragments.

After changing the responsive rule, invalidate the previous screenshot evidence and capture a fresh result. A DOM pass without a visual readability pass is not `VISUAL_PASSED`.
