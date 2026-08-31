# X 帖 + GitHub 仓库：截图还原型技能卡分析笔记

This note captures a recurring pattern for cards built from an X post that points to a GitHub repository/skill.

## When the post is about a repo/skill that turns screenshots or design references into HTML/CSS

Use this framing:
- **X post = claim layer**: what the author says they repeatedly verified in practice.
- **GitHub README = fact layer**: the repo's own one-line定位 and usage contract.
- **Repo structure = mechanism layer**: directories like `references/`, `scripts/`, `agents/` reveal the workflow, not just the slogan.
- **Post image = evidence layer**: if the image is itself a UI screenshot/example, treat it as a representative input/output sample, not generic decoration.

## Title strategy

Prefer a conclusion title that says what capability got operationalized, e.g.:
- “把 UI 截图还原成 HTML/CSS 的工作流技能”
- “把设计参考图工程化成可验证的前端流程”

Avoid titles that only restate the repo name or the post URL.

## Suggested card spine

1. 一句话结论：它解决的不是“画图”，而是把高风险还原任务拆成可验证流程。
2. 为什么有用：拆解结构 / 资产 / 画布 / 验证四层。
3. 工作流链路：拆解 → 分离 → 适配 → 截图校验 → 修正。
4. 安装与调用：放到 Codex / Claude 的 skills 目录或对应 agent 入口。
5. 仓库结构：从 README / references / scripts 反推出工程重点。
6. 适用边界：适合高保真还原，不适合凭空创作新视觉。
7. 最终评价：把还原质量工程化，而不是做一次性 prompt。

## Visual treatment notes

- If the post image is a screenshot sample, caption it as a *sample input* or *representative UI*.
- Do not imply the image is the repo's entire product surface unless the README says so.
- When the image is a product UI, keep its role clear: evidence, example, or target output.
