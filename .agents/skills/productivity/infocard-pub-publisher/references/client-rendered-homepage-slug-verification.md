# Client-rendered homepage slug verification

When publishing to `infocard-pub`, a detail page returning 200 is *not* enough. The homepage is client-rendered from `_index.yaml`, so verify all three layers separately:

1. **Detail page** — cache-busted public slug URL returns `200`.
2. **Index layer** — public `/_index.yaml` contains the expected `slug`, `path`, `title`, and timestamps.
3. **Rendered homepage** — browser DOM / console output shows the new slug or title in the client-rendered list data.

## Verification checklist

- Use a cache-busting query string on the public Pages URL.
- Check the public `/_index.yaml` directly, not only the local build.
- Inspect the rendered homepage data via browser DOM or console; raw HTML may not contain the new entry if the page hydrates client-side.
- If the index is correct but the visible homepage still looks stale, clear/unregister service worker cache before concluding the publish failed.
- Before reporting success, ensure `git status --short` is clean unless the user explicitly asked to leave unrelated edits untouched.

## Why this exists

This pattern prevents the common false positive where:
- the detail page is live,
- the local index build is correct,
- but the public homepage list still lags or hydrates stale data.

The correct release gate is the combination of public detail URL + public index + rendered homepage proof.
