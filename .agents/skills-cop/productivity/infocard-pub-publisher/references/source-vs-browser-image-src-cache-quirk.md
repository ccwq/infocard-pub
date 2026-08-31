# Source-vs-Browser Image Src Cache Quirk

## Why this note exists
During infocard publishing, a card can be *correct on disk* but still show an old or placeholder image src in the browser view. In one session, the HTML source was fixed from a template placeholder (`{img}`) to a real local asset path, but the open browser tab still reported the placeholder until the service worker and cache were cleared.

## Verified recovery pattern
1. **Check the source file first**
   - Read the local HTML and confirm the `<img src="...">` is a real path, not a template placeholder.
2. **Check the deployed raw HTML**
   - Use the public HTML or raw source to confirm the pushed file contains the real asset path.
3. **If the browser still shows the old src, clear site state**
   - Unregister the site service worker.
   - Delete Cache Storage entries for the site.
   - Re-open the page with a cache-busting query string.
4. **Re-read the DOM in the browser**
   - Use `browser_console` on `document.querySelector('.hero-visual img')?.getAttribute('src')` (or the relevant selector) to confirm the rendered DOM now matches the source.
5. **Only then trust image availability tools**
   - `browser_get_images()` is useful after the cache is clean, but on stale pages it can still surface the old or placeholder URL.

## What to watch for
- A browser tab can keep showing `%7Bimg%7D`, `{{img}}`, or another placeholder even after the HTML source is fixed.
- This is usually a **cache / SW state issue**, not a publish failure.
- Raw HTML and browser DOM are separate verification layers; check both when image paths matter.

## Related verification patterns
- For flat cards at `docs/{slug}.html`, local assets usually live under `assets/images/...`.
- For nested cards at `docs/{slug}/index.html`, the local asset base is usually `../assets/images/...`.
- When the public page is involved, prefer a cache-busted URL before concluding the page is wrong.
