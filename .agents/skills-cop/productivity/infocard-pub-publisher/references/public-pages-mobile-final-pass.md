# Public Pages mobile readability final-pass pattern

## Trigger
Use this when an infocard looked acceptable locally, but the user specifically cares about mobile readability / no zoom / no clipping, or when a public GitHub Pages page must be treated as the source of truth.

## Lesson
A local mobile PASS is not enough. GitHub Pages can still differ because of deployment delay, cache, service worker, viewport state, or the screenshot tool judging a different rendered state. The release is only done after the public URL itself is verified.

## Required sequence
1. Make the mobile CSS fix locally.
2. Run a local mobile viewport check by CDP:
   - set viewport around `390x844`, `mobile: true`
   - verify computed font sizes for representative selectors
   - verify `documentElement.scrollWidth <= clientWidth` and no wide elements
3. Commit only the target file. Stash unrelated local edits before rebase/push, then restore them after push.
4. Poll the public Pages URL with a cache-busting query string until:
   - HTTP status is `200`
   - the expected new CSS/text marker is visible in the fetched HTML
5. Navigate to the public Pages URL with the same cache-busting query string.
6. Re-run CDP mobile viewport checks on the public page.
7. Run screenshot/vision verification on the public page, not only the local file.
8. If public vision says FAIL despite local PASS, treat public FAIL as authoritative and do one stronger readability pass rather than arguing with the tool.

## Strong-readability escalation
When the failure is “text still too small / too dense” and there is no horizontal overflow:
- Increase the mobile root font size one step, e.g. `html { font-size: 18px; }` under `@media (max-width: 720px)`.
- Re-check computed sizes. Good target ranges from this session:
  - body / timeline text around `19px`
  - table card text around `19px`
  - stat labels around `17px`
  - footer around `16px`
- Confirm overflow remains zero after the bump.

## Completion bar
Do not report completion until all are true:
- `curl` public URL returns `200`
- fetched public HTML contains the expected fix marker
- public CDP check shows no horizontal overflow
- public screenshot/vision review returns PASS
- final response includes the verified public URL and screenshot
