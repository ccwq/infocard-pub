# Theme gallery regeneration and visibility trap

## When this matters

Use this note when a new infocard style/theme exists locally, but `themes.html` does not show it yet.

## Durable lesson

For `infocard-pub`, the gallery page is generated from `_themes.yaml` via the rebuild script. If the new theme is missing from `themes.html`, the most likely cause is:

1. the theme was not added to `_themes.yaml`, or
2. `_themes.yaml` was updated but `themes.html` was not rebuilt, or
3. the rebuilt page has not yet propagated on GitHub Pages.

Do **not** hand-edit the generated `themes.html` as the source of truth.

## Fix sequence

1. Add the theme entry to `_themes.yaml`.
2. Run the gallery rebuild script.
3. Verify the generated `themes.html` locally.
4. Commit both the source registry and the generated gallery together.
5. Push and wait for Pages propagation.
6. Verify the live URL with a cache-busting query string if needed.

## Verification checklist

- `themes.html` contains the new theme slug/name.
- The live Pages URL returns `HTTP 200`.
- The live page content includes the new theme entry and preview link.
- If the preview page exists, verify it separately.

## Pitfall

A local preview can look correct while the live gallery still shows stale content. Always verify the deployed `themes.html`, not just the local file.