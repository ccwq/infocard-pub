---
name: infocard-darkblue-style
description: 深蓝渐变 / 玻璃面板 / 图标化工作台的信息卡风格。用于把 Agent IDE、桌面工作台、并行任务管理、开发者工具类内容做成深色高对比、带渐变光晕和图标组件的展示型 infocard。
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, style, dark-blue, gradient, glassmorphism, icons, ide, workbench]
    related_skills: [any2card, infocard-style-man-skill, infocard-pub-publisher]
---

# infocard-darkblue-style

> Runtime boundary：本 Skill 仅提供视觉差异；通用来源、创作、浏览器验收、构建与发布文字均视为 legacy archive，由核心阶段接管。

## Overview

`infocard-darkblue-style` 是一种面向 **Agent-first IDE / 桌面工作台 / 开发者产品** 的深蓝渐变风格。

它的视觉锚点不是纸感、瑞士黑头或手册骨架，而是：
- 深蓝黑底 + 冷色渐变光晕
- 玻璃感面板与发光边缘
- 任务、工作区、终端、编辑器、统计等模块化卡片
- 颜色更像产品宣传页而不是纯文档页
- 图标化表达，强调“工作台感”

## Use Cases

### 适合
- Agent IDE、AI 编程工作台、桌面应用宣传页
- 并行任务、终端、编辑器、Git、状态看板
- 开发者工具、生产力工具、控制台类信息卡
- GitHub repo 里带“终端状态总览 / dashboard / monitor / workbench”这类语义时，优先把 hero 图作为屏幕化界面锚点，标题保持产品姿态，不退化成纯工具清单；若 README / 用户截图能直接证明工作台形态，优先保留并本地化为 hero 视觉。

### 不适合
- 纸感手作风、Q 风、暖色编辑风
- 黑头调查拆解风
- 红黑瑞士工具图鉴风
- 需要大量暖纸留白或报刊式排版的内容

### 触发词
- 深蓝 / dark blue
- 渐变光晕
- 玻璃面板
- 工作台 / workbench
- IDE / agent IDE
- 图标化卡片
- 终端 + 编辑器 + 任务看板
- **教学项目 / teaching / educational / 小而可读 / teaching project（coding agent 类仓库）**
- **harness / teaching agent / 极简 agent / smol agent / minimal agent**

## Design DNA

- **情绪**：冷静、现代、偏未来感
- **结构**：多面板并列，像产品界面而不是单页文章
- **视觉锚点**：渐变条、浮层面板、图标圆角按钮、发光进度条
- **色彩策略**：深底承载，青蓝为主，绿色/黄色/紫色做状态和装饰
- **内容组织**：hero + shell + status + feature row + CTA
- **核心感受**：这是一个“Agent 工作台”，不是普通网页海报

## Color Tokens

推荐使用以下 token：

```css
:root {
  --bg: #0c1020;
  --bg-2: #11162a;
  --panel: #171c2b;
  --panel-2: #0f1424;
  --ink: #eef4ff;
  --muted: #a8b7df;
  --line: rgba(255,255,255,.12);
  --cyan: #58c3ff;
  --blue: #4a78ff;
  --green: #2db36a;
  --yellow: #f4c84c;
  --purple: #8459ff;
  --soft: #eef4ff;
}
```

### Token 用途
- `--bg` / `--bg-2`：页面背景、深层底色
- `--panel` / `--panel-2`：玻璃面板、卡片底
- `--ink`：主文字
- `--muted`：说明文字、路径、辅助信息
- `--line`：边框、分隔线
- `--cyan` / `--blue`：主强调、链接、进度条起点
- `--green`：运行中 / 成功 / 活跃状态
- `--yellow`：警告、提醒、计数点
- `--purple`：下载按钮、主 CTA、渐变尾色

## Typography

建议字号层级：
- Hero title：`clamp(34px, 7vw, 86px)`，weight 950
- Hero subtitle：`clamp(15px, 2vw, 20px)`
- Chinese subline：`clamp(13px, 1.6vw, 16px)`
- Panel title：`13px–14px`，weight 900，略增字距
- Body：`12px–13.8px`
- Stat / label / path：`10.5px–12px`
- 最小字号底线：`11px`

## Layout Skeleton

推荐结构：

1. **Hero**
   - kicker
   - title
   - 英文 tagline
   - 中文补充说明
   - pill row
   - gradient callout

2. **Shell / Workbench**
   - 左：workspace / project list
   - 中：tasks / terminal / editor / diff
   - 右：status / stats / donut / activity

3. **Feature Row**
   - 6–7 个图标化功能卡
   - 每个卡片一个 icon + 短标签

4. **CTA**
   - 渐变下载/开始按钮

5. **Footer**
   - 项目名、Stars、归属信息

## Component Rules

### Gradient bars
- 可以使用蓝 → 紫、青 → 绿、黄 → 紫等渐变
- 渐变应该是“分区感”与“能量感”，不是彩虹海报
- 允许出现在 hero 背景、进度条、CTA、强调边缘

### Glass panels
- 卡片背景偏深，边框半透明
- 阴影要柔，不要做成厚重黑影
- 面板之间要有明显层级，但不能太空

### Icons
- 优先使用 **SVG / 线性图标 / 简洁几何图标**
- 圆形或圆角方形底座都可
- 图标颜色建议白色、青色或按状态染色
- 避免把 emoji 当成主图标；emoji 只适合草稿，不适合正式预览页

### Status chips
- 用于显示任务状态、工作区、标签、能力点
- 形态应统一：圆角、细边框、低饱和填充

### CTA button
- 主按钮使用蓝紫渐变或青紫渐变
- 保持高可见度，但不要抢过 hero title

## Mobile Rules

- 720px 以下优先单列化 shell
- feature row 从 6/7 列降为 2 列或 1 列
- CTA 按钮在移动端改为全宽
- 保留渐变和图标，不要把深色背景改成浅色
- 标题可缩小，但不能丢掉强烈的夜间产品感
- 390px 下必须避免横向溢出，卡片内部 padding 要统一

## Anti-patterns

- 不要把它做成 hardblue / redswiss 的红黑瑞士风
- 不要加暖纸纹理、纸边、贴纸感、手作感
- 不要把渐变变成大面积霓虹噪点
- 不要使用过多鲜艳纯色，尤其是大面积红色
- 不要用杂乱 icon 拼贴取代统一视觉系统
- 不要让面板看起来像普通博客卡片

## Acceptance Checklist

- [ ] 深蓝背景 + 渐变光晕存在
- [ ] 面板有玻璃感、边框和层级
- [ ] 图标组件统一且可读
- [ ] hero / shell / feature row / CTA 结构完整
- [ ] 主要状态色以青蓝绿黄紫为主
- [ ] 390px 下无横向溢出
- [ ] 预览页与 `_themes.yaml` 命名一致

**已验证 commit（可直接对照 live 渲染）：**
- `03bd43f`（2026-06-13）：baoyu-design，GitHub repo 信息卡，https://ccwq.github.io/infocard-pub/docs/20260613-baoyu-design.html — 桌面 + 移动端全 PASS

## Naming / Aliases

- 英文名：`infocard-darkblue-style`
- 中文名：深蓝渐变风 / 深蓝工作台风
- 常用别名：darkblue、agent workbench、dark blue gradient
- 主题 slug：`darkblue`
- 对应预览页：`theme/darkblue.html`

## Routing: When to Choose darkblue vs hardblue

`darkblue` 和 `hardblue` 都可用于 GitHub 仓库技术分享，但边界不在于"工具 vs 框架"，而在于**内容的结构复杂度**：

| 特征 | 选 darkblue | 选 hardblue |
|---|---|---|
| 多阶段工作流（3+ phases） | ✅ 5-phase loop，循环闭环 | 勉强 |
| 平台支持矩阵（6+ platforms） | ✅ 平台支持度进度条 | ✅ |
| 上下文/状态管理体系 | ✅ STATE.md, .planning/, cache 设计 | ❌ |
| 单一工具 / CLI / 命令行 | ❌ 易显得过重 | ✅ 直接 |
| 2–4 个核心能力 pillars + stats | ✅ 也适合 | ✅ 也适合 |
| Agent 元框架 / context engineering | ✅ 工作台感强 | ❌ |
| 中间件 / 基础设施代理 | ✅ | ✅ |
| **AI 模型 / 开源项目（技术原理展示）** | ✅ Hero + 数字徽章 + R-SWA SVG 原理图 + Feature Card + Data Wall + Audience Grid + Sources 完整结构 | ❌ |
| **Agent 数据网关 / MCP 服务** | ✅ Agent 应用层 + 多平台 + 计费说明 | ❌ |
| **开发者工具 + 平台覆盖矩阵** | ✅ 多能力导航 + 状态面板 | ❌ |
| **Coding Agent 教学项目** | ✅ 三层架构图 + 教学定位差异表 + 事件流解耦叙事 | ❌ |

> **AgentKey 案例（2026-07-09）**：AgentKey（chainbase-labs）是一个 MCP gateway，面向 Claude Code / Codex / Cursor 等 agent 提供网页搜索 + 社媒 + 链上数据的统一接口，典型结构是 Hero → Shell（能力导航 + 平台覆盖 + 计费状态） → Install → Not-混淆 → 存疑 → Feature Row → Footer。这类卡的写作要点见 `references/agentkey-content-pattern.md`。

**实测案例（2026-06-12）：**
- `open-gsd/gsd-core`（meta-prompting + context engineering + 5-phase loop + 12 platforms）→ darkblue ✅
- `borhen68/TokenTamer`（AST compression + cache-first design + 5 clients + 8 languages）→ darkblue ✅
- `chainbase-labs/Agentkey`（MCP gateway + 10+ platforms + credits 计费）→ darkblue ✅
- 两者的共同特征：多阶段、多平台、状态管理 → 工作台 metaphor 强，选 darkblue

| 特征 | 选 darkblue | 选 hardblue |
|---|---|---|
| 多阶段工作流（3+ phases） | ✅ 5-phase loop，循环闭环 | 勉强 |
| 平台支持矩阵（6+ platforms） | ✅ 平台支持度进度条 | ✅ |
| 上下文/状态管理体系 | ✅ STATE.md, .planning/, cache 设计 | ❌ |
| 单一工具 / CLI / 命令行 | ❌ 易显得过重 | ✅ 直接 |
| 2–4 个核心能力 pillars + stats | ✅ 也适合 | ✅ 也适合 |
| Agent 元框架 / context engineering | ✅ 工作台感强 | ❌ |
| 中间件 / 基础设施代理 | ✅ | ✅ |

**实测案例（2026-06-12）：**
- `open-gsd/gsd-core`（meta-prompting + context engineering + 5-phase loop + 12 platforms）→ darkblue ✅
- `borhen68/TokenTamer`（AST compression + cache-first design + 5 clients + 8 languages）→ darkblue ✅
- 两者的共同特征：多阶段、多平台、状态管理 → 工作台 metaphor 强，选 darkblue

## References

- `references/nezha-source-and-creation-log.md` — 视觉来源（ Nezha 产品图提取的 token/layer）、主题创建完整链路、已知限制
- `references/darkblue-css-only-visual-approach.md` — **纯 CSS 视觉元素工作流**：orb / strip / SVG icon / glass panel / bar-row / phase strip 的精确 CSS 片段，无需外部图片即可构建完整的 darkblue 信息卡。经验来自 gsd-core + tokentamer (2026-06-12) 全程无图实践。
- `references/github-repo-darkblue-workflow.md` — **GitHub 仓库 → Darkblue 信息卡**完整工作流：delegate_task 调研 + read_file theme/darkblue.html 模板 + 写作结构 + 验证。经验来自 baoyu-design (2026-06-13)。
- `references/session-notebooklm-py-darkblue-fit.md` — 这类“自动化控制层 / 研究引擎 / CLI+MCP+REST”仓库卡也可归入 darkblue，而不必局限于 IDE 产品宣传页。
- `references/fireworks-tech-graph-darkblue-workflow.md` — GitHub repo 信息卡工作流（process file 缺失时回退到 README.md）+ GitHub raw CDN 图片 + onerror fallback 占位图模式 + Loop Engineering 流程图 CSS 片段 + Structured SVG Validator / Visual Review Gate 内容提取。
- `references/terminal-statusline-repo-darkblue-pattern.md` — Claude Code / coding-agent statusline、终端状态看板、Powerlevel10k-style UI 仓库的信息卡结构；包含零 token 本地观测层叙事、AI-interview installer flow、本地化截图与移动端字号验收坑点。
- `references/coding-agent-teaching-project-pattern.md` — **Coding Agent 教学项目**（huggingface/tau 类）写作模式：识别信号、三层架构图 CSS 写法、教学差异对比表核心逻辑、核心一句模板。
- `references/ai-model-card-darkblue-pattern.md` — **AI 模型/开源项目信息卡**（非 IDE 产品类）darkblue 写法：Hero + 数据徽章 + R-SWA 原理 SVG 图 + Feature Card + Data Wall + Audience Grid + Sources 完整结构。来源：20260722-unlimited-ocr-rswa (Unlimited OCR) 全流程。
- `references/darkblue-theme-classes.md`（在 `infocard-creation-preview-standards` 中）— darkblue 主题 CSS class 速查，含调色板、hero/card/pill/grid 布局、SVG 简图规范。

## Notes

这个风格最适合表达“Agent-first IDE / 类 Nezha 的桌面工作台产品”。如果内容变成纯文档、纯调查或纯知识卡，应改用更合适的主题。

## Active theme adapter contract

This package implements `infocard-theme-contract@1` as a visual-only adapter. Earlier generic authoring, browser verification and publishing instructions are deprecated compatibility guidance; the core authoring, quality and delivery stages own them.
