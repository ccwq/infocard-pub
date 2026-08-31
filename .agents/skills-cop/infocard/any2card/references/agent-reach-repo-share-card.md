# Agent Reach 仓库技术分享卡：session note

Source: https://github.com/Panniantong/Agent-Reach

## This session’s reusable pattern
- Treat the repo as **capability distribution scaffolding**, not as a single-feature tool.
- Use a **source hierarchy** of: README → GitHub API metadata → platform support table → quick-start/install docs → design philosophy → safety/boundary.
- For a technical share card, split content into:
  1. 一句话判断
  2. 支持的平台 / 能看什么
  3. 它怎么工作（架构或流程图）
  4. 快速上手
  5. 设计理念 / current selections
  6. 安全与边界
  7. 适合谁 / 不适合谁
  8. 来源
- If the repository README is image-light, use a **self-made architecture SVG** or a representative chart as the first visual anchor.
- If a card feels cramped at 390px, raise the smallest text tokens before changing the structure. Verify with browser console:
  - `document.documentElement.scrollWidth === window.innerWidth`
  - computed font sizes for `.small`, `.mini-foot`, `.chip`, `.mini-pill`
- Use browser vision as the final legibility check, but rely on console metrics to confirm there is no hidden overflow.

## Verification checklist from this session
- Desktop rendering looked visually consistent.
- 390px view showed no horizontal overflow in console metrics.
- SAVE PNG button was present and clickable.
- The card was legible only after slightly lifting the smallest text tiers (11px → 11.4px range).
