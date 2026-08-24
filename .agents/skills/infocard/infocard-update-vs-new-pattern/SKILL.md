---
name: infocard-update-vs-new-pattern
description: Use when deciding whether an infocard needs an update or a new card before .docs authoring.
category: infocard
version: 2.0.0
---

# 信息卡：更新还是新建

## 决策标准

在创建候选稿前完成只读重复审计：同时检查当前本地 `origin/main` 与公开索引，并记录证据路径。

| 信号 | 决定 |
|---|---|
| 同一叙事，仅 Stars / 版本 / 小量数据刷新 | 更新既有卡 |
| 同一读者、同一对象、数据刷新 | 更新既有卡 |
| 不同叙事角度、新 major feature/version | 新卡 |
| 来源或受众实质不同 | 新卡 |
| 新增内容超过约 30% | 新卡 |

关键词相似不是重复。相同 canonical repository/source URL、项目身份或既有 slug 才是 exact match；相邻概念只可作为上下文。

## 无 Worktree 运行边界

只读审计不得 reset、stash、clean、写 `docs/`、commit 或 push。信息卡不创建、不复用、不进入 Git worktree，也不使用 `/tmp/infocard*` 或临时 clone。

新卡和更新卡都遵循：

```text
.docs/<run-id>/<slug>/ candidate + facts + promotion-manifest
→ Publisher 精确提升到 docs/ 与 assets/
→ 主 checkout visual gate → build → verify → commit → push
```

## Update workflow

1. 在 `.docs/<run-id>/<old-slug>/` 复制/生成候选 HTML 与 sidecar；保留原 `slug`、`path`、首发 `date`。
2. 只更新应变化的 title、desc、updated、tags、source_url、正文事实和视觉证据。
3. 写 promotion manifest，target 必须是既有 `docs/<old-slug>.html` 与同名 sidecar；不得创建新 slug/path。
4. Publisher 在主 checkout promotion，重新执行视觉门禁、build、verify、taxonomy、leak、窄 staged diff、非强推 push 与公网复核。

禁止 `cp old.html new.html` 形成孤儿卡，也禁止直接在 `docs/` 上由 Author 打补丁。

## New-card workflow

1. 在 `.docs/<run-id>/<new-slug>/` 创建候选 HTML、sidecar、facts 和 manifest。
2. 记录为何既有卡不是 exact match。
3. manifest target 指向唯一正式 `docs/<new-slug>.html` 和 sidecar。
4. 由 Publisher 完成 promotion 和所有发布门禁。

## Leak false positive

若正式 HTML 中的 `git@github.com` 被 leak scanner 误判为邮箱，改成 `github.com` 再重新运行 card-scoped leak check；不得忽略 HIGH 告警。

## 验收

- [ ] 重复审计记录 exact / adjacent / no-match
- [ ] 作者只写 `.docs`
- [ ] update 保留原 slug/path/date
- [ ] manifest target 唯一、位于 docs/ 或 assets/
- [ ] Publisher 在主 checkout 完成 visual/build/static/public gates
- [ ] 未创建、进入、复用或清理 worktree
