# GitHub Repo Q-style Card Note: Headroom

Session note distilled from creating a Q-style info card for `chopratejas/headroom`.

## What worked
- Treat the **README as the primary fact source**; use GitHub search/API only to supplement stats and metadata.
- Use the repo’s own **demo GIF/banner** as the hero image when available; localize it into `docs/assets/images/<slug>/` before referencing it.
- For technical/open-source repo cards, Q-style can still work well if the structure is:
  1. 一句话结论
  2. 组成/入口
  3. 工作原理
  4. 证据与效果
  5. 适配矩阵
  6. 快速上手
  7. 最终判断
- Use the GitHub API for stable stats such as stars, forks, open issues, license, homepage, language.
- Prefer a **hero + stats + evidence tables** layout for repository cards with engineering claims.

## Repository card asset rules
- If the repo includes an official GIF or banner, download it locally and reference the local copy in the card HTML.
- Never hotlink a GitHub raw asset if a local copy is feasible.

## Mobile verification reminders
- Verify at 390px that the stats grid, table blocks, and sticky/fixed save button do not overlap the正文.
- Check `scrollWidth === clientWidth` (or near-equivalent in browser console) before publishing.

## Reusable prompt pattern
When a user asks for a GitHub repo card in Q-style, ask yourself:
- What is the repo’s main claim?
- What evidence best supports it?
- What is the best hero asset from the repo itself?
- Can the card be organized as a small editorial report instead of a plain feature list?
