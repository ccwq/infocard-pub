---
name: infocard-router
description: 唯一用户可见入口；将信息卡请求路由到 Author 或 Publish，并按需加载契约和经验 references。
version: 1.0.0
---

# Infocard Router

这是唯一用户可见的流程入口。用于 create、query、update、rebuild、repair 和 publish 请求；不用于无关网页或通用设计工作。

输入：用户请求、可选既有卡片、来源提示、明确主题和交付授权。输出：到 `infocard-author` 或 `infocard-publish` 的最小运行状态。只有当前任务需要时，才读取 `infocard-core-contract/contracts/architecture.json`、`infocard-core-contract/references/` 或各旧 Skill 的 `references/`；历史经验不是默认入口。

决策顺序：分类任务模式 → 保留既有身份 → 评估来源风险与内容结构 → 保留明确主题 → `infocard-author` → 最多两次视觉审查 → `infocard-publish`。

Router 不写 HTML/CSS、不做视觉修复、不发布。没有明确发布授权时仅能选择 `preview`。项目 Skill 不可用是终态 (`PROJECT_SKILL_UNAVAILABLE`)，不得泛化回退。

视觉规则：Critical 始终阻断；Major 或 Minor 经过两次审查仍未通过时允许继续发布，但交付结果协议顶部必须先输出“需要人工审核”。成功是可交接的最小计划；blocked 和 failed 停止下游阶段。
