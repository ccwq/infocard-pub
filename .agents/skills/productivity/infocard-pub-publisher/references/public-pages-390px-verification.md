# Public Pages 390px Verification for infocard-pub

This note captures the verification path that proved reliable during the html-video republish.

## What to verify on the public Pages URL
- Use a **390px-wide mobile viewport**.
- Add a cache-busting query string when the page was just republished.
- Check `document.documentElement.scrollWidth <= window.innerWidth`.
- Confirm `scrollWidth` / `innerWidth` before trusting a screenshot.
- If the page looks like a shrunk desktop layout, fix mobile typography and grid collapse first.
- For dense screenshot galleries or showcase blocks, ensure images have `max-width: 100%` and wrappers have `width: 100%`.

## Typical repair pattern
1. Make the outer wrapper `width: 100%` plus a max-width cap.
2. Add a global `img { max-width: 100%; height: auto; display: block; }` safety rule.
3. Keep the content shell `overflow-x: hidden`.
4. Re-test the public Pages URL, not just the local file.

## Good final-state signals
- Public HTML 200
- Public image URLs 200
- 390px screenshot shows no horizontal overflow
- The page reads as a mobile layout, not a compressed desktop clone
