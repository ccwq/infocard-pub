---
name: infocard-direct-publish
description: Use when one URL or a complete user brief should become one published infocard through the .docs promotion workflow.
version: 2.2.0
---

# Infocard 直连发布（单对象路线选择）

## 适用场景

- 用户给出一个 GitHub URL、官方文档 URL 或完整研究材料，并明确要求发布一张信息卡。
- 发布对象唯一，内容边界清楚，且不涉及批量、多源争议或敏感声明。

以下情况切换到 `infocard-publish-sop` 的完整路线：多对象批量、需要多源事实裁决、敏感风险、素材不足，或用户明确要求并行研究。

## 本 Skill 的唯一职责

本 Skill 只负责判断单卡是否适合 light route，并输出路线选择：

```text
单一来源与低风险 → light route
其他情况 → full route（bounded research）
```

普通 light route 使用 `scripts/lib/infocard-route.js` 判定，并以 20 分钟为墙钟硬上限；路线选择阶段不执行研究、写卡或发布副作用。

研究、主题选择、authoring、promotion、视觉门禁、build、verify、taxonomy、leak、commit、push、公网复核和 closeout，统一遵循：

- `infocard-publish-sop`
- `infocard-theme-assignment`
- `visual-verification-gate`
- `infocard-visual-evidence-grounding`

本 Skill 不复制这些 Skill 的执行步骤、命令、验收清单或失败恢复规则。

## 硬边界

- 所有工作只在主 checkout 进行；禁止 worktree、clone、detached HEAD 和 force-push。
- Author 只能写 `.docs/<run-id>/<slug>/`；不得直接写 `docs/`、`assets/`、生成索引或 Git 状态。
- Publisher 是唯一的 promotion、build、commit、push 和公网复核角色。
- 主 checkout 的 ambient dirty/untracked 状态必须保留并排除在 staged allowlist 外。
- 不安装、配置或执行卡片介绍的工具，除非用户另行授权。
- 不自动启动 Wiki 同步。

## 输入与输出

输入至少包含一个完整、可访问的第一方来源或用户 brief。输出应明确：

```text
route: light | full
reason: 一句话说明边界
source_boundary: canonical source / discovery source
claim_status: confirmed / claimed / unsupported
next: 交给 infocard-publish-sop 的下一阶段
```

若 X 帖只是项目发现入口，使用 `infocard-x-content-tracing` 追踪 GitHub 上游，并将 X 内容标记为 discovery source；不要把 X 帖当作项目事实源。
