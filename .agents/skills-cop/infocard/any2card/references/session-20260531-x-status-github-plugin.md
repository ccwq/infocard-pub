# Session note: X status posts + GitHub repo linked cards

## What emerged in this session

When a user asks for an info card/report from an X status post that links to a GitHub repo:

1. Split the source into two layers:
   - post claim / tone / engagement
   - official repo README / directory definition

2. Treat visible replies carefully:
   - Logged-out X pages may expose only a partial reply surface.
   - If the UI only exposes "Read N replies" or one reply in the page DOM, label the section as **可见回复**.
   - Do not summarize the thread as if the full reply set was available.

3. For tool / plugin / workflow roundup posts:
   - title should follow the official repo definition, not the post's hype language
   - include a short comment/response signal if one is visible
   - regroup the list into practical stacks
   - state boundary / non-goal explicitly

## Extraction hint

On X status pages, the useful DOM often lives in `article` text and may require a CDP `Runtime.evaluate` read of `document.body.innerText` or `document.querySelectorAll('article')`.

## Practical rule

If the post text says "一键配置 / 全自动 / 神装" but the repo README says "analyze and recommend" or "read-only", the card must preserve the official boundary.
