# Image-heavy technical-share cards

Use this pattern when the source post / repo contains multiple screenshots, diagrams, or illustrations that matter to the argument.

## Core rule
Do not reduce an image-heavy source to a single hero image if the missing images carry technical meaning. Preserve the evidence in source order and compress the layout instead.

## Recommended layout
- Header: short title + one-sentence conclusion.
- Evidence section: 2–6 images arranged as a compact gallery / strip / two-column block depending on density.
- For each image, use a short caption only when it adds meaning; do not narrate every visual detail.
- If there are many figures, group them by function:
  - architecture / workflow diagrams
  - UI screenshots
  - before/after comparisons
  - code or terminal evidence

## Asset rules
- Prefer original or highest-resolution source assets.
- Avoid thumbnails or derivative crops unless the crop is itself the evidence.
- If an image is essential to the claim, verify that the published `img` element points to a real asset that renders on the public page.

## Mobile rules
- At 390px, images must remain visible and readable without horizontal scrolling.
- If a gallery becomes too dense, collapse the gallery to a single column before shrinking all images.
- Do not let `object-fit: cover` or fixed `aspect-ratio` silently crop evidence images.

## Verification
- Confirm the number of intended images matches the rendered page.
- Check the rendered public page, not only HTML source.
- If the source contains multiple illustrations, do a visual pass to ensure the important ones are not pushed below the fold or omitted.
