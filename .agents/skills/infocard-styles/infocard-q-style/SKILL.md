---
name: infocard-q-style
description: |
  Q 版主题的信息卡技能。用于把 infocard 切换为纸感、手作感、彩色卡片对比风格：暖米纸背景、厚黑边框、圆角卡片、彩色 accent、emoji/pill 标签、高密度网格，适合框架对比、方法论总览、"25+种"型知识卡与轻编辑风。

  触发条件：用户提到"Q风"、"手作"、"贴纸"、"框架对比"、"方法论总览"、"25+种"、"方法全景图"。
  重要教训（2026-06-05）：生成时必须先读 `any2card/references/q-style-html-generation-guide.md`，不要假设本技能目录里自带同名副本；不得使用简化卡片结构。每个方法卡必须有"理论介绍"+"常见用途"两层，不能只有标题。GitHub 仓库主页型 Q-style 卡的会话笔记见 `references/github-repo-q-style-card-note.md`。

version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, style, q, paper, scrapbook, editorial, hand-drawn, comparison, ui, theming]
    related_skills: [any2card, infocard-green-style, infocard-main-style, infocard-pub-publisher, infocard-wood-style]
---

# infocard-q-style

> Runtime boundary：本 Skill 仅提供视觉差异；通用来源、创作、浏览器验收、构建与发布文字均视为 legacy archive，由核心阶段接管。

## Overview

Q 版主题是 infocard 体系中的纸感 / 手作感 / 彩色卡片风主题。

**布局优先级：先卡片化，再填内容。** 如果用户要的是“信息卡”，不要先铺长文档结构；先做主卡摘要、少量子卡和关键证据，再决定是否展开细节。代码块和表格只保留最少必要量。

它适合：
- 框架对比
- 方法论总览
- 多选项并列
- 教程型知识卡
- 轻编辑、看板式、贴纸式信息组织
- 提示词卡 / 代码模板卡 / 命令模板卡（这类卡应默认使用 `.prompt-card` + 复制按钮）

它不是瑞士黑头调查风，也不是默认主手册风。

## When to Use
- 用户说“Q 版主题”
- 用户说“纸感 / 手作感 / 彩色卡片风”
- 用户要“更像看板 / 拼贴 / 贴纸卡”
- 用户要“框架对比图、方法论总览卡”
- 用户要把 *GitHub 仓库主页 / README* 做成 Q-style 信息卡时
- 用户要把 **百科条目 / 科普条目 / 维基页面** 做成知识分享型信息卡时：优先走“概念 → 关键数据 → 学习应用 → 误区 → 适用边界 → 来源”六段式，而不是把条目压成一页摘要。

### 百科 / 科普条目型 Q-style 卡
- **首屏结论先行**：标题写成“这个概念到底说明什么”，不要只复读词条名。
- **数据点单独成块**：把条目中的时间点、比例、公式、实验结果拆成独立视觉单元（如 interval-grid / formula box），让读者一眼看到规律。
- **图像优先用条目自带图**：词条若有 Wikimedia / 维基自带示意图，优先本地化后作为 hero 视觉锚点；SVG 可直接保留为原始向量。
- **误区必须独立成章**：科普卡最容易只剩“定义”，但真正有价值的是“它不是什麼 / 不能怎么用 / 边界在哪里”。
- **应用落到学习行动**：对于学习科学、心理学、方法论类条目，必须补“怎么用在复习 / 训练 / 设计排程里”。
- **来源区分原文与再加工**：正文可做提炼，但 source note 要明确来自百科条目，避免把解释写成原文事实。
- 这类卡片的会话笔记见 `references/wiki-knowledge-sharing-card-note.md`。

## 插件 / 工具合集卡模式（2026-07-24 新增）

当内容是**多工具横向合集**（每个工具有独立安装命令，需批量展示并支持一键复制），使用 `references/plugin-collection-card-pattern.md` 中的标准骨架。与 GitHub 仓库主页型（单仓深度分析）完全不同。

**结构**：
- `.plugin-card`：顶部 7px 彩色 accent 条（`::before`）+ 插件名 + 版本 badge + 描述 + 标签 + 深色终端风格 `.install-block`（背景 `#1d1b16`，文字 `#a8e6a3`）+ 复制按钮
- `.copy-btn`：点击后 `navigator.clipboard.writeText(btn.dataset.cmd)`，显示"已复制"1.8s 后回滚
- 移动端：body `max-width: 420px`，hero-stats 在 400px 退化为 2 列，`.install-cmd` 用 `text-overflow: ellipsis` 截断长命令

## GitHub 仓库主页型 Q-style 卡
- **README 是主事实源**：先读仓库 README / README assets，再下结论；不要只看仓库名、star 数或简介标签。
- **hero 图优先取仓库自己的 banner / logo / intro 图**：如果仓库已经提供官方横幅或介绍图，优先本地化后嵌入，避免外链失效。
- **标题写“结论”不是“对象名”**：Q-style 的标题应抽成一句判断（它解决什么、核心机制是什么、价值在哪里），不要把仓库名原样塞进标题。
- **章节结构按“核心结构 → 安装/入口 → 能力栈 → 证据与判断 → 风险边界”组织**，比纯 README 镜像更适合网页阅读。
- **移动端验收要做 390px / 窄屏检查**：重点看横向溢出、表格/卡片是否可读、右下角保存按钮是否压正文。若用户反馈“像桌面缩小”，不要只看页面内容有没有断行，必须比较 `.page` 的 computed width、`scrollWidth/clientWidth`，并在公开 Pages URL 上复核。
- **Q-style 评审流程**：当用户要求“重新走一遍评审流程”时，按 `公开详情页 → 390px 视口 → browser_console 度量宽度 → browser_vision 判断桌面缩小感 → 再修 CSS` 的顺序走，不要先在本地自我判断。fixed 保存按钮优先保留，防遮挡靠正文底部 safe-area padding 解决，不要轻易把按钮改成 static。
- 详情和会话笔记见 `references/github-repo-q-style-card-note.md`。
- 本次技术分析卡的 Q-style 评审坑点见 `references/tech-analysis-q-style-pitfall.md`。
- 风格优先级必须服从用户明确指令：如果用户点名 `infocard-q-style`，不要因为内容偏技术就临时切到 `infocard-blue-technical-manual-style` 或 `infocard-main-style`；技术分析类内容也可以用 Q-style 承载，但不能替换主题。
- 本次纠偏笔记见 `references/tech-analysis-q-style-pitfall.md`。

## Core Design DNA
- 暖米纸背景
- 黑色厚边框
- 圆角卡片
- 彩色 accent
- pill / chip / emoji 引导
- 看板感、贴纸感、轻编辑感

## Color Tokens
- `paper`: `#f8efd9`
- `paper-2`: `#fffaf0`
- `ink`: `#1d1b16`
- `muted`: `#6b6254`
- `line`: `#28231d`
- `green`: `#9bdc77`
- `blue`: `#7cc8ff`
- `purple`: `#c7a2ff`
- `orange`: `#ffc45c`
- `yellow`: `#ffe36e`
- `red`: `#ff9a89`
- `teal`: `#7de3d6`

## Layout Skeleton

**Q-style 有两种复杂度，必须按内容深度选对：**

### ① 简化版（轻量知识卡）
适用：单主题、快速科普、< 5 个方法点。
```
hero（kicker + title + subtitle + pills + stats）
intro-grid（2×2 或 4 列，每格一句话）
footer-block 或 callout
```

### ② 完整版（rich knowledge card，必须参考 harness-q-style 模板）
适用：多方法体系（10+ 方法）、需要逐条展开理论/用途、四大维度分类。
**本 session 翻车教训：简化版做 rich 内容 = "内容太空洞"投诉。**

完整结构（直接复制 harness-q-style 的 HTML 结构）:
```
hero（kicker + title + subtitle + pills + hero-stats 4格 + hero-visual）
section × N（每个维度一章）:
  section-head（section-no 编号 + section-title）
  method-grid（3列 method-card，每卡含 theory + use 双区块）
section（五类露馅规律）:
  case-grid（2列 case-card）
section（经典案例）:
  case-grid（2×2）
section（应用场景）:
  scene-grid（4列 scene-card）
footer-block + callout + source-note
save-btn（右下角固定）
```

**关键教训（2026-06-05）：**
- 用户说"内容太空洞"、"风格不对" → 用了简化版做 rich 内容
- 方法数 > 10 个时必须用完整版，每种方法独立 card，含 theory/用途 双区块
- 完整版参考：`docs/20260604-revfactory-harness-q-style.html`（相对于当前 active repository root）
  （直接读取该文件获取精确的 class/结构，不要自己凭感觉写）
- 触发词："harness那个风格"、"框架对比"、"方法论总览" → 走完整版

## Typography
- Hero：`32–72px`
- Section：`22–38px`
- Card title：`20–30px`
- 正文：`13–16px`（高密度知识卡建议 ≥13px；视觉分析反馈正文 11px 会导致移动端阅读压力）
- 标签：`11.5–12.5px`（移动端底线 ≥11.2px）

**高密度知识卡字号优先级：**
1. 若内容密度高（25+ 方法、五栏对比等），优先改 `portrait` 比例 + 适当放大正文字号
2. 不要用更小的字硬塞内容——宁可增加滚动屏数
3. 移动端验收时用 vision 检查最小字号层级是否 ≥11.2px

## Mobile Rules
- 720px 以下统一单列
- chips / pills 必须换行
- 场景矩阵必须改单列
- 保留卡片实体感，但不要压缩到难读

## Anti-Patterns
- 不要做成企业表格
- 不要做成纯瑞士冷静风
- 不要做成赛博黑红档案风
- 不要用极小字硬塞内容

## Image Sourcing Protocol (Wikimedia)

**图片优先原则：** 信息卡（尤其是数学 / 科学 / 技术类）必须使用从 Wikipedia / Wikimedia Commons 抓取的真实图片。自绘 SVG 不可替代真实照片作为「严谨科普」的信号。

**标准流程（已知 File:xxx 时，跳过浏览器）：**
1. 用 Wikimedia API 直接查 URL：
   ```python
   import urllib.request, urllib.parse, json
   title = 'File:ForgettingCurve.svg'
   url = (f'https://commons.wikimedia.org/w/api.php?action=query'
          f'&titles={urllib.parse.quote(title)}'
          f'&prop=imageinfo&iiprop=url|size|mime&format=json')
   req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
   d = json.loads(urllib.request.urlopen(req, timeout=20).read())
   print(next(iter(d['query']['pages'].values()))['imageinfo'][0]['url'])
   ```
   → 直接拿到 `https://upload.wikimedia.org/wikipedia/commons/.../xxx.svg` 直链，**无需 Referer**。
2. curl -L 直链下载：
   ```bash
   curl -L --fail --silent --show-error '直链URL' -o "$DEST/xxx.svg"
   ```
   SVG 文件通常 < 50KB，`file` 命令验证 MIME type 确认成功。
3. **只有当 API 查不到 File:xxx 时**，才走浏览器路径：CDP 导航到词条 → `Runtime.evaluate` 提取 `upload.wikimedia.org` 图片 URL → curl 下载（此时 Referer 头才真正必要）。
4. Wikimedia 确实没有对应图片时，才用手绘 SVG 兜底。

**常见 Wikimedia 缩略图规格：** `500px-xxx.png`（推荐，~50–200 KB）、`960px-xxx.svg.png`（高分辨率 SVG 渲染）、`250px-xxx.png`（小图，无更大图时最后选用）

**Wikimedia API 反查（如已知 File:xxx 可直接拿 URL）：**
```bash
python3 -c "
import urllib.request, json, os
UA = 'Mozilla/5.0'
title = 'File:Mandelbrot_set.jpg'
url = f'https://commons.wikimedia.org/w/api.php?action=query&format=json&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url&iilimit=1'
req = urllib.request.Request(url, headers={'User-Agent': UA})
with urllib.request.urlopen(req, timeout=8) as r:
    d = json.loads(r.read())
print(list(d['query']['pages'].values())[0]['imageinfo'][0]['url'])
"
```

## 图片 caption 规范

每张信息卡图片的 `alt` 和 caption 应包含**英文名 + 中文名**对照：

```
▲ Dragon Curve / 龙曲线 12 阶迭代（Wikimedia Commons: Dragon_curve_iterations_(2).svg）
▲ Sierpiński Curve / 西尔平斯基曲线（Wikimedia Commons: Arrowhead_curve_1_through_6.png）
```

格式：`▲ 英文名 / 中文名 说明文字（来源: 文件名）`

## Active theme adapter contract

Implements `infocard-theme-contract@1` as a visual-only adapter. Generic authoring, browser verification and publishing guidance is deprecated compatibility text.
