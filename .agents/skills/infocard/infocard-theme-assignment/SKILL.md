---
name: infocard-theme-assignment
description: Use when choosing an infocard theme before .docs authoring.
version: 2.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, theme, style, assignment, hardblue, darkblue, redswiss]
    related_skills: [infocard-publish-sop, infocard-style-man-skill, infocard-authoring-workflow, any2card]
---

# 信息卡主题分配

## 适用场景

- 写卡前需要选 `style` / theme；
- 用户询问主题分配标准、主题库存或批量主题塌缩；
- 用户未指定主题，需要自动选型并保留依据；
- 已有卡需要主题重建。

本 skill 只负责选择与验证主题契约；不替代具体 `infocard-*-style` 的 token/组件规范。选定后仍必须读取对应 style skill 与 `theme/<theme>.html`。

## Authoring 与发布边界

主题选择遵循信息卡唯一工作区模型：

```text
.docs/<run-id>/<slug>/theme-decision.txt + candidate artifacts
→ promotion manifest
→ Publisher 在主 checkout 提升到 docs/assets、视觉门禁、build、commit、push
```

禁止 theme assignment 创建、复用、进入或清理 Git worktree；禁止 `/tmp/infocard*`、临时 clone、detached HEAD、发布分支和 force-push。主题选择不直接写 `docs/`、`assets/`、Git state 或生成索引。

## Inventory baseline

注册主题以 `_themes.yaml` 和 `theme/*.html` 实测为准。当前常用注册 family：

```text
q, green, black-head, main, blue-technical-manual, darkblue,
hardblue, redswiss, color-material, wood, handline, darkgreen,
bigwhite, white-purple, graph-paper, pixelstack, scrapbook,
archive-green, sage-swiss, crayon
```

硬规则：

1. `meta.yaml.style` 是声明，不是主题已生效的证据。
2. 只能使用已注册主题；不得为单卡虚构视觉系统。
3. 先分类内容形态，再选择 primary/fallback，再读 style skill 与 theme skeleton。
4. 技术、开源、tool 字样不是 hardblue/redswiss 的自动映射。
5. 用户禁止 `darkblue` 时，必须从其他注册主题中选，不得把 hardblue 与 darkblue 混同。

## 内容形态 → 主题矩阵

| 内容形态 | Primary | Fallback | 不要默认成 |
|---|---|---|---|
| 单一技术工具 / CLI / 实施手册 / agent workflow | hardblue | redswiss | 标题含 tool 就选 redswiss |
| 多工具目录 / CLI ecosystem / 对比图库 | redswiss | main | hardblue |
| AI 架构 / agent 方法论 / paradigm / 系统设计 | darkblue | wood | 仅因技术就 hardblue |
| UI component / React library，live demo 是核心 | darkblue | hardblue | 标题含 tool 就 redswiss |
| X-origin agent framework / harness / control plane | darkblue | hardblue | 把架构叙事误降成普通工具手册 |
| 代码架构 / dependency graph / knowledge network | graph-paper | darkblue | hardblue |
| Security / hardening / monitoring / zero trust | darkgreen | hardblue | darkblue |
| Investigation / conclusion-first deconstruction | black-head | hardblue | q / crayon |
| Tutorial / note-style methodology | white-purple 或 blue-technical-manual | main | hardblue |
| Reading / longform interpretation | paper-warm 或 bigwhite | wood | hardblue |
| Hand-drawn process / parallel scheduling sketch | handline | crayon | hardblue |
| Pixel / retro / game stacking | pixelstack | crayon | hardblue |
| Light overview / sticker-like comparison | q / crayon / scrapbook | main | black-head |
| Simon-Willison-like agentic engineering prose | wood | darkblue | redswiss |
| Brand-green platform product | green | main | hardblue |
| Unknown / mixed / low-confidence | main | hardblue | 未注册主题 |

## Pre-authoring gate

在写候选 HTML 前，把以下内容保存在 `.docs/<run-id>/<slug>/theme-decision.txt` 或 frozen bundle：

```text
content_shape: <matrix row>
theme_primary: <registered theme>
theme_fallback: <registered theme>
theme_reject: <why nearby themes were rejected>
```

缺少任一行即 `THEME_BLOCKED`。作者不能静默覆盖研究/主题建议；任何 override 必须记录理由，并重新按选中主题 skeleton 检查。

## Batch diversity gate

批量 `>= 2` 张卡时：

- 每张卡独立记录 `content_shape`、`theme_primary`、`theme_fallback`、`theme_reject`；
- 同一主题复用默认阻塞；只有所有卡片确实具有相同内容形态、读者场景和信息密度，或用户明确授权单色批次时才可保留；
- 同主题例外必须在 bundle 记录 `same_theme_exception` 三部分理由；
- Publisher promotion/build/push 仍在一个主 checkout 串行进行，不能为每卡创建 worktree。

## Mechanical theme implementation gate

Publisher promotion 后、build 前，每张卡必须验证：

1. sidecar `style` 规范化后对应已注册 bare theme；
2. HTML 有匹配 `data-theme="<bare-slug>"`；
3. 目标主题 CSS token signature 存在；
4. 至少两个目标 structural signatures 存在。

声明与实现不一致、主题未注册或批量复用未获批准时，停止为 `THEME_BLOCKED`。

## Existing card theme rebuild

主题重建不是 metadata 换色。正确流程：

1. 只读已有 `docs/<slug>.html`、sidecar 与 target `theme/<theme>.html`；
2. 将原内容和新主题 decision 写入 `.docs/<run-id>/<slug>/`；
3. 从目标主题 skeleton 重建 `.docs` 中 candidate HTML，保留所有原始内容模块；
4. 更新 `.docs` sidecar candidate 的 canonical `style`；
5. 创建 promotion manifest，仅声明正式 HTML、sidecar 与必要 assets；
6. Publisher 在主 checkout promotion 后执行新一轮桌面/移动视觉门禁、build、verify、commit、非强推 push 与公网复核。

不得使用工作树、临时分支、force-push 或“只改 meta.style”的伪重建。任何 HTML/CSS/结构变更都会使先前视觉证据失效。

## After selection

1. 读取 `infocard-<theme>-style`（存在时）；
2. 读取 `theme/<theme>.html`；
3. 在 `.docs` 写候选 HTML；
4. 写 formal sidecar candidate 与 promotion manifest；
5. 由 Publisher 完成 mechanical gate 与正式发布。

## Closeout must report

- `content_shape`
- `theme_primary` / `theme_fallback`
- style skill loaded（或 theme-only）
- token/signature verification result
- `.docs` authoring path 与 manifest source-to-target mapping
