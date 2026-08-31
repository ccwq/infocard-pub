---
name: infocard-three-stage-pipeline
description: Use when a user explicitly requests research → authoring → publishing roles for one or more infocard-pub cards.
version: 2.0.0
---

# Infocard 三阶段流水线

## Scope

用于用户明确要求“调研 → 写卡 → 发布”分工的复杂信息卡任务。正式信息卡仓库是：

```text
/home/ccwq/qbox/opendir/project/infocard-pub
https://ccwq.github.io/infocard-pub/docs/<slug>.html
```

公众号主题预览属于另一个仓库，不能混入本流程。

## 唯一工作区模型

```text
Research → .docs/<run-id>/<slug>/research.md + facts.json
Author → .docs/<run-id>/<slug>/card.html + sidecar + manifest + visual evidence
Publisher → 主 checkout manifest promotion → visual gate → build/verify → commit/push → public recheck
```

禁止为任何阶段创建/复用/进入 Git worktree、临时 clone、detached HEAD、发布分支、`/tmp/infocard*` 或 force-push。已有历史 worktree 的清理是独立维护任务，不属于本流程。

## 职责

### Research

- 只调研与核验；
- 输出 `.docs/<run-id>/<slug>/research.md` 与 `facts.json`；
- 必须包含主体、用户原始材料、来源、事实状态、推荐标题/slug、禁止混淆对象和 evidence gaps；
- 不写 HTML、sidecar、manifest、Wiki、Git 或正式 `docs/`。

### Author

- 基于 `.docs` 研究 handoff 写 `.docs/<run-id>/<slug>/card.html`、`card.html.meta.yaml`、`promotion-manifest.json` 和视觉证据；`theme-decision.json` 必须由主题分配阶段在 Author 启动前生成并冻结，Author 只读取和校验，不得创建、修改或回退主题；委派上下文不得预选具体主题；
- 主题由 `infocard-theme-assignment` 唯一决定；Author 只读取并校验该 JSON，不生成候选、排序或第二套主题规则。sidecar 的 `style` 使用同一 registered bare slug（必要时按 canonical normalization 校验）。
- 存疑项保持明确标记，不擅自升级为确定事实；
- 不调研、不 build、不 commit/push、不写正式 `docs/`/`assets/`，不写 Wiki。

### Publisher

1. 记录主 checkout `git status --short`，保留 ambient state；
2. 验证 facts、sidecar、theme decision 和 promotion manifest；
3. 仅将 manifest 声明的 HTML、sidecar、assets promotion 到 `docs/`/`assets/`；
4. 完成桌面和 390px 移动端视觉门禁，绑定当前 HTML hash；
5. 运行 `npm run build`、`npm run verify`、`npm run fix-taxonomy`、`npm run verify-taxonomy`、`npm run check-leak`；
6. 窄范围 stage，禁止 `git add -A`；在主 checkout commit、`git push origin main`；
7. cache-busted 验证详情页、`_index.yaml`、首页、release fingerprint 和公网视觉证据。

## 视觉验收

每张卡使用独立浏览器 session/target；验收后关闭本任务创建的 tab。优先现有 CDP；headless fallback 必须用任务自有临时 profile，只清理自己创建的 profile。截图失败不等于通过；记录 `VISUAL_PENDING`。

宽表格在移动端应使用外层水平滚动容器或 cardized alternative。任何 HTML/CSS/结构变更都要求重新生成桌面和移动证据。

## 失败处理

- Research/Author timeout：检查指定 `.docs/<run-id>/<slug>/`，保留可用产物并补齐缺失阶段；不重新开临时仓库。
- sidecar 格式错误：修复 `.docs` candidate，重新 manifest promotion 和完整门禁。
- non-fast-forward：只在主 checkout 受控 reconcile 一次，再重新运行受影响 build/visual checks；禁止 force-push。
- Publisher 不信任子智能体自述，必须核验实际 `.docs` 文件、promotion diff、Git 状态和公网证据。

## 完成标准

每张卡必须分别报告：`.docs` 路径、manifest mapping、local visual、build/static、main commit、public HTTP/index、public visual 与终态。HTTP 200、CI、build 或子智能体 summary 均不能单独视为完成。

不自动同步 Wiki；只有用户明确要求时才将 Wiki 作为额外阶段。

## 选择指南

| 场景 | 路线 |
|---|---|
| 单 URL、内容明确、低风险 | `infocard-direct-publish` |
| 多来源/复杂背景/明确三阶段 | 本 skill |
| 两张以上的批量协调 | `infocard-multi-publish` |

## Checklist

- [ ] 三个角色只写其允许路径
- [ ] 所有过程产物都在 `.docs/<run-id>/<slug>/`
- [ ] Publisher manifest promotion 精确且在主 checkout
- [ ] 每卡 desktop/mobile visual gate 通过或明确 pending
- [ ] build/static/index/public gates 已核验
- [ ] 未使用 worktree、clone、temp repo、force push 或自动 cleanup
