# CDP target hygiene for mobile verification

Use this when a page looks like a mobile CSS problem but the browser tools seem to be reading the wrong document or stale tab.

## Symptom
- `browser_navigate` snapshot looks correct, but `browser_console` / `browser_cdp` reports a different `location.href`, `title`, or body text.
- Computed styles do not reflect the media query that should be active.
- The page appears to ignore the mobile layout even though the viewport is set correctly.

## Recovery steps
1. **Verify the target first**
   - Call `Target.getTargets` and find the page whose URL matches the intended infocard.
   - Do not assume the previously used `target_id` is still the active page.

2. **Check the document before diagnosing CSS**
   - Read `location.href`, `document.title`, `window.innerWidth`, `document.body.getBoundingClientRect().width`, and the key computed styles.
   - If any of those values point to a different page, stop and reattach to the correct target.

3. **Refresh the correct page in the correct target**
   - Re-navigate the matching page target (or reopen the page) before re-running mobile checks.
   - After refresh, re-check `location.href` and title before interpreting layout metrics.

4. **Only then judge the layout**
   - Once the target is correct, use the viewport, screenshot, and DOM metrics to decide whether the issue is truly responsive CSS or just a stale/wrong tab.

## Why this matters
A wrong or stale target can make a mobile fix look broken even when the code changed correctly. The failure is in the inspection path, not the page.

## Useful metrics to log
- `location.href`
- `document.title`
- `window.innerWidth`
- `window.innerHeight`
- `document.documentElement.scrollWidth`
- `document.body.scrollWidth`
- `getComputedStyle(document.documentElement).fontSize`
- `getComputedStyle(document.body).fontSize`
- `getComputedStyle(.body).gridTemplateColumns` for two-column cards
- `getComputedStyle(.footer).flexDirection` for footer wrapping
