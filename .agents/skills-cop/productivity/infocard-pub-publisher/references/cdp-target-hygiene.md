# CDP target hygiene for infocard publishing

When checking a public info card after a CSS or responsive-layout change, make sure the browser tool is inspecting the intended page before diagnosing the page itself.

## When to use
- A page seems to ignore a new mobile CSS rule.
- `browser_cdp` or `browser_console` reports a different URL/title than the one you just navigated to.
- A responsive layout change appears to have no effect even though the HTML/CSS file was edited.

## Checklist
1. Verify the active page target with `Target.getTargets`.
2. Confirm `location.href` and `document.title` on the same target before reading computed styles.
3. If the target is stale or wrong, reopen or re-navigate the correct page before judging the layout.
4. Only after the correct page is confirmed should you inspect `scrollWidth`, `innerWidth`, font sizes, grid columns, and footer wrapping.

## Why it matters
A stale target can make a valid CSS fix look broken, especially during mobile verification when multiple tabs and prior pages are open.
