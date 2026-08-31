# Browser CDP verification fallback for infocard-pub

Session note: when `browser_navigate` times out on a live Pages URL, do not treat that as a dead page immediately.

## Fallback sequence
1. Call `Target.getTargets` and locate an existing attached page target for the current browser session.
2. Use `Page.navigate` against that target to load the desired URL.
3. Read title / DOM / search state with `Runtime.evaluate`.
4. If mobile overflow is suspected on a handline card, after changing device metrics call `window.dispatchEvent(new Event('resize'))` once so JS-generated rough borders are regenerated before checking `scrollWidth`.
5. Use `curl` on the public URL and `_index.yaml` to close out verification when browser UI is slow.

## Why this matters
- Reuses a live Chrome target instead of depending on a fresh browser-open path.
- Works well when the browser stack is already attached to a page from the same session.
- Prevents false overflow reads on cards that draw borders from JS SVG and need a resize pass after emulation changes.
