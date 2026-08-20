# GitHub Repo Technical-Share Routing

Use this note when the input is a GitHub repository URL and the user asks for a **技术分享信息卡** (or any similar repo-sharing card).

## Routing rule

- Default to a **repo-first** narrative.
- Do **not** let an X/status shell dominate the page unless the user explicitly wants an X evidence card.
- Treat README / docs / examples / scripts as the main substance.

## Title strategy

- Derive the title from the repo's one-line positioning or the capability it enables.
- Avoid using the repository name as the headline unless the name itself is already descriptive.
- Prefer titles that state what the repo helps the reader do.

## First-fold strategy

Keep the first fold tight:

1. One-sentence verdict.
2. 2–4 bullets: what it is, how it works, how to start, boundary.
3. Defer file tree dumps, long link lists, and low-priority details below the fold.

For mobile, the first fold should still expose the verdict without requiring scroll; if the repo tree or install section pushes the conclusion down, compress the top copy first.

## Body ordering

Recommended order for repo technical-share cards:

- 核心定位
- 工作流 / 机制
- 安装或最小入口
- 资源包内容 / 文件结构
- 适用边界
- 参考链接

## Pitfall

A repo-centered technical-share task can look visually correct while still missing the user's intent if the page is written like a social-post evidence card. The fix is to move the narrative center to the shared artifact itself.
