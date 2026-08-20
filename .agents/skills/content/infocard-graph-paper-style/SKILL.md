---
name: infocard-graph-paper-style
description: 纸感图谱手册风信息卡技能。适合把代码图谱、知识网络、依赖关系和结构拆解做成米白底、黑灰细线、等宽字体与节点连线构成的研究手册风 infocard。
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, style, graph, paper, network, codegraph, manual]
---

# infocard-graph-paper-style

## Overview

`infocard-graph-paper-style` 是面向“代码图谱 / 知识网络 / 结构关系”的纸感研究手册风主题。

它的目标不是做海报，而是把复杂系统画成可读的图谱说明书：

- 米白 / 纸感背景
- 黑灰细线
- 等宽字体与技术标记
- 节点、连线、路径、索引、注释
- 少量冷色强调，用于结论、路径高亮或关键节点

第一眼应传达：**这是一个可阅读、可追踪、可解释的图谱系统**。

## Use Cases

### 适合

- 代码库结构图
- 知识图谱说明
- Agent / workflow / tool 关系图
- 依赖链、调用链、数据流、概念网络
- 技术系统拆解、架构总览、模块关系页

### 不适合

- 商务发布海报
- 强结论调查卡
- 深色监控台风
- 手绘便签风
- 高饱和科技炫技页

### 触发词 / 线索

- graph / codegraph / knowledge graph
- 节点 / 连线 / 网络 / 图谱 / 依赖关系
- 代码结构 / 系统关系 / 模块映射
- 说明书感 / 研究手册感 / 本地工具感
- **多图合一 / 多榜合一 / 同一来源多张图 → 一张卡**（四面板/多栏目结构是 graph-paper 的天然载体，2026-06-26 验证）

### ⚠️ 发布行为确认（必读）

当用户提供多张图片且说"创建1个信息卡"时：
- **默认行为是合并**，不要按多图自动拆成多张卡
- 合并后必须保留所有条目的描述文字（名称 + 描述 + 分类 + 维度）
- 合并前先确认用户意图："是做一张汇总卡还是多张独立卡？"
- 用户说"直接发货"时，仍然需要先判断是合卡还是分卡；**判断错了比发货慢更严重**（2026-06-26 实录：用户发了4张图，我拆成4张卡后被要求返工）

### 与相近主题区分

- **不是** bigwhite：bigwhite 是纯白商务报告页，graph-paper 更强调“图谱关系 + 等宽标记”。
- **不是** darkblue：darkblue 偏工作台与界面层级，graph-paper 更像研究手册。
- **不是** handline：handline 偏手绘白板，graph-paper 要保持结构化与克制。

## Design DNA

- **信息密度**：中高密度，但必须可扫读
- **情绪**：冷静、理性、解释性强
- **视觉锚点**：图谱节点和连线
- **阅读顺序**：先图后文，先结构后结论
- **质感**：纸面、图纸、注释、索引、标尺感
- **审美关键词**：研究手册、图纸、知识网络、本地-first 工具
- **纸感强化**：当主题是 codegraph / knowledge graph / relationship map 时，优先加极淡的方格纸或点阵纹理；纯色纸面容易退化成普通技术卡。
- **工程注释感**：图谱容器要带少量技术标注（比例、版本、刻度、坐标、注释编号），让它更像工程图/研究手册，而不是静态插图。
- **图谱分层**：首屏图谱和正文图谱必须承担不同角色；首屏偏全景索引，章节图偏查询路径/关系展开，避免同一张图在多个位置重复出现。

## Layout / Hierarchy Notes

- 图谱本身应成为页面的结构中枢，而不是角落插图。
- Hero 标题要像严肃报告标题，不要做成大横幅海报；先收标题体量，再考虑额外装饰。
- Utility 区（如下载按钮、说明条、标签条）应保持克制，不要抢过图谱和正文。
- 如果页面开始显得像发布页或宣传页时，优先削减视觉音量与色彩强度，而不是继续加装饰。
- 图谱主视觉不能和章节图重复；首屏要用更宏观的索引图，正文章节再用更具体的路径图/查询图。
- 如果页面里出现 benchmark、install、result 类内容，要让它们服务于图谱解释，不要抢走图谱的结构主权。

## Color Tokens

```css
:root {
  --bg: #f7f6f2;
  --paper: #fffdf8;
  --ink: #111111;
  --muted: #6c6a63;
  --line: #ded8cc;
  --accent: #3f6cff;
  --accent-soft: rgba(63,108,255,.10);
  --accent-2: #111111;
}
```

### Token 用途

- `--bg`：整体页面底色
- `--paper`：卡片 / 主内容底
- `--ink`：正文、标题、节点、主连线
- `--muted`：说明、注释、次级文字
- `--line`：分割线、网格、边框
- `--accent`：关键节点、路径高亮、行动按钮
- `--accent-soft`：淡强调面、hover、选中背景
- `--accent-2`：备用深色强调，少量使用

## Typography

### 字号层级

- Hero title：`clamp(40px, 6.5vw, 88px)`
- Subtitle / lead：`15px–18px`
- Section title：`22px–34px`
- Body：`13px–15px`
- Caption / meta / pill：`10px–12px`
- 最小字号底线：桌面不低于 `11px`，移动端不低于 `11.2px`

### 字体建议

- 正文：系统无衬线，保证可读性
- 节点标签 / 标记 / 代码片段：等宽字体
- 数字和路径：建议局部等宽或 tabular numbers

## Layout Skeleton

推荐结构：

1. **Topbar / wordmark**
2. **Graph-first hero**
   - 主题名可存在，但不能压过图谱
   - 一句话定位最好服务于图谱阅读
   - 右侧或下方以节点 / 连线 / 路径总览为主视觉
3. **Graph / network main visual**
   - 节点
   - 连线
   - 路径高亮
   - 节点索引 / 关系摘要
4. **Sections**
   - 关系解释
   - 模块拆解
   - 使用方式
   - 影响面 / 依赖链 / 路径列表
5. **Reference / notes**
   - 术语表
   - 来源
   - 注释
6. **Footer**
   - 版本、日期、引用

### 默认版式

- 默认是**长页说明书**，不是纯英雄海报
- 图谱节点是主视觉，但正文必须给出解释
- 允许图和文并置，但不能让图沦为角落装饰
- 如果页面带 benchmark / result / callout 模块，必须服务于图谱结构，而不是让它们抢走视觉主权

## Component Rules

### Node / graph components

- 节点必须清晰可辨，边界要稳
- 连线要细、克制、不过度装饰
- Hover / active 状态可以强调，但不能变成霓虹
- 图谱里的标签应尽量短、准、可索引

### Badge / pill / tag

- 用于状态、类别、层级、来源
- 形态建议：细边框、低饱和、等宽小字
- 禁忌：厚重胶囊、彩虹化、贴纸化过强

### Cards / panels

- 卡片应像“图纸模块”而不是商业海报模块
- 边框轻，阴影轻，避免玻璃感过重
- 允许局部浅底块来承载说明

### Code / label / note

- 代码、路径、版本、节点编号优先用等宽字体
- note 用于解释图谱含义，而不是堆砌长段落

### Table / list

- 优先紧凑表格、关系列表或路径列表
- 表格必须高可扫读，不做大色块化

## Mobile Rules

### 720px 以下

- hero 改单列
- 图谱区域优先保留在上半屏
- 三栏内容降为单列或双列堆叠
- 字号和行距适度放大，保证节点和注释可读

### 390px 检查重点

- 不允许横向溢出
- 不允许图谱标签被裁切
- 不允许节点图缩得只剩装饰
- 不允许文字密度高到无法扫读

### 交互规则

- 若有固定按钮，必须避让内容，不遮挡图谱与注释
- 图谱优先保证可见，不要为了装饰牺牲结构

## Anti-patterns

- 不要把页面做成深色终端风
- 不要把图谱节点做成霓虹赛博风
- 不要用大量渐变和发光
- 不要用超厚边框或重阴影
- 不要把图谱当纯背景纹理
- 不要让正文失去“研究手册”感
- 不要混入 handline 的手绘骨架
- 不要混入 bigwhite 的纯商务报告语法
- 不要让 hero、benchmark、result card、download bar 抢走图谱的结构主权
- 不要用过多蓝/绿/红/黄分类卡把页面推向产品报告风；graph-paper 只允许少量、功能化强调色
- 不要让 graph 只是插图；如果图不承担索引、路径、关系解释，它就还不够 graph-paper
- 如果源材料里有用户提供的图片/截图，把它作为**证据**嵌入正文流（`<img>` + caption），不要只当风格参考或背景装饰。
- 图谱外壳可以负责解释图片周围的关系，但不要把图像本身抹平为抽象装饰。

## Acceptance Checklist

- [ ] 米白纸感 + 黑灰细线已明确
- [ ] 节点 / 连线是主视觉，而非装饰
- [ ] 等宽字体和技术标记有使用场景
- [ ] 图谱与正文关系清晰
- [ ] 720px 以下有明确降级
- [ ] 390px 不横溢、不裁切、不缩成装饰
- [ ] 与 bigwhite / darkblue / handline 边界清楚
- [ ] 主题名、slug、theme 文件与 skill 语义一致

## Naming / Aliases

- 英文 skill name：`infocard-graph-paper-style`
- 中文名：图谱纸感研究手册风
- 常用别名：graph-paper、codegraph style、graph manual
- 触发词：图谱、节点、连线、知识网络、代码关系图
- 主题 slug：`graph-paper-style`
- 对应 theme 文件：`theme/graph-paper.html`

## Notes

- 这是一个“图谱解释型”主题，不是纯视觉展示主题。
- 若后续制作 theme 文件，应优先从结构图、节点图、路径图、索引面板开始，而不是先堆颜色和装饰。
- 会话复盘见 `references/codegraph-graph-paper-style-note.md`，记录了本次从“普通技术卡”向“图谱研究手册”收敛的具体修法。
- 重建对齐笔记：`references/graph-paper-rebuild-parity-note.md`，记录“rebuild = 结构重建 + 内容保留 + 与 theme/graph-paper.html 做结构语言对齐”的做法。
- `references/codebase-to-course-graph-paper-pattern.md`：记录“代码知识重表达 / 课程化 / 审计化”类仓库做成 graph-paper 卡时，如何把主叙事从 feature list 拉回 conversion pipeline（输入 → 中间翻译层 → 输出）的做法。
- 网站型 graph-paper 卡若没有公开 repo，不要强行按仓库结构写；优先把主视觉落在“可见导航 / 控件 / 路由树 / 状态机”上，把页面当作知识画布或交互运行时来解释。
- Session review note: `references/codegraph-graph-paper-style-note.md`
