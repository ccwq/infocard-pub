# GitHub repo card: CDP source + self-contained visual fallback

Use this when publishing an infocard from a GitHub repository and direct API/raw downloads are flaky, blocked, or incomplete.

## Trigger

- GitHub API / raw endpoints fail or are unreliable during source collection.
- README content is visible in the browser-rendered GitHub page.
- Repo images are useful but not essential, or cannot be localized after retry/fallback attempts.

## Pattern

1. Use a browser/CDP target on the GitHub repo page.
2. Extract `document.body.innerText` for README text, repo stats, license, directory names, badges, and install snippets.
3. Extract `document.images` for candidate image URLs and alt text.
4. If image localization succeeds, reference the local asset.
5. If image localization fails but the core facts are already captured, do not block publication solely for decorative repo imagery. Build a self-contained visual instead:
   - inline SVG workflow diagram,
   - CSS cards/chips/stats,
   - no external image dependency.
6. Write a short `.report.md` noting the source-collection path and which assets were not embedded.
7. Verify the published DOM has zero broken images. A page with no `<img>` elements is acceptable when the design is intentionally self-contained.

## Verification checklist

- Detail page HTTP 200.
- `_index.yaml` contains slug and expected style.
- Homepage contains slug/title.
- CDP mobile check: `scrollWidth <= innerWidth`, minimum font size meets the card standard, save button is static.
- `document.images` is either empty by design or every image has `complete=true` and positive `naturalWidth`.

## Reporting language

Say clearly: "raw/image download was unavailable, so the card uses a self-contained SVG/CSS visual and no external image dependency." Do not present the omitted upstream image as embedded evidence.