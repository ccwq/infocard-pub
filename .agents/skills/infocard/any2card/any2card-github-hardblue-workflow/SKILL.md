---
name: any2card-github-hardblue-workflow
description: 在 any2card 已完成发布前视觉门禁并自动发布后，审计信息卡改动、提交到 GitHub、推送并核验远程交付。不得绕过视觉门禁。
---

# Any2Card GitHub Hardblue Delivery Workflow

本 Skill 只负责 GitHub 交付。视觉审查、preview 管理、修复循环和自动发布由 `any2card` 负责；本 Skill 不能自行制造、放宽或绕过门禁。

## 已知缺陷与规避（2026-07-18 新增）

**GitHub Pages 相对路径陷阱（高频）**：HTML 文件位于 `docs/<slug>.html`，CSS 中 `../assets/img/...` 相对路径在 GitHub Pages 解析时会 404（Pages 对 `docs/` 下文件的相对路径计算与 CDN 根不同）。**必须用绝对 URL**：`https://<user>.github.io/<repo>/assets/img/<slug>/<file>`。验证方法：CDN 直链 200 ≠ HTML 内相对引用 200——两者都要验证。

**hardblue/redswiss CSS 无响应式断点（模板级缺陷）**：120+ 个卡片使用了标准 `.grid-3` 三列布局但 CSS 中无 `@media (max-width:720px)` 将其折叠为单列。修复需批量 Python 注入，并 commit 到 `origin/main` 后 CDN 才生效。

**模板 CSS 嵌在每个 HTML 里**：hardblue/redswiss 主题的 CSS 是每个 HTML 文件内嵌的，没有集中模板文件。这意味着任何 CSS 修复都要用批量 Python 扫描+注入，而非修改一个模板文件。

## 0. Prerequisites

开始前必须确认：

1. 可以访问目标 GitHub 仓库；
2. 已知目标卡片文件路径；
3. 已知本次是创建还是更新线上卡片；
4. 未经明确要求，不修改仓库级基础设施；
5. 不提交临时文件、调试产物、凭证、缓存或截图证据；
6. `any2card` 已为**当前卡片与当前文件版本**生成有效视觉门禁凭证；
7. 凭证记录 preview 页面身份验证，以及桌面 `1440×900` 和移动 `390×844` 的 `web-visual-acceptance` 结果；
8. 凭证缺失、过期、对象不符、审查后文件变动，或任一端仍有 `critical/major` 时，不得 commit、push、release 或以其他方式发布。必须返回 `any2card` Step 5，不能请求或假设绕过。

## 1. Responsibility boundary

- `any2card`：创建卡片、复用/按需启动长期 preview、身份校验、双视口门禁、最多四轮定向修复、自动发布和生成凭证。
- 本 Skill：验证凭证、审计仓库变更、commit、push、远程提交和线上链接核验。
- 主题 Skill：仅设计规范。
- `infocard-pub preview`：仅本地发布前预览，不等于线上发布。

线上发布成功不代表任务完成；必须继续完成 GitHub 交付与远程核验。

## 2. Delivery sequence

1. 识别目标仓库、分支、卡片路径与工作树状态；先 `git fetch`，检查本地分支相对 `origin/<branch>` 的 ahead/behind。若本地 **behind**，先同步，禁止将它作为发布源或用其本地索引判定线上状态。
2. 验证 `any2card` 门禁凭证：卡片 slug/路径、当前文件版本、preview 身份、桌面/移动证据、最终轮次、通过规则和线上 URL。
3. 确认两端均无 `critical/major`；凭证通过规则只能是正常的“评分+严重度”通过，或第 4 轮的“仅严重度”通过。
4. 在 push 前执行本地卡片门禁：构建与索引校验、卡片内容、引用资源、meta 时间戳、图片及移动端浏览器 smoke（仅对本次变更卡做增量检查即可）。同时确认索引声明的卡片数与实际条目数一致。
5. 复用 `any2card` 自动发布已产生的线上 URL；**不要在本 Skill 执行第二套独立发布命令**。
6. 检查 Git status，仅保留目标卡片及明确允许的源文件变更。
7. 审阅 diff，禁止把门禁凭证、截图、缓存、调试或无关文件提交。
8. commit 并 push。
9. 用**远端 commit SHA 或 slug**完成发布后核验：确认 Actions 成功、部署卡 URL 为 2xx、部署 `_index.yaml` 含对应 slug/path。发布后校验不得因为本地缺少 sidecar meta 而失败；这种情况应标为“本地未同步”，并改用远端 ref/部署索引完成核验。
10. 如果有审计，保存可追溯的机器可读报告（card slug、commit SHA、检查项、结论、证据路径）；单独的 `audit` commit message 不构成验收证据。
11. 只有以上全部成功后才报告交付完成。

详细的完整性模式与故障解释见 `references/publish-integrity.md`。

批量 CSS 修复（`.grid-3` 移动端断点注入）见 `references/grid-3-mobile-fix.md`。

## 3. Gate-failure handling

- 凭证无效：停止 GitHub 交付，返回 `any2card` Step 5。
- 发布受阻：不得提交为“已发布”；可在本地保留修复工作，但报告阻断的 `critical/major`。
- push 失败或线上 URL 不可访问：报告交付失败，保留门禁证据，不得伪称发布完成。

## 4. Final report

报告至少包含：仓库与分支、commit SHA、线上 URL 及核验结果、门禁轮次、桌面/移动分数、遗留 minor、是否第 4 轮低分放行，以及任何未完成项。

## Deprecated compatibility entry

此旧入口仅作兼容转发，替代入口为 `infocard-card-authoring` + `infocard-publish-pipeline`。调用时必须遵循 `legacy-adapter@1`，不得扩大原授权；新任务不得默认选择本入口。
