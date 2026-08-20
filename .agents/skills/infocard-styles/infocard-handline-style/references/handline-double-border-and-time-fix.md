# Handline border and publish-time regression note

## Regression observed
During the Claude Code Game Studios card publish, the page reintroduced a double-border look even after the initial handline cleanup.

## Root causes
1. A `rough-box` container still had a CSS border/box-shadow layered on top of the SVG rough border.
2. The footer was also boxed with a CSS dashed border, creating a second frame on top of the hand-drawn outline.
3. The card’s publish timestamps were written as release time but not normalized to Asia/Shanghai wall time, which made the homepage list look off by several hours.

## Fix pattern
- For any element already using `rough-box`, keep only one border system:
  - rough-box SVG outline, or
  - CSS border
  - never both.
- Treat footer / badges / labels as the same class of risk as chip elements.
- When publishing cards, write `date` and `updated` in UTC+8 wall time so the homepage minute display matches the publish clock.

## Verification
- Inspect computed styles for `border*` and `box-shadow` on chips and footer.
- Check the live page after publish and ensure the visible chip/footer frames are single-layer only.
- Confirm the homepage list shows the local publish clock, not UTC.