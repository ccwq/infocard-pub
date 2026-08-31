---
name: infocard-scrapbook-style
description: |
  手账拼贴风信息卡主题。用于把资料封面、教程手册、课程介绍、工具指南做成 scrapbook / bullet journal 风格：暖米白纸感背景、横线或网格纹理、左侧便签式卖点、右侧资料预览、手绘箭头与贴纸装饰、黑色刷笔标题和红绿黄高亮。

  触发条件：用户提到手账拼贴、bullet journal、scrapbook、sticky note、washi tape、spiral notebook、贴纸海报、资料封面、手册、教程、指南。
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, style, scrapbook, bullet-journal, notebook, sticky-note, editorial, hand-drawn, promo]
    related_skills: [any2card, infocard-style-man-skill, infocard-pub-publisher]
---

# infocard-scrapbook-style

> Runtime boundary：本 Skill 仅提供视觉差异；通用来源、创作、浏览器验收、构建与发布文字均视为 legacy archive，由核心阶段接管。

## Overview

`infocard-scrapbook-style` 是一套面向资料封面、教程手册和课程介绍的“手账拼贴风 / 数字笔记本风”信息卡主题。

它的核心不是极简、不是冷静手册页，而是把内容做成一张**像实体笔记本里剪贴出来的资料封面**：

- 暖米白纸感底色
- 左侧或边缘的活页 / 螺旋装订视觉
- 彩色 sticky notes
- 手绘箭头、星星、爱心、纸夹、图钉、胶带
- 黑色手写 / 刷笔主标题
- 红、黄、绿、蓝、粉的清晰分区
- “先看什么、能学到什么、怎么上手”三段式信息组织

这套主题适合把“复杂但实用”的内容包装成容易收藏、容易分享、容易继续读的资料页。

## Use Cases

### 适合
- 资料封面
- 教程手册 / 课程封面
- AI 工具资料包
- 快速上手清单
- 工具使用路线图
- 章节目录预览
- 资料价值说明页
- “不只是入门，进阶也实用”类宣传图

### 不适合
- 法务 / 财务 / 合规类正式报告
- 冷感企业 dashboard
- 纯数据密集表格
- 严肃学术论文摘要页
- 强品牌官网首页

### 典型触发词
- 手账
- 拼贴
- 便签
- 贴纸
- 课程封面
- 资料包
- 实用手册
- bullet journal
- scrapbook
- notebook paper
- sticky note
- washi tape

## Design DNA

### 核心气质
- 资料感强，但不冷
- 像“可以直接收藏”的学习卡，而不是“只能看完就算”的宣传图
- 画面里应该同时看到：标题钩子、卖点、目录预览、实操预览、结尾 CTA
- 视觉语言像手账：允许轻微错位、轻微倾斜、贴纸感、纸张重叠感
- 所有装饰都为“可读性”和“收藏欲”服务，不做纯装饰噪音

### 视觉原则
1. **先像资料封面，再像内容页**：首屏必须先抓住人，再展开信息。
2. **标题要强**：手写 / 刷笔大标题必须有明显视觉重量。
3. **卖点要分块**：每个 sticky note 只承载一个明确观点。
4. **预览要真实**：右侧预览块要像真的内容预览，而不是空装饰。
5. **底部要有 CTA**：底部横幅负责收束价值主张。
6. **装饰要克制**：星星、箭头、纸夹、回形针、云朵可以多，但不能抢正文。
7. **手作感优先于几何完美**：边缘、便签、贴纸可以不完全对齐，但阅读顺序必须稳定。
8. **亮色只做重点**：红色抓注意力，绿色做路径/结构，黄色做提示/收藏感。

## Color Tokens

```css
:root {
  --bg: #f5f1e8;
  --paper: #fffaf0;
  --ink: #1f1a16;
  --muted: #6d645a;
  --line: #2a241f;
  --accent-red: #e24b3b;
  --accent-green: #77bf52;
  --accent-yellow: #f4d35e;
  --accent-blue: #9fc7ef;
  --accent-pink: #f5b7cd;
  --note: #fff1c9;
}
```

### 使用规则
- `--bg`：纸张底色，必须暖，不许纯白
- `--paper`：主要卡片底
- `--ink`：正文与标题主色
- `--muted`：说明文字
- `--line`：边框、装订线、图钉轮廓
- `--accent-red`：主标题强调、CTA、爆点标签
- `--accent-green`：目录、路径、完成感
- `--accent-yellow`：收藏提示、核心观点、贴纸高亮
- `--accent-blue`：预览、说明、结构标签
- `--accent-pink`：补充信息、轻松感标签
- `--note`：便签底

### 色彩约束
- 整体色彩应明亮但不荧光
- 不能把颜色做成霓虹海报
- 红色只负责“抓人”，不能铺满全页
- 绿色只负责“路径 / 目录 / 完成”，不能替代正文
- 文字必须始终清晰，不能因为纸感而变浅到难读

## Typography

### 字体策略
- 主标题：手写感 / 刷笔感 / 粗重标题字
- 副标题：可读性强的清晰无衬线或圆润黑体
- 正文：清楚、稳、密度适中
- 标签 / 便签：更像贴纸上的短句

### 层级建议
- Hero title: 30–58px
- Subtitle: 13–16px
- Section title: 18–24px
- Body: 12.8–14.8px
- Tag / label / note: 10.8–12.5px
- 最小字号底线：11.2px

### 字体表现
- 黑色刷笔标题可略带毛边感，但不能影响识别
- 便签文字允许更轻松，但不能太小
- 右侧预览中的代码片段应使用等宽字体，强调“真实资料预览”感

## Layout Skeleton

推荐的默认骨架：

```text
page / paper background
header hook
  - main title
  - subtitle banner
  - small sticker / badge
main grid
  - left sticky-note feature stack
  - right preview / sample snippets
supporting row
  - what you'll learn / benefits / chapters preview
footer CTA
  - strong summary banner
  - small doodle / icon / callout
```

### 版式偏好
- **竖版海报优先**：适合 3:4、4:5、手机长图
- **双栏拼贴**：左边卖点，右边内容预览，是核心结构
- **手账感边缘**：允许螺旋装订、回形针、纸条重叠
- **底部横幅**：用来收束“直接拿来用”“先搞懂入口，再开始实战”这种总结句
- **内容组织顺序**：先入口，再价值，再目录，再实战，不要上来就堆正文

## Component Rules

### 1. Sticky note
- 必备组件
- 每个便签只讲一个观点
- 颜色可区分层级或主题
- 便签边缘可略有撕纸 / 圆角 / 贴纸感

### 2. Brush banner
- 用于主标题下的核心补充句
- 黑底白字、绿底白字、红底白字都可
- 形状应像刷笔划过，不要像规整矩形条

### 3. Doodle icon
- 灯泡、机器人、云朵、书本、地图、放大镜、火箭、拼图、对话气泡都很适合
- 图标必须像“手绘资料页上的小插图”，而不是工业化图标库

### 4. Preview box
- 右侧内容预览必须像真实章节摘录
- 可包含目录、代码片段、步骤列表、问答片段
- 预览框背景建议偏白或浅米白，增强“纸上贴纸”感

### 5. Checklist
- 绿色 check mark 很重要
- 适合“你会看到什么”“你能收获什么”“适合谁”这类块
- 列表要短、清晰、强承诺

### 6. Footer CTA
- 底部必须有一句收束全卡的价值主张
- 语气可轻松，但要有“拿去就能用”的确定性
- 建议使用高对比色横幅

## Mobile Rules

### 720px 以下
- 双栏必须退化为单栏堆叠
- sticky notes 改为上下排列
- 预览框字号要抬高，避免变成缩小截图
- 装饰元素减少，但保留核心贴纸感
- 底部 CTA 仍要明显，不可被压缩成普通脚注

### 390px 验收重点
- 标题不能断裂成难读碎片
- 便签文字必须完整可读
- 预览中的代码片段不能太小
- 不允许横向溢出
- 纸夹、回形针、图钉等装饰不能压正文
- 页面不能像桌面稿缩小后直接塞进手机

### 移动端退化原则
1. 先减装饰，再减结构
2. 先保留标题和卖点，再压缩预览
3. 便签可变单列，但不能变成纯列表
4. 预览可以折叠，但不能消失
5. 右侧内容在移动端应变成第二段阅读内容，而不是附录

## Anti-patterns

- 不要做成极简黑白手册
- 不要把所有元素都做成规整方块
- 不要把颜色做成霓虹海报
- 不要让贴纸和星星过量，喧宾夺主
- 不要让预览内容变成装饰假文本
- 不要把正文做得太细太浅，失去收藏页的可读性
- 不要把图标统一成冷感线性系统图标，必须有手作感
- 不要让页面像企业培训幻灯片

## Acceptance Checklist

- [ ] 主题定位清晰：手账拼贴 / 资料封面 / 手册海报
- [ ] 色彩 token 明确且统一
- [ ] 标题、便签、预览、CTA 四段结构清楚
- [ ] 手写感与可读性平衡良好
- [ ] 720px / 390px 移动端规则明确
- [ ] 贴纸、纸夹、箭头等装饰有控制
- [ ] 右侧预览是真实内容感，不是纯装饰
- [ ] 没有与严肃技术手册风、极简风混淆
- [ ] 文字最小字号不低于 11.2px
- [ ] 双栏在移动端能合理退化为单栏
- [ ] 主题命名与触发词一致

## Naming / Aliases

- 英文名：`infocard-scrapbook-style`
- 中文名：手账拼贴风 / 数字笔记本风
- 常用别名：scrapbook-style、notebook-style、bullet-journal style
- 触发词：手账、拼贴、便签、课程封面、资料包、实用手册
- 对应主题 slug：`scrapbook`

## Implementation Notes

- 这套主题的关键不是“装饰多”，而是“像真的资料封面”
- 目录 / 预览 / 收获 / 适合谁 / CTA 五类信息最好都能在首屏附近找到
- 标题建议采用黑刷笔 + 红强调字的组合，形成强入口
- 图标尽量用“可爱但不幼稚”的手绘感插图
- 内容组织优先顺序：入口钩子 → 你会获得什么 → 目录预览 → 实战预览 → 底部总结
- 若后续要落成 live theme，应同步 `_themes.yaml` 与 `themes.html`

## References

- `references/scrapbook-visual-language-note.md`：当前主题的视觉拆解笔记，记录 scrapbook / bullet journal / sticky-note 语言。
- `references/scrapbook-mobile-rules.md`：移动端单栏退化和 390px 可读性检查要点。

## Acceptance Summary

- [x] 主题适合资料封面、教程手册、课程封面、指南页
- [x] 视觉语言清晰：纸感、便签、胶带、手绘标注
- [x] 有统一色板和字号底线
- [x] 有明确 layout skeleton
- [x] 有 component rules
- [x] 有 mobile rules
- [x] 有 anti-patterns
- [x] 有命名和触发词

## Active theme adapter contract

Implements `infocard-theme-contract@1` as a visual-only adapter. Generic authoring, verification and publishing guidance is deprecated compatibility text.
