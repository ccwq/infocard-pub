# ChatGPT Web orchestrator fallback

Use this reference when native visual review has exhausted differentiated infrastructure retries without a reliable result.

- Route through the local `visual-review-orchestrator` adapter when available; do not couple publishing SOPs directly to the third-party `chatgpt-web-skill` internals.
- Do not invoke the fallback after native visual PASS or to bypass a real native `critical`/`major` result.
- The adapter reviews caller-frozen screenshots one image at a time, aggregates required-image results as BLOCKED → PENDING → PASSED, records redacted evidence, and keeps chat cleanup status separate from visual status.
- Infocard scope normally includes desktop `1440×900`, mobile `390×844`, and actual Hero/body/table-or-matrix/footer/fixed-control regions.
- WeChat scope is layout and typography only; cover-image visual review is out of scope. Cover binding/CDN/presence remain mechanical checks.
- Each project gets a new dedicated ChatGPT Web review chat; reused chats are never deleted. Only a run-created chat with verified identity may be deleted after evidence verification and project terminal closeout.
- Deletion failure is `CHAT_CLEANUP_PENDING` or `CHAT_DELETE_BLOCKED`, never silently successful.
- Dependency incompatibility fails closed as `VISUAL_PENDING`.
