# Footer actions and republish checks

Session takeaway: a published infocard can be content-complete but still miss the *interaction affordance* the user expects, especially a bottom download/save button.

## What to verify
- Inspect the rendered page bottom/footer, not just the visible content sections.
- Confirm the control exists in the final DOM and in the screenshot.
- If the source was updated but Pages still looks stale, use a cache-busting URL and re-check the rendered output.

## Fix pattern
- Add a clear footer CTA when the card is expected to export/download.
- Keep the action visible in the footer rather than hiding it behind text-only instructions.
- If multiple edits compete, prefer a full-source rewrite of the HTML artifact so the footer and script stay in sync.

## Why this matters
Users may describe the issue as “missing bottom button” even when the main narrative content is correct. That is a completeness problem, not a copy problem.
