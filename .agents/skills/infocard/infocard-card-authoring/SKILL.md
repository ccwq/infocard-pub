---
name: infocard-author
description: 唯一 Author 执行入口：把已路由的内容、证据和主题决策写成 .docs 候选稿。
version: 1.0.0
---

# Infocard Author

用于 create、update、rebuild 和 repair 的候选稿工作。来源建模、主题契约和作者期预防性检查属于本入口的内部步骤；仅来源调查或仅发布不触发。

输入：内容包、冻结的 `theme-decision.json`、更新时的既有卡片身份和 authoring 目录。输出：`.docs/<run-id>/<slug>/` 下的 draft HTML、sidecar、asset manifest 与阶段结果。按需引用旧内容/主题 Skill 的 `references/`，不得将其恢复成并行流程入口。

Preserve task mode, audience, source claims and selected theme. `any2card` is an internal conversion engine; rebuild mode may consume `infocard-rebuild-template-grill`, while CLI content may consume `infocard-tool-cli-pattern`.

Author 不能宣称视觉通过、做最终浏览器验收、promotion 到 `docs/`、commit 或 push。成功需要结构完整的 draft、可追溯的 claims、冻结主题决策和确定性的 promotion manifest。
