---
name: infocard-bigwhite-style
description: 大白商务风信息卡主题。用于技术报告、产品发布、商业分析、数据简报、项目复盘等需要纯白背景、大留白、深蓝单强调、细灰线、英雄数字和商务报告感的信息卡。
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, style, bigwhite, business-report, data-brief, product-release]
    related_skills: [any2card, infocard-style-man-skill, infocard-pub-publisher, infocard-mobile-verifier]
---

# infocard-bigwhite-style · 大白商务风信息卡主题

> Runtime boundary：新流程只消费 `infocard-theme-contract/adapters/index.json` 中的本主题适配器与本文件的视觉令牌/组件说明。下方任何 authoring、浏览器验收、构建或发布步骤均为 legacy archive，不可从主题层执行。

## Overview

`infocard-bigwhite-style` 是一种通用大白商务风信息卡主题：纯白背景、大面积留白、深蓝单强调、黑色标题、细灰分割线、大数字英雄化，以及统一页脚元信息。它适合把技术报告、产品发布、数据简报、商业分析、项目复盘做成克制、干净、可信的报告型页面。

这个主题的核心不是“白底模板”，而是 **报告秩序**：靠留白、对齐、细线和数据层级建立专业感，不靠厚边框、复杂纹理、重阴影或高饱和装饰。

## Language Policy

- 面向中文读者时，默认用中文做主叙述、主标题、标签和面板说明。
- 英文只在以下情况保留：专名、仓库名、命令名、接口名、必须引用的原始术语，或为了 source fidelity 不可避免的对照。
- 在内容搜集与草稿阶段，也按中文优先处理：先把信息组织成中文，再决定哪些英文必须留下。
- 避免让 hero、stats、section label 这类首屏视觉元素被英文主导；英文只能作为点缀，不作为主表达。


## Use Cases

适合：

- AI / 技术产品发布页：模型 release、能力更新、benchmark 概览。
- 商业分析 / 投资简报：关键指标、趋势图、排名、对比结论。
- 项目复盘 / 工作汇报：目标、数据、行动入口、结论分区。
- 多面板报告：2×3、2×4 或长页模块矩阵。
- 需要“干净、专业、可信、可投屏”的白底信息卡。

不适合：

- 手绘草图、白板便签、rough 边框 → 用 `infocard-handline-style`。
- 深色工作台、Agent IDE、并行任务面板 → 用 `infocard-darkblue-style`。
- 终端状态、监控仪表盘、本地运行安全 → 用 `infocard-darkgreen-style`。
- 暖纸编辑、方法论长文、木感引用 → 用 `infocard-wood-style`。
- 高压调查、黑头结论、责任链拆解 → 用 `infocard-black-head-style` 或 `hardblue`。

触发词 / 用户说法：

- “大白风”
- “白底商务风”
- “像 GLM-5.2 那组白底报告图”
- “干净一点，像发布会 / 白皮书 / 商务报告”
- “大数字、蓝色强调、细灰线”
- “多面板数据简报”

## Design DNA

- **White-first**：页面第一眼必须是纯白和留白，不是彩色装饰。
- **One strong accent**：整页只允许一种强强调色，默认深蓝。
- **Data as hero**：关键数字可以成为最大视觉元素，占据卡片 1/4 甚至更多面积。
- **Report grid**：使用严格左对齐、细灰线和模块化网格组织信息。
- **Subtle grouping**：用极浅灰块承载次级内容，尽量不用粗边框。
- **Footer metadata**：每个面板或大段落可带 page/source/date/type 元信息，强化报告感。
- **No decoration first**：图标、线条、色块都服务信息，不做纯装饰。

读者第一眼应感受到：**干净、可信、数据明确、商务报告级别的秩序感**。

## Color Tokens

标准 token（已按 GLM-5.2 参考图校准，2026-06-17）：

```css
:root{
  --bg:#f7f8fa;          /* 页面外层浅冷灰（接近 #F7F8FA），衬托白色 sheet */
  --paper:#ffffff;        /* 主画布 / panel 纯白卡 */
  --ink:#0b0d12;          /* 主标题和核心文本 */
  --muted:#68717d;        /* 正文说明、次级标签 */
  --faint:#aeb6c2;        /* 页脚、页码、弱元信息 */
  --line:#e3e7ed;         /* 细灰分割线（panel 间无线条，靠灰底留白分隔） */
  --line-strong:#cdd5df;  /* 稍强边界，少量使用 */
  --blue:#001a72;         /* 唯一强强调色：深邃藏青，对应参考图 #001A72 */
  --gray:#f6f8fb;         /* 浅灰容器 / ghost card 底 */
  --gray-2:#f1f3f6;       /* 图表轨道 / 分区背景 */
  --black:#05070a;        /* 少量反差结论块 */
}
```

**与初版的偏差修正（2026-06-17）**：

| Token | 初版（错） | 校准后（对） | 原因 |
|---|---|---|---|
| `--bg` | `#f4f6f8` | `#f7f8fa` | 参考图背景偏白，不是深灰 |
| `--blue` | `#003399`（品蓝） | `#001a72`（深藏青） | 参考图是深邃藏青 `#001A72` |
| `--blue-2` | `#0b57d0` | **已删除** | 参考图只有一种蓝，多余 |
| `--blue-soft` | `#eef4ff` | **已删除** | 参考图不用浅蓝铺垫 |
| `--green` | `#0f8a5f` | **已删除** | 参考图无绿色 |
| `--orange` | `#e58a20` | **已删除** | 参考图无橙色 |

**Panel 骨架说明**：panel 卡为纯白 `background:#fff`，靠浅灰 `--bg` 背景的 gutter 留白自然分隔，panel 间**不使用 `border` 分隔**。`.sheet` 主画布也无 border。参考图的分隔语言是"纯留白"，不是"细灰线框"。

使用规则：

- 深蓝 `--blue` 是唯一强强调色。
- 黑色块允许，但必须少量，用于强结论、警示、CTA 或反差段落。
- 图表需要多序列时，优先用蓝色不同明度，不要直接引入橙 / 绿 / 紫破坏主题。
- 禁止渐变背景、厚重投影、高饱和多色点缀。

## Typography

建议层级：

- Hero title：`clamp(42px, 7.8vw, 92px)`，超紧凑字距，强标题感。
- Hero metric：`76px–150px`，数字可以压倒文字，作为视觉主锚。
- Section title：`21px–34px`，粗体，负字距。
- Body：`13.5px–16px`，行高 `1.62–1.72`。
- Caption / metadata：`10.5px–12px`，全大写英文或中英混合，浅灰但必须可读。
- 最小字号底线：移动端正文不低于 `12px`，元信息不低于 `10.5px`；正文主阅读区域优先 `13px+`。

字体：

```css
font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
```

## Layout Skeleton

标准结构：

```text
.page
  .sheet                     /* 白色主画布 */
    .topline                 /* brand / date / source */
    .hero                    /* 左标题 + 右 hero metric */
      .hero-copy
        .kicker
        h1
        .lead
        .hero-pills
      .blue-block            /* 大数字深蓝块 */
    .panel-grid              /* 2/3 列报告卡片 */
      .panel                 /* metric grid / rank / ghost cards */
    .panel-grid              /* upgrade / dark block / get started */
    .wide                    /* chart + rule / note */
    .footer                  /* source / style / timestamp */
```

多面板海报结构：

```text
.board
  .panel.cover
  .panel.metrics
  .panel.ranking
  .panel.architecture
  .panel.upgrade
  .panel.get-started
```

长信息卡结构：

```text
hero → metrics → ranking → architecture / method → chart → actions → source footer
```

## Component Rules

### Kicker / Label

- 用小号全大写英文 + 中文短语，例如 `DATA · 四个数字`。
- 默认深蓝，字距拉开。
- 放在面板顶部，不做大面积色底。

### Hero Metric / Big Number

- 数字必须足够大，作为视觉主锚。
- 可放在深蓝块、白底 metric card 或列表左侧。
- 数字旁只配一个简短 label，不要堆长解释。

### Step Grid

3 列步骤卡片，适合"三步上手 / 操作流程"类信息卡：

```html
<section class="step-grid">
  <div class="step-card">
    <div class="num">01</div>
    <h3>标题</h3>
    <p>说明文字。</p>
    <code>/command</code>
  </div>
  ...
</section>
```

```css
.step-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-bottom:14px}
.step-card{background:var(--paper);border:1px solid var(--line);padding:18px}
.step-card .num{font-size:48px;line-height:1;letter-spacing:-.06em;font-weight:900;color:var(--blue);margin-bottom:12px}
.step-card h3{font-size:18px;font-weight:850;margin:0 0 8px;letter-spacing:-.03em}
.step-card p{margin:0;color:var(--muted);font-size:13px;line-height:1.6}
.step-card code{display:inline-block;background:var(--soft);padding:2px 8px;border-radius:3px;font-size:12px;color:var(--blue);font-weight:700;margin-top:8px}
```

移动端 `@media(max-width:720px){.step-grid{grid-template-columns:1fr}}` 单列堆叠。

### Compare Table

三列对比表（模式 / 特点 / 问题），适合技术选型、工作流对比、方案对比：

```html
<table class="compare-table">
  <thead><tr><th>模式</th><th>特点</th><th>问题</th></tr></thead>
  <tbody>
    <tr><td class="mode-col">传统 Subagent</td><td class="feature-col">...</td><td class="issue-col">...</td></tr>
    <tr class="highlight"><td class="mode-col">动态工作流 ✓</td><td class="feature-col">...</td><td class="issue-col">—</td></tr>
  </tbody>
</table>
```

```css
.compare-table{width:100%;border-collapse:collapse;font-size:12.5px}
.compare-table th{background:var(--soft);padding:10px 12px;text-align:left;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--blue);font-weight:900;border-bottom:1px solid var(--line)}
.compare-table td{padding:11px 12px;border-bottom:1px solid var(--line);vertical-align:top}
.compare-table tr:last-child td{border-bottom:0}
.compare-table .mode-col{font-weight:750;color:var(--ink);white-space:nowrap}
.compare-table .feature-col{color:var(--muted);line-height:1.5}
.compare-table .issue-col{color:#c0392b;font-size:12px}
.compare-table .highlight{background:var(--soft-blue);border-left:3px solid var(--blue)}
.compare-table .highlight .mode-col{color:var(--blue)}
```

外套 div 必须加 `overflow-x:auto` 防止 390px 下截断：
```html
<div style="overflow-x:auto"><table class="compare-table">...</table></div>
```

### Metric Grid

- 2×2 或 4 宫格。
- 每格：大数字 + 小标签 + 极简蓝色进度条。
- 分割靠浅灰线或浅灰背景，不用厚边框。

### Ranking Bar

- 横向排名用于模型、工具、方案对比。
- 左名称、中间 track、右分数。
- 条形默认深蓝；非重点项用浅蓝 / 灰蓝明度变化。

### Ghost Card

- 浅灰底 `--gray`，承载次级解释。
- 无阴影或极轻阴影。
- 适合架构说明、步骤解释、成本/收益对照。

### Black Block

- 只用于少量强结论或反差模块。
- 面积过大时会破坏 Big White 的轻盈感。
- 一页通常不超过 1 个主要黑块。

### Chart

- 少网格、少颜色、强对齐。
- 图表网格线用 `--line` 半透明，不用重坐标轴。
- 多序列图表优先使用蓝色明度差，而不是新增强强调色。

### Footer / Metadata

- 细灰线上方或下方放 `SOURCE / PAGE / DATE / STYLE`。
- 字号小、字距开、颜色浅，但不能不可读。
- 用它增强报告感，不要塞正文信息。

## Mobile Rules

720px 以下：

- `.hero` 单列；深蓝 hero metric 降低高度。
- `.panel-grid` 全部单列。
- `.metric-grid` 单列，避免 2×2 在窄屏挤压。
- `.hero-pills` 单列，每项用细灰线分隔。
- `h1` 不低于 42px，但要避免横向溢出。
- ranking row 可压缩名称列，但分数保留右对齐。
- 禁止 fixed / sticky 下载按钮遮挡底部内容；若有保存按钮，放正常文档流底部。
- 390px 视口必须检查 `scrollWidth <= innerWidth`。

## Anti-patterns

- 把“大白风”做成普通白底模板，缺少大数字和报告级结构。
- 引入多个强强调色：橙、绿、紫、红同时出现会破坏主题。
- 用厚黑边框、粗阴影、纸感纹理、手绘线条。
- 黑色块面积过大，压过白底主视觉。
- 细灰小字过浅，导致元信息不可读。
| 面板太密，留白不足，变成 dashboard 噪音。 |
| 把 chart 做成彩色 BI 仪表盘，而不是克制商务报告图。 |

## 内容密度原则（来源：gsap-skills graph-paper 版重建，2026-06-20）

**graph-paper 初版（183行，12KB）被用户要求"内容进行完善补充"**。原因：骨架完整但内容太稀疏。

graph-paper / bigwhite 类信息卡的**内容充实度基线**：

| 区域 | 最低要求 | 充实版示例 |
|---|---|---|
| 技能/模块网格 | 8项展开（4×2），不只写3项 | 8项 + 每项 tags + 描述 |
| 代码模式 | ≥3 个完整可运行的代码块 | 4个（Timeline/ScrollTrigger/React/Performance） |
| 对照表 | ≥5 行 | 8行（Agent安装表） |
| 速查参考栏 | ≥3 列 | Easing 10项 + Plugins 10项 + Triggers 10项 |
| hero 指标 | ≥3 组 | 8 modules / 40+ agents / 100% FREE |

**判断标准**：如果内容在视觉上感觉"空"，问题通常是**结构不够**（需要更多行/更多块），而不是润色标题或改字号。初版草稿阶段就应按充实版基线规划，写完再评估是否需要压缩，不要从稀疏版开始再扩充。

**大文件写入策略**：graph-paper 充实版约 23KB，pixelstack 重建版约 18KB。若 write_file 超时，分 header `<style>` / body `<main>` / footer `</main></body></html>` 三段写入。

## Implementation Notes

当前主题预览文件：

- `theme/bigwhite.html`
- `docs/20260617-bigwhite-style-demo.html`：真实内容 demo，用 GLM-5.2 技术发布简报验证该风格在实际信息卡中的可用性。
- `_themes.yaml` 注册项：`bigwhite-style`
- `themes.html` 由 `python3 scripts/rebuild_themes.py` 从 `_themes.yaml` 重建。

创建或修改该主题时：

1. 先参考现有 `theme/*.html` 的结构，不要做孤立 demo。
2. 更新 `_themes.yaml` 时只追加 / 修改目标主题，禁止误替换相邻主题。
3. 运行 `python3 scripts/rebuild_themes.py`。
4. 用局域网预览 `http://<LAN_IP>:5588/theme/bigwhite.html` 与 `http://<LAN_IP>:5588/themes.html`。
5. 浏览器确认 `themes.html` 中出现 `infocard-bigwhite-style` 且 iframe 指向 `./theme/bigwhite.html`。

详见：`references/bigwhite-theme-creation-note.md`。

### 大白风 → 公众号正文迁移流程（2026-08-04 验证）

当需要将大白风信息卡或预览 HTML 迁移为微信可粘贴的正文 HTML 时，执行以下步骤：

#### Step 1：提取内容清单

从源 HTML 中提取并核对：
- 标题 / 副标题 / 引言文本
- 章节数量与标题
- 核心数字与数据带内容
- 决策框 / 两栏 / 风险提示的文本
- BOTTOM LINE 结论
- 图片数量与 src（若有）

#### Step 2：逐组件转换规则

| 源组件（class/CSS） | 目标组件（内联 section/span） | 关键转换 |
|---|---|---|
| `.hero` | `<section style="padding:40px 0 24px;border-bottom:1px solid #E8E8E8">` | 纯白底无色块 |
| `.title-hero` → `h1` | **`<h3 style="font-size:26px;color:#1A3A5C;font-weight:900">`** | **不允许 h1/h2，只能用 h3** |
| `.kicker` | `<p style="font-size:12px;color:#2D5F8A;text-transform:uppercase">` + `<span leaf="">` | 全大写英文标签 |
| `.data-strip` | `<section style="background:#F4F4F4;border-top:1px solid #E8E8E8">` | 灰底数据带 |
| `.data-cell .data-num` | 独立 `<p>` 字体 `28px;font-weight:900;color:#1A3A5C` | 大数字深蓝 |
| `.decision-box` | `<section style="border:1.5px solid #1A3A5C;border-top:3px solid #1A3A5C">` | 深蓝边框+顶框 |
| `.two-col` | `display:flex;gap:0;flex-wrap:wrap;border:1px solid #E8E8E8` | 两栏灰线分隔 |
| `.col` | `flex:1;min-width:200px` | 两栏独立 padding |
| `.risk` | `border-left:3px solid #2D5F8A;background:#F4F4F4` | 左侧蓝线+灰底 |
| `.bottom-line` | `background:#1A3A5C` | 深蓝底白字 |
| `.section-head` | `<section style="border-top:1px solid #E8E8E8;padding-top:14px"><h3>` | 章节分隔线 |
| `strong` | `<strong style="color:#1A3A5C;font-weight:700">` | 深蓝强调 |

#### Step 3：标签集合规检查

公众号 body 内**只允许**：`section / span / strong / img / h3 / h4 / ul / li`

常见错误：
- ❌ `<h1>` → ✅ `<h3>`
- ❌ `<h2>` → ✅ `<h3>`（**首次迁移时 hero 标题最易踩坑**）
- ❌ `<p>`（在 body 内）→ ✅ `<section>` 或直接 `<span leaf="">` 文本节点
- ❌ `<b>` → ✅ `<strong>` 或 `<span style="font-weight:700">`
- ❌ `<code>` → ✅ `<span style="font-family:'SF Mono',monospace;font-size:13px">`
- ❌ `class=` / `id=` → ✅ 全部内联 style
- ❌ `<div>` / `<main>` → ✅ `<section>`
- ❌ `display:grid` → ✅ `display:flex;flex-wrap:wrap`
- ❌ `::before` / `::after` 伪元素 → 删除，用实际 DOM 节点替代

#### Step 4：validate + audit 双验

1. `python3 scripts/validate_gzh_html.py <file>` — 必须 0 ERROR / 0 WARNING
2. 结构性审计（python script）：

```python
disallowed = ['class=', 'id=', '<div', '<main', '<h1', '<h2', '<p>', '<b>', '<code', '<pre']
# 全部应为 0 occurrences
# span leaf 计数应 ≥ 内容节点数
# 组件数量应与源一致（decision-box、bottom-line、data-strip 各 1 个等）
```

#### Step 5：移动端风险评估

| 模式 | 风险 | 缓解 |
|---|---|---|
| `min-width:130px` × 3（数据格） | 390px 视口下总宽 ~396px 超限 | `flex-wrap:wrap` 自动换行，无需额外处理 |
| `min-width:200px` × 2（两栏） | 390px 强制换单列 | 行为符合设计预期 |
| 固定 `font-size:26px` hero 标题 | 极窄屏可能溢出 | 依赖自然折行，纯内联无法用 @media |

**注意**：纯内联 CSS 无法使用 `@media` 查询；若有响应式需求，必须在转换前在源 HTML 中完成 `@media` 到容器宽度约束的替换。

#### 参考文件

- 转换后样稿：`references/bigwhite-wechat-migration-sample.html`
- 颜色 Token 表：见 SKILL.md 头部 Color Tokens 节
- 组件库原文（gzh-design 格式）：`gzh-design/references/theme-bigwhite.md`



### 充实版内容结构（2026-07-03 验证）

**适用场景**：五框架全景对比卡（`ai-agent-memory-frameworks.html`，38KB，12 个内容模块）。

**已验证的模块组合（按顺序）**：

| 模块 | 用途 | 对应 CSS class |
|---|---|---|
| 能力对比矩阵 | 多框架 10+ 维度横评 | `.compare-table` + 响应式 `.overflow-x:auto` |
| 独立框架卡片 | 每框架定位/核心/标签/元信息 | `.fw-grid`（5列）→ mobile 2列 |
| 性能指标格 | hero 数据突出 | `.metric-grid`（2×2） |
| 架构解析 | 技术路线说明 | `.feat`（编号+内容）|
| 场景矩阵 | 选型对照表 | `.compare-table`（推荐框架+原因）|
| 综合判断黑块 | 三条路线哲学总结 | `.panel.black`（深色反差）|
| SOP 步骤流 | 操作流程 | `.sop-flow`（5列）→ mobile 单列 |
| 集成代码 | 可运行代码片段 | `pre{overflow-x:auto;word-break:break-all}` |
| 优劣势对照 | 两个方案快速对比 | `.pros/.cons` 配色双栏 |
| 场景卡 | 四象限应用推荐 | `.scene`（4列）→ mobile 2列 |
| 核心判断 | 三条洞察结论 | 三栏左侧色条分隔 |

**关键 CSS 经验**：
- `.compare-table` 必须外套 `div{overflow-x:auto}`，防止表格在 390px 下整体溢出
- `pre{overflow-x:auto;white-space:pre-wrap;word-break:break-all}` 三件套防止代码块截断
- `.fw-grid` 在 720px 下自动切 3 列，390px 下 2 列；配合 `.scene` 4→2→1 列节奏感好
- `.panel.black` 用于综合判断区，制造视觉反差；每卡不超过 1 个
- SOP 步骤流 `.sop-flow` 必须在 `@media` 中强制 `grid-template-columns:1fr`，不能用默认 desktop 的多列

**判断标准**：本卡 38KB、12 模块，在大白风下仍保持干净报告感——骨架是 `.panel + .head + .compare-table + .fw-grid`，装饰极简，节奏靠内容本身建立。

---

## Acceptance Checklist

- [ ] 白色主画布占主导，没有渐变 / 纹理 / 重阴影。
- [ ] 深蓝是唯一强强调色。
- [ ] 至少有一个 hero metric / 大数字模块。
- [ ] 使用细灰线与浅灰 ghost card 建立分区。
- [ ] 有报告式 top line 或 footer metadata。
- [ ] 图表颜色克制，优先蓝色明度变化。
- [ ] 720px 以下网格单列。
- 390px 无横向溢出。
- 长信息卡的移动端验收必须覆盖完整高度：如果首屏截图看不到 footer / 来源区，继续拉高窗口或按 scrollHeight 重截，而不是把截断图当成通过。
- `theme/bigwhite.html` 可通过局域网服务预览。
- `themes.html` 已重建并能看到该主题。

## Naming / Aliases

- Skill name：`infocard-bigwhite-style`
- 中文名：大白商务风 / 大白报告风
- 常用别名：bigwhite、白底商务风、白皮书风、报告页风、大数字白底风
- 触发词：大白风、白底报告、商务简报、大数字、深蓝强调、细灰线、GLM-5.2 参考图
- Theme slug：`bigwhite-style`
- CSS class：`bigwhite`
- Theme file：`theme/bigwhite.html`

## Active theme adapter contract

This package implements `infocard-theme-contract@1`; its active responsibility is visual identity only. The adapter registry declares suitability, tokens, typography, colors, borders, shadows, background, components, mobile exceptions, template and assets. Any earlier generic authoring, browser validation or publishing procedure is deprecated compatibility guidance; `infocard-card-authoring`, `infocard-quality-gate` and `infocard-publish-pipeline` own those decisions.
