# Public website card: OG / preview asset solidification

Session-derived pattern for public website infocard tasks.

## What to do
- If the public site exposes a usable `og:image`, `twitter:image`, hero image, or preview PNG, download it locally and embed it in the card body as evidence.
- Treat the image as **source evidence**, not as a style reference.
- Prefer the site’s own canonical preview asset when it exists; it usually conveys the product identity better than a logo screenshot or a generic page crop.
- Keep the image path relative under `docs/assets/images/<slug>/` and reference it from the HTML using a repo-local path.

## Why it matters
- Public site cards are stronger when the visible preview asset is part of the artifact, not just a hotlink.
- Localizing the asset reduces link rot and makes public verification deterministic.
- The image should support the public-page narrative: what the site is, what the directory contains, or what the visible workflow is.

## Verification
- Confirm the asset URL returns HTTP 200 before download.
- Confirm the downloaded file exists in the repo and is referenced by the HTML.
- Confirm the final published page includes the image in the rendered card body, not only in metadata.
