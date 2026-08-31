# Mobile save-button safe-area pattern (session note)

## Trigger
Use when a published infocard has a fixed bottom-right **保存 PNG** button that overlaps正文 or obscures the last section on mobile.

## What worked
1. Keep the button in its unified fixed position; do **not** move it around ad hoc per page.
2. Add page-safe **bottom/right padding** to the content container so the body clears the fixed control.
3. If the public page is still cramped, **compress the button itself** only after the safe area exists:
   - smaller font-size
   - tighter padding
   - slightly narrower width
4. Re-test at **390px** viewport, not just desktop.
5. Verify on the **public GitHub Pages URL** with a cache-busting query string; local success is not enough.
6. Final acceptance requires the button to be visible and **not covering正文** in a screenshot/vision pass.
7. If 390px still shows overlap after adding container padding, keep the button fixed but reduce its mobile padding/font-size at `<=400px` and reshoot; do not move the button to a different corner just for one page.

## Verification order
- Local 390px screenshot pass
- Public Pages 390px screenshot pass
- `/_index.yaml` and detail page both reachable
- Worktree clean after push

## Pitfall
A local fix can pass while the deployed Pages version still overlaps because the public CSS/CDN state is stale or the page-specific spacing differs. Always re-check the deployed URL before declaring done.
