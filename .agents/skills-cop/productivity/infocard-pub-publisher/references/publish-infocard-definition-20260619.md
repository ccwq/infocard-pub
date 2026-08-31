# 发布信息卡任务定义澄清（2026-06-19）

## 根因

用户说"发布信息卡"时，默认理解是：在 `infocard-pub` 下创建信息卡并发布到 `infocard-pub` 仓库。内容来源可以是 GitHub 仓库、网站 URL、X post、需要调查的文本或其组合。

本技能在 2026-06-19 之前曾误读为"只发布 GitHub 仓库卡"，导致反复追问确认而非直接执行。正确行为已固化到 SKILL.md 正文顶部的"发布信息卡 = 唯一正确理解"段落。

## 执行边界

- **唯一发布目标仓库**：`infocard-pub`（`ccwq/infocard-pub`）
- 其他仓库需用户明确授权才能推送
- Wiki 同步是高价值卡片的必需步骤（高价值定义见 SKILL.md）

## 本次会话发布的三张卡片（验证数据）

| slug | 风格 | 来源类型 | 公网验证 |
|------|------|----------|----------|
| `20260619-follow-builders` | `infocard-bigwhite-style` | GitHub repo | HTTP 200 |
| `20260619-codebase-memory-mcp` | `infocard-pixelstack-style` | GitHub repo | HTTP 200 |
| `20260619-gitreverse` | `infocard-graph-paper-style` | Website URL | HTTP 200 |
