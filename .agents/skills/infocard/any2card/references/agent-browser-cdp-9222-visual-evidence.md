# Reuse the existing Chrome CDP session for visual evidence

## Trigger

Use this when an infocard preview needs screenshots and the workstation exposes Chrome DevTools on port `9222`.

## Why

A bare `agent-browser --session <name>` can launch or use a separate browser context. That loses the user’s existing Chrome state and creates avoidable tabs. For local visual review, first detect the live CDP endpoint and attach through it.

## Procedure

1. Probe the endpoint before launching a browser session:
   ```bash
   curl -fsS http://127.0.0.1:9222/json/version
   curl -fsS http://127.0.0.1:9222/json/list
   ```
2. If available, use the repository’s `ab` alias or explicitly pass the endpoint:
   ```bash
   ab --cdp 9222 open 'http://127.0.0.1:<preview-port>/docs/<card>.html'
   # equivalent: npx -y agent-browser --cdp 9222 ...
   ```
3. Record pre-existing targets. Create at most one preview tab, and never close or navigate unrelated user tabs.
4. Set each viewport, reset `scrollY`, take ordinary viewport screenshots, and verify DOM geometry:
   ```bash
   ab --cdp 9222 set viewport 1440 900
   ab --cdp 9222 eval 'window.scrollTo(0,0); JSON.stringify({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,scrollHeight:document.documentElement.scrollHeight})'
   ab --cdp 9222 screenshot /tmp/card-desktop-top.png
   ```
   Repeat independently for mobile (`390×844`). Confirm `scrollWidth === clientWidth` on mobile before calling it free of horizontal overflow.
5. Inspect each screenshot with the vision tool. If the visual runner fails, follow the normal bounded infrastructure retry policy; do not substitute static checks for visual evidence.
6. Close only the preview tab created for this run after evidence is preserved.

## Local-preview caveat

Some Hermes browser navigation tools reject `127.0.0.1`/private URLs even while a Chrome CDP endpoint can reach the same URL. In that case, attach `agent-browser` to `--cdp 9222` rather than creating a separate browser session or treating the browser-tool restriction as a visual failure.
