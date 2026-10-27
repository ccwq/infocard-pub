---
name: infocard-publish
description: 唯一 Publish 执行入口：消费候选稿并执行预览或授权发布及其最多两次视觉审查。
version: 1.0.0
---

# Infocard Publish

只在已有 artifact 时触发。对每个 revision 最多执行两次视觉审查：Critical 一律 `blocked`；Major 或 Minor 在第二次仍存在时可继续，结果标记为 `needs_human_review`。

模式：`preview` 只产生本地预览与 capture handoff；`direct` 在明确授权时 promotion、build、index/resource 检查和公网 URL smoke；`delegated` 只产出 handoff package，绝不自行发布。

输入：artifact、promotion manifest、视觉审查证据和交付授权。输出：模式结果、actions、URLs、smoke evidence、rollback reference，以及 `needs_human_review`。若该字段为 true，交付结果协议的第一行必须是“需要人工审核”。

字段、命令与恢复细节仅按需读取 `../../productivity/infocard-publish-sop/references/publisher-operations.md`，不加载旧 SOP 全文或历史事故作为活动流程。入口处置与实际校验器冲突时报告冲突，不把 `needs_human_review` 伪装成 gate PASS。

本入口不重解释来源内容。构建/部署部分失败始终是 `failed`。历史 preview、build、publisher、delegated 与审查 Skill 仅作按需 references/兼容适配，不得形成并行发布路线。

promotion 或校验脚本失败时，修候选稿或报告阻塞，不得修改校验器、门禁脚本或发布协议来让任务通过。校验器要求的字段与任务范围冲突时，是 `blocked` 并报告冲突，由用户决定；发布授权不含修改公共校验规则的授权。
