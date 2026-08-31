# Post-publish three-way verification

This note captures a reusable republish verification pattern observed in infocard-pub work.

## The three surfaces to verify separately
1. **Detail page**
   - Open the public card URL with a cache-busting query string, e.g. `?t=<timestamp>`.
   - Confirm HTTP 200 and that the rendered page matches the new content.

2. **Index manifest**
   - Check the public `/_index.yaml` directly, not only the homepage UI.
   - Confirm the new slug/path entry is present.

3. **Repository cleanliness**
   - Before reporting completion, verify the publish repo worktree is clean.
   - `git status --short` should be empty after the release commit/push is done.

## Why this matters
- A page can be live while the homepage index is stale.
- The homepage can look stale because the browser or service worker still caches an older list.
- A publish can appear complete until a leftover local edit or generated file remains uncommitted.

## Practical verification order
1. Check the detail page with cache busting.
2. Check public `/_index.yaml`.
3. Check the rendered homepage/index.
4. Confirm `git status --short` is empty.

## Failure handling
- If the detail page is 200 but the homepage omits the card, treat it as an index/cache issue, not a content issue.
- If the homepage looks old but raw `/_index.yaml` is correct, suspect browser cache or service worker state.
- If `git status --short` is non-empty, do not claim the publish is finished yet.
