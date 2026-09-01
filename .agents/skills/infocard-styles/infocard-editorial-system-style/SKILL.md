---
name: infocard-editorial-system-style
description: 编辑系统杂志风信息卡主题。用于把研究摘要、产品说明、方法论与项目复盘组织成高对比、强层级、可扫描的 editorial system 页面。
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, editorial, magazine, system, research, hierarchy]
related_skills: [infocard-theme-assignment, infocard-theme-validation, infocard-mobile-verifier]
---

# infocard-editorial-system-style

## Overview

Editorial System 是一套“编辑部版式系统”视觉契约：以暖白纸张为画布，以深墨色和深海军蓝建立骨架，用大号线框编号、双语标签、规则线和低饱和模块组织长内容。它解决信息卡常见的“标题漂亮但阅读路径不清”问题，强调可检索、可引用和可复用，并能承载生活方式海报式的功能清单。

## Use Cases

适用：研究摘要、产品/工具说明、工程方法论、项目复盘、政策或行业简报。

不适用：需要沉浸式插画、游戏化仪表盘、低对比情绪海报的内容。

触发词：editorial、杂志、版式系统、栏目、研究手册、编者按、功能清单。

与 Big White 的区分：Editorial System 使用更强的黑色结构线、编号栏、深海军蓝结论区和浅色模块；不是纯白商务留白。与 Graph Paper 的区分：不使用网格/节点图作为主视觉；关系通过栏线和顺序表达。

## Design DNA

- 气质：理性、编辑化、克制但有观点。
- 密度：中高密度；每屏有明确栏目锚点，正文以短段和列表切分。
- 主视觉锚点：左侧超大线框编号（常用 5）与主题说明，右侧 1–5 功能卡（2×2 加横跨卡），辅以深海军蓝标题和浅绿/浅蓝模块面。
- 纹理：仅允许极轻的纸色渐变或细噪点替代，不使用抢眼背景图。

## Color Tokens

```css
:root {
  --editorial-paper: #f5f2eb;
  --editorial-surface: #fffdf8;
  --editorial-ink: #171717;
  --editorial-muted: #6b665e;
  --editorial-line: #1d1d1b;
  --editorial-line-soft: #d8d2c8;
  --editorial-navy: #17324d;
  --editorial-navy-soft: #dfe9f2;
  --editorial-mint: #e4eee8;
  --editorial-sky: #e5eef4;
  --editorial-shadow: 0 8px 22px rgba(23,23,23,.08);
  --editorial-accent-green: #63bd79;
  --editorial-radius: 2px;
}
```

深海军蓝用于编号、关键标签、状态或行动提示及底部结论区；浅绿/浅蓝只承载模块分组，绿色 accent 仅用于英文副标题和要点标记。避免高饱和红色、荧光色和大面积彩色铺底。

## Typography

标题使用具有人文感的衬线字体（Georgia / Noto Serif CJK SC 等），正文使用系统无衬线；栏目眉题、编号和代码使用等宽字体。桌面标题建议 `clamp(2.6rem, 7vw, 6.5rem)`，正文 15–18px、行高 1.6–1.75；移动端标题不低于 2rem，正文不低于 15px。

## Layout Skeleton

1. `masthead`：品牌/期号/来源，细黑线分隔。
2. `hero`：左侧 `feature-intro`（大号 outline number、中文主题、英文副标题、说明），右侧标题导语和 `feature-grid`。
3. `feature-grid`：五张功能卡，桌面 2×2 加第 5 张横跨；卡内含半透明编号、中英文标题、短说明和低存在感线稿图标。
4. `signal-bar`：短深蓝规则线与一句结论，作为阅读转折。
5. `steps`：三步操作区，使用图标、标题和短说明。
6. `dark-closing`：深海军蓝结论区，白色标题、绿色英文副标题和四条要点；`closing-note` 保留版本/来源提示。

外层只保留一个主边框；相邻区块通过共享分隔线连接，避免双线接缝。内容宽度建议 `min(1180px, calc(100% - 32px))`。

## Component Rules

- `.eyebrow`：全大写/小型大写等宽字，字距宽，颜色用 `--editorial-navy` 或 muted。
- `.feature-intro` / `.outline-number`：左侧主视觉编号和主题说明，编号使用描边而非实心填充。
- `.feature-card`：浅绿/浅蓝背景、轻边框、小圆角；编号低透明度，图标置于右下角，不抢正文焦点。
- `.steps`：三列操作步骤，图标仅作识别锚点，文案保持短句。
- `.dark-closing`：深海军蓝大面积收束，绿色只用于英文副标题和 bullet 标记。
- `.rule`：1px 深墨线或虚线，承担分组而非装饰。
- `.quote` / `.callout`：暖白底、黑线、左侧海军蓝短条；模块卡可使用浅绿或浅蓝底，一屏最多 1–2 个强调块。
- `.data-row`：标签与值左右对齐，数字使用 tabular nums；不依赖颜色传达唯一含义。
- `.code`：等宽字体、浅灰底、允许横向滚动但不撑破页面。
- 链接与按钮保持实心黑或描边黑，hover 只改变底色/下划线。

## Mobile Rules

- 断点建议 760px：hero、功能卡和步骤区改为单列，功能卡顺序保持 1 → 5。
- 断点建议 420px：页面边距 14–16px，标题控制在 2–4 行；长文案使用 `overflow-wrap:anywhere`。
- 表格、代码和长 URL 使用 `overflow-wrap:anywhere` 或局部滚动容器，禁止 `body` 横向溢出。
- 不使用 hover 才可见的信息；signal bar、编号和深色结论区在窄屏仍必须保留。
- 固定底部控件若存在，正文底部增加等高 padding，避免遮挡 closing。

## Anti-patterns

- 不混用荧光绿、紫色渐变、玻璃拟态或厚重 3D 阴影；浅绿/浅蓝必须低饱和、成组使用。
- 不把每段正文都包成独立圆角卡片；编辑系统依赖栏目和线条形成节奏。
- 不用大面积背景图片、复杂纹理或 emoji 作为主视觉锚点。
- 不通过负 margin、绝对定位覆盖分隔线；接缝应由单一父级边框负责。

## Acceptance Checklist

- [ ] skill 与 `theme/editorial-system.html` 名称、slug 一致。
- [ ] 页面包含全部核心 token，并在组件中实际使用。
- [ ] 桌面有明确 masthead / feature-intro + feature-grid / signal / steps / dark-closing 层级。
- [ ] 功能卡为 1–5，桌面 2×2 + 第 5 张横跨，且含中英文标题、短说明、低存在感图标。
- [ ] 底部 dark-closing 使用深海军蓝、白色标题、绿色英文副标题及 4 条要点。
- [ ] 760px 与 420px 下无横向溢出、无重叠、编号仍可读。
- [ ] 海军蓝强调面积受控，浅绿/浅蓝模块对比度足够。
- [ ] 预览页发送 `{type:'theme-height', slug:'editorial-system', height}`。
- [ ] 文案为通用占位内容，不复制任何单一参考图。

## Naming / Aliases

- Skill：`infocard-editorial-system-style`
- Theme：`theme/editorial-system.html`
- CSS class：`editorial-system`
- Aliases：`editorial`、`magazine-system`、`research-editorial`
