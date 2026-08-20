# Hardblue rebuild + Pages publish note

This note captures a recurrent publishing pattern for `infocard-pub` when the user asks to **rebuild an existing page into `infocard-hardblue-style`**.

## Rebuild intent
- Treat **rebuild** as a **structure + CSS reconstruction**, not a color swap.
- Preserve content completeness: do not shrink or omit sections unless the user explicitly asks for compression.
- Prefer reflowing the same source into the hardblue visual system (thick black borders, red/blue accents, section number blocks, strong first-fold hierarchy) rather than patching the old layout.

## Atomic publish sequence
1. Rewrite the card HTML and matching `.meta.yaml` together.
2. Rebuild the index and homepage (`_index.yaml`, `index.html`) in the same pass.
3. Commit all generated artifacts together in one commit.
4. Push once.
5. Verify the public page after GitHub Pages has had time to rebuild.

## Pages delay behavior
- A freshly pushed page can still return **404** for a short period even when the repo already contains the file.
- A safe default is to wait **70–90 seconds** after push before first public verification.
- If the detail URL still returns 404 after the wait, do not claim success; treat it as a deployment lag / deployment failure and keep checking before finalizing.

## Practical checks
- `npm run build` and `npm run verify` must both pass before push.
- Confirm `_index.yaml` and `index.html` were regenerated and included in the commit.
- After push, verify the public URL with `curl -I` or browser navigation, and confirm the rendered page matches the new hardblue rebuild.
- For brand-new slugs, check that the published URL path exactly matches the `meta.yaml` `path` field.

## Common pitfall
- A page may be correctly committed yet still 404 on GitHub Pages while the deployment pipeline catches up. Do not report completion until the page returns HTTP 200 on the public URL.
