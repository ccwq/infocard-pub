# X status with commentary + screenshot: release notes

## When to use
Use this pattern when the user wants a card from a single X status that must include:
- the post's main claim
- public interaction counts
- reply/comment signal
- a screenshot as evidence

## Extraction order
1. Open the X status page.
2. Prefer the top-level post text and author identity as the durable anchor.
3. Inspect whether replies are visible or gated.
4. If replies are gated by login, do **not** invent reply text; record only the public reply-entry signal and interaction counts.
5. Capture a screenshot that shows the正文、互动数据、回复入口 or login gate.
6. Solidify the screenshot as a local asset and reference it from the card with a relative path.

## What to put in the card
- A clear conclusion sentence
- The post's claim / interpretation
- Public interaction counts (replies, reposts, likes, bookmarks, views)
- Commentary on whether reply text is accessible or login-gated
- A screenshot section with a short caption explaining what the screenshot proves

## Pitfalls
- Do not claim “comments were captured” when the reply thread is gated.
- Do not rely on a single screenshot if it does not show the author or正文 clearly; prefer the browser DOM text for the claim and use the screenshot as evidence.
- If the screenshot only shows the post body and engagement, label it as commentary-state evidence rather than full comment capture.

## Verification
- Public detail page loads 200.
- `_index.yaml` contains the card entry.
- Browser vision confirms the screenshot section and save PNG button are visible.
- The saved local image path resolves correctly from the card HTML.
