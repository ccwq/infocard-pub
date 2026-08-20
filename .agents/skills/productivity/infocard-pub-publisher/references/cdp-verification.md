# CDP / homepage verification notes

This repository’s homepage is client-side rendered and the browser session can accumulate stale page targets during repeated verification.

## Practical verification recipe

1. If `browser_navigate` on `https://ccwq.github.io/infocard-pub/` times out in `Page.enable`, do **not** assume the deploy failed.
2. Query targets with `Target.getTargets`.
3. Create a fresh blank target with `Target.createTarget`.
4. Attach to the new target, `Page.enable`, then `Page.navigate` to the homepage.
5. Confirm the page body includes the expected slug/title.

## Why this helps

- The homepage shell may respond with HTTP 200 even while the client-rendered listing is still the real signal.
- A fresh target avoids stale renderer/session state that can hang during page enablement.
- Verification should be based on the rendered homepage content, not just the raw HTML shell.