# GitHub repo card image embedding and asset commit trap

Session note: 2026-06-14

## Durable workflow for repo cards that must include an image

1. Inspect the GitHub repo metadata and README first.
2. Discover image candidates from README / repo root / assets.
3. Download the chosen image(s) locally before building the card.
4. Run a quick visual check on the downloaded image to decide placement:
   - logo / icon -> hero or title rail
   - screenshot / dashboard -> main visual panel or right rail preview
5. Copy the image into the card bundle under `docs/assets/images/<slug>/...`.
6. Reference the local path from the HTML, not the remote URL.
7. When staging, add the nested image directory explicitly:
   - `git add docs/assets/images/<slug>/`
   - do not rely on staging only the HTML + meta files.
8. Build, verify, commit, push, then confirm the live pages URL returns HTTP 200 and the image path is reachable.

## Why this matters

- Repo cards often have a strong visual anchor in the README logo or screenshot.
- Leaving the image remote makes the page fragile and can break later.
- Nested image directories are easy to omit from git staging, which produces a Pages 404 even when the HTML itself is correct.

## Practical notes

- If the source repo provides both a logo and a screenshot, prefer the one that matches the card story:
  - **logo/icon** for identity or library/API cards
  - **screenshot/dashboard** for tools, terminals, or UI products
- For handline cards, the image can sit beside the title and a short quote/summary.
- For darkblue cards, the image often works best inside the glass hero panel as the primary visual.
