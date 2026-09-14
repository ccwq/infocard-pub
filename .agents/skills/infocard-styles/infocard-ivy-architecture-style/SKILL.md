---
name: infocard-ivy-architecture-style
description: Ivy 架构图谱。分层式系统架构信息卡主题：左侧层级标签 + 右侧模块面板，蓝/紫/绿/红/橙五色语义，实线调用与虚线触发，适合 Agent 编排、基础设施拓扑和可观测性内容；不适合散文、人物或轻量清单。
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, ivy-architecture, architecture, layered, semantic-color, style]
    related_skills: [infocard-style-man-skill, infocard-theme-assignment, infocard-mobile-verifier]
---

# infocard-ivy-architecture-style · Ivy 架构图谱

## Overview

`infocard-ivy-architecture-style` 把分层式系统架构图转译为可读的信息卡：左侧窄列承担层级标签，右侧模块面板承载节点与职责；层与层之间用“流向说明”而非复杂连线表达系统自上而下的执行路径。

它解决的问题是：架构类内容在普通三栏卡片里只能被压成并列 feature，丢失“入口 → 编排 → 执行 → 持久化 → 观测”的顺序感。

## Use Cases

适合：
- Agent / 多智能体系统架构（Dispatcher、Planner、Coder、Tester、Reviewer）
- API Gateway、租户鉴权、限流等平台边界
- 队列、任务系统、数据库、缓存、持久化拓扑
- Docker / Sandbox / Human-in-the-loop 运行时
- LangSmith / Prometheus / Grafana 可观测性
- 调用链、数据流、CI/CD 流水线拆解

不适合：
- 纯产品宣传或情绪化海报
- 人物故事、访谈记录
- 无模块关系的清单文、随笔
- 需要手绘、纸感、拼贴气质的内容

触发词：系统架构、分层架构、Agent 编排、拓扑、调用链、数据流、基础设施、可观测性。

相近主题区分：`graph-paper` 偏节点—边—路径的解释纸感；`darkgreen` 偏运行状态监控；本主题聚焦“分层边界 + 模块职责 + 流向”，视觉重心是层，不是单条边。

## Design DNA

- 气质：工程蓝图 × 系统拓扑，冷静、精确、可扫读
- 视觉锚点：左层级标签列 + 层面板 + 五色语义节点 + 流向条
- 信息密度：高，但以“层”为单位分块，不堆砌
- 情绪强度：低，强调边界与秩序
- 关键词：layer / pipeline / boundary / flow / observability

## Color Tokens

```css
:root{
  --bg:#f4f6fb;        /* 蓝图纸底 */
  --paper:#ffffff;     /* 层面板底 */
  --ink:#0f1b2d;       /* 主墨色 */
  --muted:#5a6b82;     /* 次级说明 */
  --line:#d7deea;      /* 边界线 */
  --blue:#2563eb;      /* 系统入口 / 平台边界 */
  --blue-soft:#e8effd;
  --purple:#7c3aed;    /* Agent / 编排 / 推理 */
  --purple-soft:#f1ebfd;
  --green:#059669;     /* 执行链 / 工具 / 任务流 */
  --green-soft:#e5f5ef;
  --red:#dc2626;       /* 队列 / 数据库 / 持久化 */
  --red-soft:#fdecec;
  --orange:#d97706;    /* 监控 / 告警 / 人工介入 */
  --orange-soft:#fdf3e3;
  --code:#0f1b2d;      /* 代码块底 */
  --code-ink:#e8eefb;
}
```

## Typography

- Hero title：44–72px，字重 900，负字距，深墨色
- 层级标签：11–12px 等宽大写，语义色高亮
- 节点标题：15–17px，700
- 节点描述：12.5–14px，muted
- Body：14–15px；最小字号 11.2px
- 移动端标题 30–44px，节点描述 ≥12px

## Layout Skeleton

```text
page
├─ arch-header（系统名 / 标题 / 摘要 / 图例）
├─ layer-stack（自上而下：每层 = 左标签列 + 右面板）
│   └─ layer-panel > node-card × N（图标点 + 标题 + 职责）
├─ flow-strip（层间流向说明：实线=调用 虚线=触发）
├─ matrix（关系/依赖矩阵，横向滚动）
├─ code-block（配置 / 命令）
├─ risk-panel（边界与风险，红色系）
└─ arch-footer（来源 / 快照 / 未验证声明）
```

## Component Rules

- 层标签：等宽大写 + 语义色圆点；一个层一个语义色，不混用
- 节点卡：白底 + 1px line 边框 + 4px 左侧语义色条；标题下加一句职责
- 流向条：用“↓ 调用 / ⇢ 触发”字符 + 文案表达，不画跨层长线
- 矩阵：表头深墨底白字；单元格语义色点 + 短语
- 代码块：`--code` 深底 + `--code-ink`，等宽，可横向滚动
- 风险面板：`--red-soft` 底 + `--red` 左条，只用于边界/风险
- 图例：header 内固定出现，解释五种语义色

## Mobile Rules

- 900px 以下：层标签列折叠为面板顶部横条
- 520px 以下：节点卡单列；矩阵容器横向滚动（min-width 760px）
- 流向条改纵向小字；不保留横向架构长图
- 390px 必须 scrollWidth == clientWidth

## Anti-patterns

- 不用跨层绝对定位连线；关系一律用文字化流向条表达
- 不把语义色当装饰：紫色块里不放“监控”，橙色只用于观测/人工
- 不用大面积深底；深色只出现在代码块
- 不使用投影堆叠制造层级；层级靠背景与边框
- 移动端不保留多列层面板

## Acceptance Checklist

- [ ] header 含图例，五色语义可解释
- [ ] 每层左标签 + 右面板结构完整
- [ ] 节点 = 语义点 + 标题 + 职责
- [ ] 层间有流向说明
- [ ] 矩阵/代码块/风险面板各至少一个
- [ ] 390px 无横向溢出，节点单列
- [ ] 颜色全部走 CSS 变量，组件无硬编码
- [ ] data-theme="ivy-architecture" 与 bundle.style、meta.style 一致

## Naming / Aliases

- 英文名：`infocard-ivy-architecture-style`
- 中文名：Ivy 架构图谱
- 别名：ivy、架构图谱、分层架构主题
- slug：`ivy-architecture`
- theme：`theme/ivy-architecture.html`
