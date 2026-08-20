# Repo card local hero image workflow

When a GitHub repo card includes a strong visual hero (promo screenshot, terminal dashboard, GIF frame, or user-supplied reference image), treat that image as part of the evidence bundle and localize it before publishing.

## Pattern

1. Copy the source image into `docs/assets/images/{slug}/hero.<ext>`.
2. Reference it with a relative path from the card HTML.
3. If the asset lives in a nested folder, stage the directory explicitly (`git add docs/assets/images/{slug}/`).
4. Verify the published page serves the image with `HTTP 200`.
5. Use the hero image as the first visual anchor when it carries the product metaphor.

## Good fit

- terminal dashboards
- agent workbenches
- CLI tools with a promotional screenshot
- repo cards where the README hero is the main proof of function

## Verification

- detail page: `HTTP 200`
- each `<img>` URL on the live page: `HTTP 200`
- mobile preview: no image clipping at 390px
- keep the hero local unless the source is guaranteed stable and public
