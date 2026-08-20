# Mobile Visual Verification: browser_cdp vs computer_use

## The failure pattern

`browser_cdp` routes to the **current page tab**, not the browser host. Calling `Emulation.setDeviceMetricsOverride` via `browser_cdp` fails with:

```
CDP error: {'code': -32601, 'message': "'Emulation.setDeviceMetricsOverride' wasn't found"}
```

`browser_navigate` and `browser_cdp` operate at the tab/DOM level. The emulation method exists on the browser host, not individual tab targets.

## Correct mobile verification paths

### Path A: computer_use desktop session (recommended for public URLs)

```bash
computer_use(action='capture', mode='vision', app='Firefox')
```

Requirements: Firefox (or Chrome) must be running and accessible. Works for any URL including GitHub Pages.

### Path B: visual screenshot via browser_navigate (fallback for desktop)

Navigate to the local preview server and take a screenshot. `browser_vision` respects the current viewport state. For GitHub Pages public URLs, works for desktop shots but not adaptive-mobile because the remote page controls its own viewport.

### Path C: CDP with correct browser-level target_id

Must use the browser-level CDP endpoint, not the page tab endpoint. Requires attaching to Chrome DevTools at the browser-level — not available through `browser_cdp` tool wrapper.

## Decision rule

When `browser_cdp` reports `method not found` for `Emulation.setDeviceMetricsOverride`:
1. **Do not retry** the same call — structurally unavailable through that path.
2. Switch to `computer_use` with `app='Firefox'` + `mode='vision'` for mobile screenshots.
3. If `computer_use` also fails (no Firefox window found), record `VISUAL_PENDING` for mobile only and proceed with desktop evidence.
4. Document the failure reason explicitly in run evidence.

## Related

- `infocard-publish-sop/SKILL.md` — mobile visual gate discipline
- `infocard-publish-sop/references/mobile-cdp-publish-gate.md` — CDP mobile gate documentation
- `infocard-publish-sop/references/mobile-responsive-css-patterns-20260719.md` — CSS repair patterns
- `visual-infrastructure-failure.md` — visual infrastructure retry logic
