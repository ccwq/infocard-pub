# Taxonomy changed-only 作用域陷阱（2026-07-08）

## 触发场景

在临时 worktree 中发布一张新调查卡：

- 新增 `docs/20260708-china-india-visa-populism.html`
- 新增同名 `.meta.yaml`
- 新增 `report.md`
- 运行 `npm run fix-taxonomy`

因为 worktree / base ref 状态不完整，`fix-taxonomy` 没有只改目标卡，而是改了数十个历史 `docs/*.meta.yaml`。

## 失败表现

`npm run build` 进入 `verify-meta-timestamps.js` 后失败，报错类似：

```text
Timestamp metadata gate failed:
- docs/20260704-ai-research-feedback.html.meta.yaml: missing required updated
- docs/20260706-schedule-x.html.meta.yaml: date must be Asia/Shanghai wall-clock "YYYY-MM-DD HH:MM:SS", got '2026-07-06'
...
Use:
  publish_ts=$(TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M:%S')
  date: "$publish_ts"
  updated: "$publish_ts"
```

根因不是目标卡 meta 错，而是无关历史 meta 被本轮工具修改后，被 timestamp gate 视为 changed cards。

## 恢复步骤

1. 立刻检查 diff：

```bash
git status --short
```

2. 若发现无关历史 meta 修改，不要继续 build，也不要补历史卡时间戳；先恢复无关变更：

```bash
git restore -- docs '*.meta.yaml' _index.yaml index.html
```

3. 重新写目标卡 `.meta.yaml`，手动填好 taxonomy：

```yaml
taxonomy:
  domains:
    - 舆情 / 调查
  tool_types:
    - 数据处理工具
  stages:
    - 调研 / 选型
    - 风险评估
  interaction:
    - Web 应用
  content_type:
    - 调查报告
  source:
    - Website
    - News
  style:
    - black-head
  risk:
    - 政策敏感
```

4. 再执行验证：

```bash
npm run build
npm run verify
npm run verify-taxonomy
node scripts/verify-filter-index.js --slug <slug>
```

## 预防规则

- 对单张新卡，优先手写 taxonomy，不依赖全仓自动修复。
- 任何 `fix-taxonomy` 后都必须立刻看 `git status --short`。
- build 前的 diff 应只包含：目标 HTML、目标 meta、目标 report（如有）、`_index.yaml`、`index.html`。
- 不要为了通过本次发布而批量修历史 meta；那会扩大变更范围并制造新的 CI 风险。
