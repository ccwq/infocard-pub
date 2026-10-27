---
name: infocard-publish-sop
description: 兼容入口。Use when legacy infocard-publish-sop is invoked; forward to the project Router, Author and Publish entries.
version: 5.0.0
---

# 信息卡发布：兼容转发

本入口不再定义独立发布流程。替代关系以 `../../infocard/infocard-core-contract/contracts/architecture.json` 为准。

## 路由

- 任务与授权判定：`infocard-router`，文件 `../../infocard/infocard-orchestrator/SKILL.md`。
- 候选稿创建与修订：`infocard-author`，文件 `../../infocard/infocard-card-authoring/SKILL.md`。
- 预览或授权发布：`infocard-publish`，文件 `../../infocard/infocard-publish-pipeline/SKILL.md`。
- 按 frontmatter 名称发现技能；目录名不同不构成缺失。

## 不变边界

1. 使用项目主 checkout，保留并排除无关改动；不自动清理或创建替代仓库。
2. Author 只写 `.docs` 候选；Publisher 按 manifest 提升声明文件。修稿只改唯一候选源，再重新提升，不双写。
3. 视觉证据绑定最终 HTML 与真实截图；未审查、失败、跳过均不等于通过。
4. 校验失败修输入或使用项目已有兼容方式；不为单次任务修改公共校验规则。
5. commit、push、外部发布遵守当前授权；只纳入明确范围，不使用 `git add -A` 或 force push。
6. 公网页面、索引入口与当前视觉分别验收；本地构建或 HTTP 200 不能单独证明发布完成。

## 按需参考

- `references/publisher-operations.md`：字段、命令与恢复入口。仅执行相应阶段时加载。
- `../../infocard/infocard-core-contract/references/user-content-and-memory-routing.md`：内容与语言约定。默认中文，替代历史 English-first 规则。
- `references/archive/legacy-sop-v4.md`：迁移前完整快照，仅追溯，不执行。
- `references/archive/incident-notes.md`：历史事故摘录，不默认加载，不作为门禁放行依据。

不在此处复制视觉轮次、质量阈值或时间预算。由当前 Publish 入口决定处置；若实际校验器与入口冲突，报告具体冲突，不伪造 PASS、不自行放宽。范围内的可执行步骤连续推进，不在每个阶段重复请求已取得的授权。
