---
name: infocard-paper-warm-style
description: 为知识卡片提供暖纸感、手帐感的视觉设计规范与可复用 CSS/HTML 组件。仅负责视觉风格与静态设计自检。
---

# Paper Warm 信息卡风格

> Runtime boundary：本 Skill 仅提供视觉差异；通用来源、创作、浏览器验收、构建与发布文字均视为 legacy archive，由核心阶段接管。

适用于知识卡片、学习笔记、生活方式内容与轻量信息图。核心气质：暖纸张、低饱和色、轻微手作感、清晰阅读层级。

## 1. 视觉语言

- 背景使用米白、暖灰或极浅纸纹，不使用高噪点纹理干扰阅读；
- 主色控制在 1 个强调色和 1–2 个辅助色；
- 保持高文本对比度，正文优先于装饰；
- 使用圆角、虚线、便签、胶带等元素时保持克制；
- 信息层级依靠字号、间距、分区与留白，不靠堆叠卡片。

## 2. Tokens

```css
:root {
  --paper: #f7f1e7;
  --surface: #fffaf2;
  --ink: #3d342c;
  --muted: #786d62;
  --accent: #c46e4d;
  --accent-soft: #efd1bd;
  --line: #dfd1c1;
  --radius: 18px;
  --shadow: 0 10px 28px rgba(80, 55, 35, .10);
}
```

正文建议至少 16px，行高 1.6–1.8；标题保持明显层级，避免超长标题挤压正文。

## 3. 布局与组件

- 顶部：标题、简短导语、来源/日期等弱信息；
- 正文：2–5 个可扫描分区，每区有小标题和清晰要点；
- 强调内容：用 note、quote、tip 等少量组件承载；
- 底部：来源、行动建议或轻量 CTA，不能喧宾夺主；
- 宽屏限制内容最大宽度；窄屏单列，避免依赖 hover 才能读到关键信息。

示例：

```css
.card { max-width: 760px; margin: 0 auto; padding: 32px; color: var(--ink); background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow); }
.note { padding: 16px; background: var(--accent-soft); border-radius: 12px; }
@media (max-width: 480px) { .card { padding: 20px; border-radius: 12px; } }
```

## 4. 内容与可读性规则

- 避免大段连续密集文字；将长内容切成有标题的段落或列表；
- 不以浅色文字放在浅纸色背景上；
- 图片必须有 alt；涉及事实的数据、引用或图片要标明来源；
- 没有图片时布局仍应完整；背景图失败时纯色背景仍可用；
- 不机械复刻参考图，保留“同一设计家族”的气质即可。

## 5. Border seam and overlap guard

暖纸主题的外框、标题栏和内容卡片必须遵循“单一外框、内部单线分隔”原则，避免相邻组件各自绘制边框造成双线、重叠或局部加粗。

Canonical pattern:

```css
/* one outer frame */
.compare, .arch, .timeline {
  border: 1.5px solid var(--line);
  overflow: hidden;
  box-shadow: none;
}
/* header/content seam is not drawn twice */
.compare-head, .arch-head, .timeline-head { border-bottom: 0; }
.compare-table, .matrix, .vs-table { border: 0; border-collapse: collapse; }
```

Rules:
- A bordered header must live inside one bordered parent; do not combine a header `border-bottom` with the next child’s `border-top`.
- Do not use negative margins, absolute positioning, or overlapping shadows to hide a doubled seam.
- Mobile cardized table rows use one border and no shadow by default; adjacent rows are separated by `gap`, not stacked borders.
- After any theme-driven HTML generation, inspect every boundary where a colored header meets a white content panel at desktop and 390px mobile widths.
- Treat a visibly doubled seam, clipped right edge, or inconsistent border thickness as a `major` visual defect until a fresh screenshot confirms the repair.

## 6. 静态设计自检

交给发布编排前检查：

- [ ] 320px 宽度下无横向溢出；
- [ ] 标题在 2–3 行内仍可读；
- [ ] 中文正文不拥挤，行高足够；
- [ ] 无图片时页面完整；
- [ ] 来源信息清晰但不喧宾夺主；
- [ ] 分区层级明确，避免“全部都是卡片”；
- [ ] 至少一个情绪锚点但不过度装饰；
- [ ] 与参考图同一设计家族而非机械复制。

## 6. 职责边界

本主题 Skill 只负责视觉语言、tokens、排版、组件和响应式规则。

不得在本主题 Skill 中加入：启动 preview、固定端口、健康检查、进程管理、截图、视觉评分、`npm run preview`、`npm run publish`、发布或部署流程。以上运行时工作由 `any2card` 调用 `web-visual-acceptance` 完成。

## Active theme adapter contract

Implements `infocard-theme-contract@1` for visual identity only. Generic authoring, browser verification and publishing text above is deprecated compatibility guidance; core stages own those decisions.
