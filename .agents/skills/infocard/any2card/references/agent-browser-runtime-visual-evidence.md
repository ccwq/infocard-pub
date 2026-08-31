# Reuse the runtime-provided Chrome CDP session for visual evidence

## Trigger

Use this when an infocard preview needs screenshots and the workstation exposes Chrome DevTools on runtime-provided endpoint.

## Why

A bare `agent-browser --session <name>` can launch or use a separate browser context. That loses the user’s existing Chrome state and creates avoidable tabs. For local visual review, first detect the live CDP endpoint and attach through it.

## Procedure

1. Probe the endpoint before launching a browser session:
   ```bash
   curl -fsS http://runtime CDP endpoint/json/version
   curl -fsS http://runtime CDP endpoint/json/list
   ```
2. If available, use the repository’s `ab` alias or explicitly pass the endpoint:
   ```bash
   ab open 'http://127.0.0.1:<preview-port>/docs/<card>.html'
   # equivalent: npx -y agent-browser ...
   ```
3. Record pre-existing targets. Create at most one preview tab, and never close or navigate unrelated user tabs.
4. Set each viewport, reset `scrollY`, take ordinary viewport screenshots, and verify DOM geometry:
   ```bash
   ab set viewport 1440 900
   ab eval 'window.scrollTo(0,0); JSON.stringify({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,scrollHeight:document.documentElement.scrollHeight})'
   ab screenshot /tmp/card-desktop-top.png
   ```
   Repeat independently for mobile (`390×844`). Confirm `scrollWidth === clientWidth` on mobile before calling it free of horizontal overflow.
5. Inspect each screenshot with the vision tool. If the visual runner fails, follow the normal bounded infrastructure retry policy; do not substitute static checks for visual evidence.
6. Close only the preview tab created for this run after evidence is preserved.

## Local-preview caveat

Some Hermes browser navigation tools reject `127.0.0.1`/private URLs even while a Chrome CDP endpoint can reach the same URL. In that case, attach `agent-browser` to the runtime-provided endpoint rather than creating a separate browser session or treating the browser-tool restriction as a visual failure.
