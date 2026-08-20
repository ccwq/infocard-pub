---
name: infocard-black-head-style
description: 黑头主题的信息卡技能。用于把动态工作流、调查拆解、技术论证类 infocard 切换为黑色页眉、白纸正文、红色主强调、蓝绿辅强调的高密度编辑风，统一 hero、章节标题、步骤卡、引语块与移动端表现。
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, style, black-head, red, editorial, investigation, workflow, ui, theming]
    related_skills: [any2card, infocard-green-style, infocard-blue-technical-manual-style, infocard-pub-publisher]
---

# infocard-black-head-style

## Overview

这是从 `claude-dynamic-workflows` 与 `voxcpm-investigation` 抽象出的黑头主题。

核心特征：
- 黑色页眉 / 黑头
- 白纸正文
- 红色主强调
- 蓝绿辅强调
- 高密度拆解感
- 调查 / 论证 / workflow 说明优先

## When to Use
- 用户说“黑头主题”
- 用户说“黑色页眉的信息卡”
- 用户要调查拆解风 / 结论先行风
- 用户参考 dynamic workflows / voxcpm 风格
- 用户要做**授权安全工具 / 渗透测试 / 红队演练**类信息卡：优先用“授权边界 + 风险提醒 + 工作流链路 + 证据/报告”的结构，而不是攻击教程式写法。见 `references/security-workflow-boundary-card-pattern.md`。

## Core Design DNA
- 黑头是视觉锚点
- 红色负责判断与结论
- 蓝绿负责辅助分类
- 卡片要像拆解手册，不像海报

## Typography
- Hero：`42–48px`
- Section：`24–32px`
- Lead：`17–19px`
- 正文：`14.5–16px`
- Meta/Pill：`12–13px`

## Mobile Rules
- 720px 以下单列优先
- step / chips 必须能堆叠
- 不允许通过极小字号硬塞信息
- 390px 窄屏优先做“单屏单焦点”：一屏只保留一个主判断，其余信息降级为辅助说明
- 蓝绿仅作辅强调；若蓝绿开始抢戏，先降饱和度，再减少出现频次
- 红色用于主强调：章节编号、标题锚点、顶边条、结论标签；不要把每个边框都染红，否则会变成警示牌风
- 黑头页眉要足够强，但正文应像白纸手册；若黑底与白卡的切换太碎，优先通过统一卡片边框/留白来收束节奏

## Pitfalls（坑点记录）

### ⚠️ 黑头 ≠ 红渐变
黑头主题的 header 背景必须是**纯黑**（`#0a0a0a`），不是蓝技手册的红色渐变。
如果误用 `background: linear-gradient(180deg, var(--red), #a90f27)`，会变成"红头"而非"黑头"。

**正确写法：**
```css
.header { background: #0a0a0a; }
```

### ⚠️ 维基术语卡要先钉边界，再铺概念族
像“人格外化 / 外化”这类词，先确认维基是否存在明确条目，再判断它到底是**防御机制**、**叙事疗法技术**，还是更广义的**心理功能外化**。不要一上来写成单一病名，也不要把“外化”误写成“外向”。

**优先写法：**
1. 先给一句边界定义
2. 再拆出不同语境（精神分析 / 叙事疗法 / 文化心理学）
3. 最后列出易混词（投射、合理化、内化、外向）

### ⚠️ 章节编号：黑底 + 红字
蓝技手册的章节编号是"红底白字"，黑头主题的章节编号是"黑底红字"。

**正确写法：**
```css
.sec-no {
  background: var(--black);  /* 纯黑背景 */
  color: var(--red);         /* 红色文字 */
}
```

### ⚠️ grid2 被 stealth 扩展覆盖
与蓝技手册相同，`.grid2` 在 390px 移动端会被 stealth 扩展注入的 `grid` 简写覆盖。
修复：给 `.grid2` div 加内联 `!important` 样式，详见 `references/grid2-stealth-extension-fix.md`。

**正确写法：**
```html
<div class="grid2" style="display: grid !important; grid-template-columns: calc(50% - 4px) calc(50% - 4px) !important; gap: 8px !important;">
```

## Theme File
- **路径：`theme/black.html`**（注意：文件名是 `black.html`，skill 目录名是 `infocard-black-head-style`，不要混淆）

## References
- `references/black-head-session-notes.md`：这次黑头主题微调的残余问题、修正方向与 390px 验收要点
- `references/black-head-session-2026-06-19.md`：本次黑头信息卡交付的高密度 session notes（黑头页眉、红色引语、平台网格、移动端堆叠）
- `references/grid2-stealth-extension-fix.md`：grid2 被 stealth 扩展覆盖的根因分析与修复方案

## Naming
中文名：**黑头主题**
别名：黑头调查风、黑头拆解风
