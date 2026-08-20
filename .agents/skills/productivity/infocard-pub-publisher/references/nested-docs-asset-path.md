# Nested docs index asset paths

When publishing a card as `docs/<slug>/index.html`, shared assets under `docs/assets/images/` are only one level up from the page.

## Rule
- `docs/<slug>/index.html` → asset path is `../assets/images/<file>`
- `docs/<slug>/something/index.html` → asset path is `../../assets/images/<file>` only if the HTML is two directory levels below `docs/`

## Pitfall
- Do **not** assume `../../assets/images/` is the default for nested cards.
- The wrong relative path is a common reason for broken poster/QR renders while the rest of the page looks fine.

## Verification
- Open the local page and inspect `browser_get_images()` / rendered DOM.
- Confirm every external asset was downloaded into `docs/assets/images/` and the published page uses the relative path, not a hotlink.
- If a nested card is missing images, check the page depth first before changing the asset filenames.
