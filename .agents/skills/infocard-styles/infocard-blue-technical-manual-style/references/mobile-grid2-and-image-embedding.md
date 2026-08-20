# Mobile grid2 equality and image embedding notes

## When this matters
Use this reference when building or revising a blue-technical-manual infocard that:
- includes many source images or diagrams that should be embedded, not just linked
- must pass 390px mobile verification
- uses `.grid2` / two-column cards that must render as equal-width columns on mobile

## Session-proven rules
- If the source has multiple illustrations, download the important ones locally and embed them into the card. Do not drop them just because the source card already has text.
- Keep the image set curated: prefer a cover/hero image plus the most explanatory diagrams or screenshots. Preserve the original narrative order when the images are evidence.
- Before publish, verify all embedded image URLs respond with HTTP 200. If a source image is broken, replace it before publishing rather than leaving a broken image on the public page.
- For blue-technical-manual cards, mobile two-column grids may be affected by browser/extension CSS injection. If computed widths are unequal on a 390px viewport, force the rule inline on the grid container:
  `style="grid-template-columns: calc(50% - 4px) calc(50% - 4px) !important;"`
- After the inline override, verify the computed widths are equal, and confirm `document.documentElement.scrollWidth <= 390`.

## Verification checklist
- Source images copied into `docs/assets/images/<slug>/`
- Card HTML references local image paths, not remote hotlinks
- Mobile viewport shows equal-width `.grid2` columns
- No horizontal overflow on 390px viewport
- Public page loads images successfully after deploy
