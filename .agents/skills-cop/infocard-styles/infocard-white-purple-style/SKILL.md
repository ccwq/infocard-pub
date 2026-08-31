---
name: infocard-white-purple-style
description: 白紫轻科技工作台风信息卡主题。适合 AI 驱动开发、流程方法论、阶段拆解、产品/工程工作流与多栏结构化内容；主视觉是白底、紫色强调、轻玻璃科技感与三栏流程布局。
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, style, white, purple, glassmorphism, workflow, process, technical]
---

# infocard-white-purple-style

> Runtime boundary：本 Skill 仅提供视觉差异；通用来源、创作、浏览器验收、构建与发布文字均视为 legacy archive，由核心阶段接管。

## Overview

`infocard-white-purple-style` 是一套面向 **AI 驱动开发 / 方法论拆解 / 流程工作台** 的白紫主题信息卡风格。

它的核心不是炫技，而是把“复杂流程”做成清晰、克制、可扫描的结构化页面：

- 白底为主，保持高可读性。
- 紫色作为唯一主强调色。
- 轻科技工作台气质，允许少量玻璃感，但不做重渐变、重霓虹。
- 优先承接“三栏流程图 / 阶段导航 / 细粒度工件说明”这类内容。

## Use Cases

### 适合

- AI / Agent / 开发方法论
- 七阶段、四阶段、流程链路、闭环框架
- 产品设计、工程协作、任务拆解、决策流程
- Grill / Research / Prototype / PRD / Issues / Implement / Review 这类阶段卡
- 需要“白底 + 紫色强调 + 三栏组织”的技术型信息卡

### 不适合

- 深色海报风
- 手绘白板风
- 纸感笔记风
- 强商业广告感、强品牌传播感
- 需要大量照片、插图、复杂装饰纹理的内容

### 触发词

- 白紫风
- 轻科技工作台
- 玻璃感但克制
- AI 开发流程
- 三栏流程图
- 方法论工作台

### 强制规则（用户明确，2026-07-23）

**方法论相关内容默认使用本主题**。当用户提到"方法论"、"框架"、"流程"、"AI unknowns"、"认知偏差"、"系统思考"等主题时，优先选择 white-purple。

重建 vs 换色：本主题 CSS 骨架（白底、紫色accent、shell 纹理、glass-card、section-label）与 graph-paper/darkblue 等完全不同，方法论卡迁移属于**重建**，不是换色。

## Design DNA

### 关键词

- 白底
- 紫色强调
- 轻玻璃科技感
- 结构化
- 克制
- 清晰
- 可扫描

### 视觉原则

1. **白底优先**：不要让背景抢走信息。
2. **紫色只做重点**：标题、编号、关键标签、流程高亮用紫色。
3. **卡片轻浮起**：可以有非常轻的阴影、边框、玻璃层次，但不能厚重。
4. **流程先于装饰**：任何视觉元素都必须服务于“看懂流程”。
5. **三栏是主骨架**：如果内容是流程拆解，优先采用三栏或三段结构。

## Color Tokens

```css
:root {
  --bg: #f7f7fb;
  --paper: #ffffff;
  --paper-soft: #fbfbfe;
  --ink: #111111;
  --muted: #6b6b7a;
  --line: rgba(91, 73, 255, 0.16);
  --line-strong: rgba(91, 73, 255, 0.32);
  --accent: #8a5cf5;
  --accent-deep: #5b49ff;
  --accent-soft: rgba(138, 92, 245, 0.10);
  --glass: rgba(255, 255, 255, 0.72);
}
```

### Token Usage

- `--bg`：页面底色
- `--paper`：主卡片底色
- `--paper-soft`：次级卡片 / 面板底色
- `--ink`：正文与标题主色
- `--muted`：说明文字、辅助标签
- `--line` / `--line-strong`：边框、分割线、流程框线
- `--accent`：主紫色强调
- `--accent-deep`：更强对比的标题 / 编号 / 选中态
- `--accent-soft`：淡紫底、chip、highlighter
- `--glass`：轻玻璃层效果

## Typography

### 标准层级

- Hero title：34–46px
- Section title：18–24px
- Lead / summary：14–18px
- Body：12.6–14.5px
- Caption / meta / pill：11.2–12px

### 规则

- 中文正文优先可读，不做过小压缩。
- 标题可以粗，但不要过度拉宽字距。
- 数字编号、阶段编号、关键名词可以用紫色加重。
- 移动端最小字号不应低于 11.2px。

## Layout Skeleton

推荐结构：

1. **Top bar / brand strip**
   - 适合放系列名、来源、链接、日期

2. **Hero title block**
   - 主标题 + 一句话总结 + 右侧 stage summary

3. **Stage navigation / flow bar**
   - 横向阶段条或编号条

4. **Three-column body**
   - 左：前置理解 / 对齐
   - 中：执行链路 / 工件
   - 右：原则 / 扩展能力 / 注意事项

5. **Footer**
   - 品牌、来源、日期、补充链接

## Component Rules

### 1. Stage chips

- 用于阶段导航、步骤标签、状态标签。
- 形态应紧凑、边框细、背景浅。
- 选中态只用紫色强调，不要大面积填充。

### 2. Content cards

- 白底或极浅紫白底。
- 边框细，阴影轻。
- 适合承载 stage detail、principle、artifact。

### 3. Callouts

- 用于补充关键原则、提醒、升级版说明。
- 可用淡紫底 + 紫色边线。

### 4. Comparison boxes

- 用于“有代码库 / 无代码库”“推荐 / 不推荐”这种对照。
- 双盒布局应清楚分隔，不要挤成一坨。

### 5. Flow labels

- 适合流程串联、箭头、步骤链。
- 线条细、节点简洁、避免过多装饰。

### 6. Footer branding

- 可保留小型 logo / 署名 / 日期。
- 不抢主标题和流程信息的注意力。

## Mobile Rules

### 720px 以下

- 三栏优先退化为单列或 1+1+1 堆叠。
- 流程条可横向滚动或换行，但不能压缩到不可读。
- 卡片间距要保持，不要用过窄间隔硬塞内容。

### 390px 视口

- 所有主内容必须可完整阅读。
- 表格、对照块、流程块优先纵向堆叠。
- 不要让玻璃效果影响对比度。
- 不要用过强阴影导致页面显得脏。

### Dense-content typography floor

When this theme carries many stacked cards or repo facts, pure `calc(100vw / 72)` rem scaling can collapse body copy too far on 390px devices. Use a mobile floor instead of chasing smaller rem:

- Body / lead text: keep at least ~12px
- Pills / tags / labels: keep at least ~11.2px
- Footer / meta text: keep at least ~11px
- If the screen reads cramped, prefer `html { font-size: 15px; }` or equivalent floors over further shrinking
- Verify the rendered `getComputedStyle()` on the actual mobile viewport, not only a screenshot

### 底线


- 不允许横向溢出。
- 不允许过小字。
- 不允许移动端变成密集“压扁版桌面页”。

## Anti-patterns

- 不要做成深色工作台。
- 不要使用大面积紫色实底铺满整个画面。
- 不要堆叠过重阴影、霓虹光晕、炫光边框。
- 不要混入手绘粗线、纸张纹理、便签贴纸语言。
- 不要让装饰盖过流程信息。
- 不要把卡片做得像广告 banner。

## Acceptance Checklist

- [ ] 白底 + 紫色强调是主视觉
- [ ] 三栏或等价的三段流程骨架清晰
- [ ] 轻科技工作台感成立，但没有过度炫技
- [ ] 字号层级清楚，最小字号满足可读性
- [ ] 移动端可退化，不产生横向溢出
- [ ] 组件只服务于流程信息，不抢叙事
- [ ] 不与 handline / wood / darkblue / redswiss 的气质混淆

## Naming / Aliases

- 英文名：`infocard-white-purple-style`
- 中文名：白紫轻科技工作台风
- 常用别名：白紫风、白紫工作台、轻玻璃紫、workflow white-purple
- 适用 slug：`white-purple-style`

## Notes

本主题由 grill-me 对齐结果归纳而来：

- 视觉质感：轻科技工作台 / 轻玻璃感
- 主版式：三栏流程图
- 重点控制：白底、紫色少量强调、结构优先

如果后续要落地为可发布主题，应同步补充 theme 文件、预览注册和发布验证流程；这些不属于本 skill 的主职责。

## Active theme adapter contract

Implements `infocard-theme-contract@1` as a visual-only adapter. Generic authoring, verification and publishing guidance is deprecated compatibility text.
