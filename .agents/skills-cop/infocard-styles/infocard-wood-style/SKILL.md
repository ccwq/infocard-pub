---
name: infocard-wood-style
description: 木感编辑风的信息卡主题。用于把 Simon Willison 式 agentic engineering、技术手册、方法论拆解与高密度指南切换为暖米纸底、深黑标题、蓝色链接、棕色金句块、黑色流程条与三栏结构的编辑型卡片。
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, style, wood, editorial, warm-paper, serif, agentic-engineering, manual]
    related_skills: [any2card, infocard-style-man-skill, infocard-pub-publisher]
---

# infocard-wood-style

> Runtime boundary：本 Skill 仅提供视觉差异；通用来源、创作、浏览器验收、构建与发布文字均视为 legacy archive，由核心阶段接管。

## Overview

`infocard-wood-style` 是一套偏“暖木质感 / 编辑页 / 说明书海报”的信息卡主题，灵感来自 Simon Willison 的 *Agentic Engineering Patterns* 视觉语言：

- 不是花哨海报，而是**高密度编辑型知识卡**
- 不是纯黑红攻击性风格，而是**暖米纸底 + 黑色骨架 + 蓝色链接 + 棕色重点块**
- 不是单一长文排版，而是**标题 / 金句 / 流程 / 三栏模块**的清晰分层
- 主视觉气质是：**克制、专业、带一点纸张与木质温度**

> 会话级视觉校准与发布备注见 `references/wood-style-session-note.md`。
> 本次补充的重写保真规则见 `references/wood-style-preserve-rewrite.md`。

## When to Use

适合：

- agentic engineering / coding agent 方法论
- 技术指南、工作流说明、工程实践总结
- 需要“结论先行 + 结构拆解 + 可复用流程”的卡片
- 想要比纯红黑瑞士风更温和、比 Q 风更成熟的编辑风页面

不适合：

- 严肃调查事件的压迫感结论页
- 贴纸感、手作感、emoji 感很强的轻内容
- 需要强烈高饱和品牌色冲击的海报风

## Rewrite / Regeneration Rule

当用户说“重写 / 重新生成 / 改成 wood 风格 / 重新排版”时：

- 优先把它理解为**保留原内容与功能的重风格化**，不是推倒重做。
- 保留原有交互：复制按钮、保存按钮、JS 事件、锚点结构、可复制文案。
- 只在用户明确要求时改标题、改主题范围或删减模块。
- 如果任务是“把某张现有卡改成 wood-style”，先检查现有 HTML 的结构，再做 token / typography / component 层的替换。

## Design DNA

### 视觉关键词

- 暖米纸背景
- 深黑正文与边框
- 经典衬线标题 + 现代无衬线正文
- 蓝色用于链接、路径、轻强调
- 棕色用于核心金句 / 认知锚点
- 黑色用于流程条、对比框、章节标题
- 三栏网格，信息密度高但不压迫

### 版式气质

- 首页式标题区：左侧作者/日期，右侧 URL
- 顶部对比框：用黑底白字放置 A vs B 判断
- 中部金句条：用暖棕/木色块承载“核心洞察”
- 流程条：4 步黑底流程，作为阅读导轨
- 正文：三栏模块并置，强调方法、机制、测试与认知债
- 底部：轻量署名、品牌感、链接收束

## Color Tokens

建议 token 如下：

```css
:root {
  --bg: #f3eee7;
  --paper: #fffdf8;
  --ink: #101010;
  --muted: #5f584f;
  --line: #1b1713;
  --blue: #2f5fb8;
  --blue-soft: #eaf1ff;
  --wood: #8a5a3c;
  --wood-soft: #f1e3d3;
  --wood-dark: #5a381f;
  --shadow: 6px 6px 0 rgba(16,16,16,.12);
}
```

### 用途约定

- `--bg`：页面底色，必须是偏暖的浅色
- `--paper`：正文卡片底
- `--ink`：正文、标题、边框主色
- `--muted`：说明、注释、二级信息
- `--blue` / `--blue-soft`：链接、路径、轻强调
- `--wood` / `--wood-soft`：金句 banner、暖色提示、核心观点
- `--wood-dark`：深色强调、对比块中的辅助标题

### 禁止

- 不要引入高饱和橙 / 紫 / 青绿作为常规主题色
- 不要把它做成“真的木纹背景图”
- 不要用花哨渐变去替代纸感与编辑感

## Typography

### 字体建议

- Hero title：衬线字体优先（Georgia / Times / Songti 系）
- 说明与正文：无衬线字体（Inter / system-ui / PingFang SC）
- 数字与 URL：可使用等宽字体增强编辑感

### 字号层级

- Hero title：`clamp(28px, 5vw, 58px)`
- Subtitle / lead：`14px–16px`
- Section title：`18px–22px`
- Body：`12.5px–14px`
- Caption / meta / pill：`10.5px–12px`
- 最小可读字号底线：`11.2px`

## Layout Skeleton

推荐骨架：

1. Top meta row
   - 作者 / 日期 / URL
   - 右侧 A vs B 对比框
2. Hero banner
   - 主标题
   - 一句方法论总判断
3. Quote / insight banner
   - 1 条最重要的核心句
4. Process bar
   - 4 个步骤 / 4 个动作
5. Main content grid
   - 左：原则 / 框架
   - 中：机制 / 工具 / Git / subagent
   - 右：测试 / 代码理解 / 规范
6. Footer
   - 署名 / 来源 / 轻量链接

## Component Rules

### 1) 对比框

用途：快速建立认知差异。

特征：
- 黑底白字
- 标题必须很短
- 用于 `A ≠ B` 或 `X vs Y`

禁忌：
- 不要放太长正文
- 不要做成普通卡片

### 2) 金句 banner

用途：承接整张图的核心洞察。

特征：
- 木色 / 棕色块
- 低装饰、高压缩
- 字号大于正文但不喧宾夺主

禁忌：
- 不要同时叠很多色
- 不要放多句解释

### 3) 流程条

用途：把抽象方法变成可执行步骤。

特征：
- 黑底白字
- 4 步最合适
- 每步短语化，像标题而不是段落

### 4) 三栏模块

用途：承载高密度信息分组。

特征：
- 适合原则 / 机制 / 实践并列
- 使用清晰标题和序号
- 每栏内再分短段或小卡片

### 5) Footer

用途：收束来源与品牌。

特征：
- 小字号
- 轻装饰
- 不抢主体内容

## Mobile Rules

- 720px 以下三栏退为单列
- 对比框、流程条、正文卡块都必须保留可读性
- 390px 下不允许横向溢出
- 最小字号不低于 `11.2px`
- 金句 banner、流程条、footer 不得因压缩而断裂
- 如果是真实发布页，底部留白必须足够，避免固定按钮遮挡内容

## Anti-patterns

- 不要把它做成重木纹、复古咖啡馆风
- 不要把衬线标题和正文全都换成衬线，容易失去工程文档感
- 不要把蓝色做成主色海量铺满
- 不要把棕色做成大面积暗橙，主题会失真
- 不要用过多阴影、圆角、贴纸化装饰
- 不要把三栏模块压成两栏大卡，信息密度会掉

## Acceptance Checklist

- [ ] 视觉关键词明确：暖米纸、深黑、蓝链接、棕色金句、黑色流程条
- [ ] 章节结构完整：对比框 / 金句 / 流程 / 三栏 / footer
- [ ] 字体层级清楚，标题有衬线气质
- [ ] 移动端可读，720px 以下自动退化
- [ ] 没有木纹贴图和花哨渐变
- [ ] 与 q-style / main-style / redswiss 不混淆
- [ ] 若有 theme 预览页，命名与 token 一致

## Naming / Aliases

- 英文名：`infocard-wood-style`
- 中文名：木感编辑风
- 常用别名：木感风、暖纸风、编辑风、Agentic Engineering 风
- 触发词：Simon Willison、Agentic Engineering、木感、暖纸、编辑型知识卡
- 主题 slug：`wood`
- 预览页：`theme/wood.html`

## Active theme adapter contract

Implements `infocard-theme-contract@1` as a visual-only adapter. Generic authoring, verification and publishing guidance is deprecated compatibility text.
