# X/CDP fallback and asset-path verification

## What happened in session
- X status pages were reachable in Chromium/CDP even when a plain browser navigation path timed out.
- The reliable source artifact came from `Runtime.evaluate` on the current page target, reading `location.href` and `document.body.innerText`.
- The visible post text was enough to build the card without guessing from search snippets.
- A first image publish failed because the HTML referenced `docs/assets/images/20260625-codex-orange-book-hardblue/banner.png`, but the file had been copied into the wrong slug directory. The page rendered with a 404 image until the asset path was corrected and the file was served from the exact referenced path.

## Practical probe sequence
1. `browser_cdp Target.getTargets`
2. Find the active `page` target for the X post.
3. `browser_cdp Runtime.evaluate` with:
   - `location.href`
   - `document.title`
   - `document.body.innerText.slice(...)`
4. If the page is visible but image quality is unclear, keep the card source grounded in the visible body text and metadata.
5. For embedded assets, verify both sides:
   - the file exists on disk under the exact `docs/assets/images/<slug>/...` path
   - the public URL returns `HTTP 200`

## Verification checklist
- Current page body text captured from CDP, not inferred from search snippets.
- Public image URLs return `HTTP 200`.
- `naturalWidth` / `naturalHeight` are non-zero after reload.
- No accidental reuse of a previous slug directory.

## Why this matters
This avoids two common publish errors:
- treating a visible X error page as a hard block when CDP can still read the real post
- shipping a card whose hero image 404s because the asset lived in the wrong slug folder
