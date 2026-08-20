---
name: infocard-style-man-skill
description: 信息卡风格管理员。用于创建、审查、维护 infocard style skill 与 theme 文件的一致性；以统一 Style Skill Schema 为门禁，发现冗余、越界、结构漂移时给出归位建议和维护方案。
version: 1.2.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, style, governance, theme, schema, review, maintenance]
    related_skills: [any2card, infocard-pub-publisher, infocard-metadata-provenance, infocard-mobile-verifier]
---

# infocard-style-man-skill · 信息卡风格管理员

## 2026-07-25 crayon 主题 + 4 轮评审流程

### 命名规范（已确认）

- 格式：`infocard-***-style`，全小写，连字符分隔
- **根据外观命名，不根据内容**（用户明确要求）
- 候选示例：`crayon`/`colorful`/`softcard`，选最贴近视觉特征的词
- 参考：`themes.html` 中所有现有主题的命名格式

### 主题双模式（crayon R4 确认）

部分主题支持两种视觉模式，通过 CSS 选择器切换：

| 主题 | 模式 | 触发 |
|---|---|---|
| crayon | 网页卡片（默认） | 不加 `.poster-shell` |
| crayon | 编辑海报（R4） | 加上 `.poster-shell` 包裹 `.page > *` |

**编辑海报模式的 CSS 关键修复**：`.poster-shell .card-body` 必须加 `grid-column:2`，
否则绝对定位的 `.card-stripe` 脱离网格后，`.card-body` 自动落入第1列，正文只剩 86px宽。
详见 `infocard-crayon-style/references/grid-column-trap.md`。

### 新主题 4 轮评审流程

```
R1  →  命名提案 + 视觉特征提取
      输出：命名候选表（含视觉依据），等待确认命名

R2  →  CSS 骨架草案（token + 基础布局）
      Chrome headless 截图 → vision 分析 → 列出具体问题

R3  →  基于 R2 反馈修改
      截图 → vision 终审 → 确认通过或继续修改

R4  →  最终微调（如需）
      截图 → 确认通过
```

**通过标准**：vision 评估无明显布局/配色/协调性问题。

### 新主题对抗评审流程（用户要求时启用）

用户说"评审流程使用2个智能体进行对抗"时执行：

```
Agent A（批评者）：严格对照原图找差异，输出 | 元素 | 原图 | 当前 | 严重程度 |
Agent B（辩护者）：挑战 A 的判断，提出修复方案
主线程裁判：合并两方意见，决定修复项和保留项
→ 修复 → 截图验证 → 下一轮（最多4轮）
```

#### 评审闭环与失败处理

1. **先锁定真实对照材料**：必须核验参考图路径/URL、当前主题截图或线上页面；不得用先前摘要、臆测描述或另一张截图替代当前证据。
2. **两方结果必须分开记账**：A 的批评、B 的辩护、主线程裁判分别报告。单个智能体超时、无摘要或无法取证时，不得把它记为 PASS/FAIL；应重派一个不依赖外部网络的替代评审，或明确标记“证据不足”。
3. **裁判不能把“主题扩展”自动判为缺陷**：先区分核心视觉骨架（背景、标题、条目排列、编号/分隔、字体/对比度）与网页功能扩展（统计区、工作流、代码区、响应式导航）。只有前者明显偏离且可由参考图证明时，才列为阻断修复项。
4. **每轮只修复最高影响的 1–3 项**：修复后必须重新截图/打开页面验证，不因追求像素复刻而破坏语义、响应式或信息可读性。
5. **视觉评审与可访问性分开验收**：颜色对比度、装饰 emoji 的 `aria-hidden`、长 token 换行属于独立质量门禁；它们可以修复，但不得被包装成“与参考图相似度已提高”的视觉证据。
6. **最多 4 轮的含义**：每轮必须有真实输出和明确裁判结论；超时/无证据轮次不应虚报为通过，也不应重复消耗轮次。达到上限后报告各轮证据完整度与未决风险。

- 修复项由裁判决定，智能体仅提供建议
- 黄色文字对比度（WCAG）、背景色准确度为**必修复项**
- 圆角/阴影/五色系统为主题结构性语言，通常**保留**

### 新主题纳入管理清单（必须按顺序执行）

**⚠️ 关键规则：`_themes.yaml` 是单一事实源，`themes.html` 不得手动编辑**

每次添加/修改主题，必须按以下顺序执行：

```
1. 更新 theme/***.html              （主题演示页）
2. 更新 _themes.yaml                 （事实源）
3. python3 scripts/rebuild_themes.py （重建 themes.html）
4. git add _themes.yaml themes.html  （两文件一起提交）
```

手动修改 `themes.html` 会在下次 rebuild 时被覆盖

### 新主题纳入管理清单（必须按顺序执行）

**⚠️ 关键规则：`_themes.yaml` 是单一事实源，`themes.html` 不得手动编辑**

每次添加/修改主题，必须按以下顺序执行：

```
1. 更新 theme/***.html              （主题演示页）
2. 更新 _themes.yaml                 （事实源）
3. python3 scripts/rebuild_themes.py （重建 themes.html）
4. git add _themes.yaml themes.html  （两文件一起提交）
```

手动修改 `themes.html` 会在下次 rebuild 时被覆盖。

纳入清单：
1. `theme/***.html` — 独立主题演示页
2. `_themes.yaml` — 主题注册表（single source of truth）
3. `themes.html`（自动生成，禁止手动改）
4. `scripts/rebuild_themes.py` — 每次纳管必须运行

### 新主题 Skill 文件

在当前 Skill 安装根的 `content/infocard-***-style/SKILL.md` 创建，含：
CSS 变量表、核心类名、适用/不适用场景、参考页面。

### 新主题→信息卡标准链路

```
命名(R1) → 骨架(R2) → 评审(R3/R4) → 纳管 → Skill文件 → 写卡
→ build/verify/leak → commit/push → 公网验收 → 清理worktree
```

## 2026-07-12 主题修复交付记录（第二批次）

| 卡 | 原主题 | 新主题 | commit |
|---|---|---|---|
| chinese-independent | ❌ darkblue | ✅ **redswiss**（红黑瑞士编辑风） | `2ee3a43` |
| aitoearn | ❌ darkblue | ✅ **redswiss**（Monetize/Publish 商务变现场景） | `2ee3a43` |
| ai-content-kb | ❌ darkblue | ✅ **darkgreen**（知识安全，深绿终端） | `2ee3a43` |
| humla | ❌ darkblue | ✅ **green**（本地隐私感，亮绿 productivity） | `2ee3a43` |
| emilkowalski | ❌ darkblue | ✅ **white-purple**（UI 设计审美，紫白轻科技） | `2ee3a43` |

根因（第一批次 + 第二批次）：
- `bundle.style` 只写入 meta.yaml，从未被 `build-site.js` 消费
- HTML 内嵌 CSS 与 `theme/*.html` 完全隔离
- 18 张近期卡中 12 张被套入 darkblue，深蓝背景与内容完全不匹配

工作流见 `references/theme-rebuild-workflow-20260712.md`。

### ⚠️ 关键教训：vision 模型误读截图的真实根因（含平台暗色 UI 欺骗 — 2026-07-25 小红书教训）

**症状**：用 puppeteer 截出的图，vision 模型判断为"深蓝旧主题"，但 `curl | grep CSS token` 显示 CDN HTML 已是正确新主题。

**根因 A**：未隔离 profile 的 headless Chrome 可能复用本机已有页面缓存（来自之前浏览器访问过的 URL）；即使用 `networkidle2` 等待，JS/CSS 仍可能来自本地磁盘缓存。按 `chrome-automation-safety` 使用独立 `--user-data-dir`，不要把缓存问题错误归因于 `--no-sandbox`。

**根因 B（2026-07-25 新教训）**：平台暗色 UI 外壳欺骗。小红书等平台内容嵌在暗色 UI 里，vision 模型把平台背景当成参考图背景，导致背景色判断完全相反——误判为"深色背景"，实为暖米黄（`#f0ead8`）。

**正确验证链路**（按此顺序，永远不要跳到 vision 分析）：
```
1. mcp__minimax__understand_image 提取背景色（方向参考）
2. browser_navigate → grep ':root' 提取 CSS 变量（ground truth）
3. 两路交叉验证后再确定 CSS 方向
4. Chrome headless screenshot → vision 分析（仅在 step 1-2 通过后用）
```
step 1-2 的结论优先。step 3 若矛盾，step 2 永远赢。

**验证链路**（按此顺序，永远不要跳到 vision 分析）：

```
1. curl HTML → grep CSS token（唯一可信）
2. puppeteer screenshot → vision 分析（仅在 step 1 通过后用，且说明 headless 缓存已清）
3. 用户浏览器看旧图 → 是本地 CDN 缓存，让用户 Ctrl+Shift+R 或 DevTools Disable cache
```

**永远先执行 step 1 再说"截图给用户看"**。Step 1 是 ground truth，step 2/3 可能被缓存误导。

参见 `references/screenshot-verification-technique-stack.md`（已存在，可能需补充本 lesson）。

## Overview

`infocard-style-man-skill` 是信息卡风格体系的管理员技能，负责治理 infocard style skill 与对应 theme 文件的结构一致性、职责边界和长期可维护性。

它不是单个视觉主题，也不是发布工具。它的职责是建立并执行一套统一的 **Style Skill Schema**：让每个风格技能拥有相似结构，只在内部 UI token、组件、布局、适用场景上体现差异。

## Role Boundary

本技能采用 **全流程管理员** 模式：

- 负责创建新的 infocard style skill。
- 负责审查现有 style skill 是否符合统一 schema。
- 负责维护 style skill 与实际 theme 文件的一致性。
- 负责发现冗余、越界、结构漂移，并提出归位建议。
- 作为 style skill 创建 / 重构前的门禁标准。

不默认越权执行跨技能迁移、批量重写、发布或 git push。涉及写入、迁移、删除、合并时，需要用户明确授权。

## Scope

### 管理对象

本技能管理：

1. **infocard style skills**
   - 例如：`infocard-redswiss-style`
   - `infocard-hardblue-style`
   - `infocard-q-style`
   - `infocard-paper-warm-style`
   - `infocard-blue-technical-manual-style`
   - `infocard-color-material-style`

2. **对应 theme 文件**
   - `theme/*.html`
   - `_themes.yaml`
   - `themes.html`
   - 主题预览页

3. **style skill 与 theme 文件之间的一致性**
   - skill 中描述的 token 是否与 theme 一致
   - skill 中的 layout skeleton 是否能在 theme/demo 中找到
   - theme 中新增组件是否同步回 skill
   - 主题命名、slug、中文名、触发词是否一致

### 不直接管理

以下内容不属于 style 管理层的主责：

- 发布流程、CI、GitHub Pages 部署 → 归 `infocard-pub-publisher`
- sidecar metadata、date、updated、path、slug 来源 → 归 `infocard-metadata-provenance`
- 移动端截图验收、390px overflow 修复 → 归 `infocard-mobile-verifier`
- 内容抽取、文章转卡、通用生成流程 → 归 `any2card`
- 具体调查、研究、报告写作 → 归对应 research / investigation skill

如果这些内容出现在 style skill 中，本技能应标记为越界，并建议迁移到对应技能或 references。

## When to Use

使用本技能，当用户说：

- “创建一个 infocard style skill”
- “审查这些 style skill 是否结构一致”
- “统一信息卡风格技能结构”
- “某个 style skill 是否越界 / 冗余”
- “维护 theme 和 style skill 的一致性”
- “给 redswiss / hardblue / q-style 做 schema 化”
- “把 style skill 里的发布流程 / CDP / CI 内容迁出去”
- “判断这个新主题应该怎么写 skill”

不要用本技能替代具体风格技能生成卡片。生成卡片时，仍由 `any2card` 和具体 `infocard-*-style` 负责。

## Governance Mode

本技能采用 **Schema 治理型** 输出：

1. 先定义统一 Style Skill Schema。
2. 再用 schema 创建、审查、重构每个 style skill。
3. 对不符合 schema 的内容给出缺失项、越界项和归位建议。
4. 作为 style skill 创建 / 重构前的门禁 checklist。

## Unified Style Skill Schema

每个 infocard style skill 应尽量采用以下统一结构。差异应体现在 token、组件、布局和适用内容，而不是章节组织随意漂移。

### 1. Overview

说明主题的一句话定位：

- 这是什么风格？
- 解决什么视觉表达问题？
- 适合哪一类 infocard？

示例：

> 红黑瑞士风用于开源工具图鉴、CLI 生态和 AI 工具集合类高密度信息卡，视觉锚点是红色斜切 hero、纯红黑配色和紧凑数据模块。

### 2. Use Cases

必须包含：

- 适合的内容类型
- 不适合的内容类型
- 触发词 / 用户说法
- 与相近主题的区分

### 3. Design DNA

描述主题气质和视觉原则：

- 信息密度
- 情绪强度
- 是否偏技术、调查、纸感、海报、手册
- 主视觉锚点
- 读者第一眼应感受到什么

### 4. Color Tokens

必须列出标准 CSS token：

```css
:root {
  --bg: ...;
  --paper: ...;
  --ink: ...;
  --muted: ...;
  --line: ...;
  --accent: ...;
}
```

要求：

- token 命名稳定。
- 明确每个 token 的用途。
- 不允许在正文中散落大量未登记色值。
- theme 文件与 skill 中 token 必须一致。

### 5. Typography

必须给出字号层级：

- Hero title
- Subtitle / lead
- Section title
- Body
- Caption / meta / pill
- 最小字号底线

建议明确桌面与移动端差异。移动端最小可读层级通常不应低于 11.2px。

### 6. Layout Skeleton

必须给出标准 HTML 结构骨架，而不是只描述“看起来像什么”。

建议包含：

```text
hero / topbar
stats / metadata panel
lead / judgment
section blocks
grid / card matrix
flow / timeline / code / image gallery, if applicable
footer / source note
save button
```

如果主题有横版 / 竖版差异，应明确默认比例与降级方案。

### 7. Component Rules

必须说明主题下常用组件如何表现：

- badge / pill / tag
- stat card
- section header
- content card
- warning / alert / callout
- code block
- quote block
- table or table replacement
- image gallery
- timeline / flow
- save button

每类组件至少说明：用途、视觉特征、禁忌。

### 8. Mobile Rules

必须明确：

- 720px 以下如何退化
- 390px 视口如何检查
- 哪些 grid 必须单列
- 哪些组件允许保留双列
- fixed save button 是否允许，以及如何避让内容
- 字号、padding、overflow 的底线

Style skill 只描述移动端规则；实际截图验收和修复流程归 `infocard-mobile-verifier`。

## Theme Application Contract（新卡创建与发布门禁）

当用户要求创建、发布或重建信息卡时，`meta.yaml` / bundle 中的 `style` **仅是声明与索引字段，不是主题已应用的证据**。不得因存在 `style: darkblue`、`style: redswiss` 等字段就宣称卡片使用了该主题。

### 强制执行链路

1. 根据内容类型自动选择最匹配的已注册主题；用户明确指定时优先用户选择。
2. **创建 HTML 前必须加载对应的 `infocard-*-style` Skill**，并读取对应 `theme/*.html` demo 或其指定标准参考页。
3. 以该主题的 token、布局骨架和组件规则生成 HTML；禁止复制最近一张卡的内嵌 CSS 后仅改文案或颜色。
4. 写入与实际实现一致的 `meta.yaml.style`。
5. 发布前执行主题一致性门禁：
   - HTML CSS token / 主要色值与目标主题签名一致；
   - 使用主题要求的 hero、section、卡片、数据块或图谱等核心组件；
   - 不触发该主题的反模式；
   - 390px 移动端验收通过。
6. 交付报告必须列出：**自动选择的主题、实际调用的 Style Skill、主题一致性验证结果**。

### 用户默认策略

- 用户不指定主题时，由助手按内容自动选择最匹配的主题，并保留选择依据。
- 不得默认把所有卡片套入同一种深蓝/卡片网格模具。
- 历史卡是否重做必须单独取得授权；新机制不自动批量改写既有卡。

## Anti-patterns

必须列出这个主题不能做什么：

- 不能混入哪些颜色
- 不能保留哪些旧模板结构
- 不能把哪个相近主题混进来
- 不能如何滥用装饰、阴影、渐变、极小字

### hardblue 专项反模式（高优先级）

hardblue 的 CSS token 系统是红黑蓝三色：

```css
:root{
  --red:#c8102e;     /* 主强调、结论、section-no 块 */
  --black:#0a0a0a;   /* 边框、阴影、深色 card */
  --white:#f5f2ec;  /* card 背景、quote */
  --blue:#0036a3;    /* 流程、CDP、数据、蓝色 card */
  --green:#006b3c;   /* green card（次要） */
  --yellow:#e8c200;  /* yellow tag（装饰） */
}
```

**必须严格遵守，即使内容的字面意思暗示其他颜色。**

常见错误：
- 做"橙皮书"卡片 → 引入 orange/amber/amber 颜色 → ❌ 违反
- 做"知识库"卡片 → 引入绿色 token 以外的绿色 → ❌ 违反
- 做"AI 工具"卡片 → 引入蓝色 token 以外的蓝色 → ❌ 违反

正确做法：从主题 CSS token 系统出发构建卡片，不得用"语义契合"替代"主题规范"。重建 = 从零用 hardblue CSS token 系统和骨架，不接受从旧卡复制后换色。

**标准参考模板**：`docs/20260610-obscura.html`（29492 字节，完整实现 hardblue 全套 token、组件、章节结构）。重建时必须先读该文件，理解其 CSS token 系统和 HTML 结构，再开始写新卡。

### git staging 路径陷阱（所有卡片发布通用）
### git staging 路径陷阱（所有卡片发布通用）
发布前 `git add` 时，路径必须包含完整文件名：

```bash
git add docs/20260611-xxx.html           # ✅ 正确
git add docs/20260611-xxx               # ❌ 错误：只 add 了目录本身，HTML 不在其中
```

症状：commit message 正确，但线上 pages 404，因为 HTML 文件从未被 commit 进仓库。

### Tag/Chip 元素禁止双重边框（高优先级，所有含 rough-box 的 style）
handline、blue-technical、color-material 等使用 `rough-box` 纯 JS SVG 边框的风格，**严禁**在 tag/chip 类元素上同时写 CSS `border` 属性。

错误做法：
```css
/* ❌ 同时有 CSS border 和 rough-box SVG 边框 → 内外双层边框 */
.tag-chip {
  border: 1.5px solid #2c2723; /* ← 移除这行 */
}
```

正确做法：
```css
/* ✅ 只有 rough-box SVG 外边框，无 CSS border */
.tag-chip {
  /* 无 border 属性 */
  background: #f4f0e8;
  color: #5a4a38;
}
```

验证方法：截图放大 tag 区域，若出现内外两层边框 → 基类或变体仍有 CSS border 未清理。

根因：`rough-box` 类元素由 JS 扫描后插入 SVG `<path>` 边框；同时有 CSS `border` 则渲染内 solid 线 + 外 sketchy 线，视觉错误。

### themes.html iframe 背景隔离（高优先级，主题预览页）

**`themes.html` 的 `.preview-iframe` 必须声明与卡片 body 相同的背景色。**

症状：父页面装饰（彩色竖条、圆形图形等）从 iframe 外围渗进卡片左右两侧的灰色 body 区域，在截图里表现为"多余留白"。

根因：iframe 默认 `background:transparent`，父页面 `body{overflow-x:hidden}` 无法切断 z-index 叠压。

修复：`.preview-iframe{background:#F2F2F2}`（与 swiss main-style 卡片 body 背景一致）。

相关：`theme/main.html` 的 body 背景 `#f5f2ec` → `#F2F2F2`（Anti-pattern 01）要和这里同步。

### body/paper 背景一致性（高优先级，所有主题）

**body 背景色必须与实际卡片背景色一致。** 主题模板（`theme/*.html`）的 `body{background}` 与卡片 inline CSS 的 `--swiss-bg` 或其他背景变量必须完全一致。

症状：页面边缘出现不该有的背景色块（如灰色背景外露暖米色，或反之），视觉上像"多余空白"。

根因：`theme/main.html` 长期使用 `#f5f2ec`（暖米色），但 swiss 风格卡片用 `--swiss-bg:#F2F2F2`（灰色），两边不一致。当卡片以独立页面（而非 iframe 嵌入）访问时，body 灰色背景与 `.page` 白色区域之间出现预期外的色差边缘。

正确做法：
```css
/* ✅ body = 卡片外框架色，page = 白色内容区 */
body{background:#F2F2F2}
.page{background:#fff;min-height:100vh}
```

**本规则于 2026-06-27 修复 `theme/main.html` 并固化入 skill。**

### meta.yaml 必须用 `desc` 字段（高优先级，所有卡片发布）

`meta.yaml` 的描述字段**必须**用 `desc`，不能用 `description` 或其他名称。

**错误做法：**
```yaml
description: 这是一段描述  # ❌ 字段名错误
```

**正确做法：**
```yaml
desc: 这是一段描述  # ✅
```

**症状**：首页卡片列表中该卡无描述文字（列表区域为空），但信息卡页面本身有描述。

**根因**：build 脚本（`scripts/index-build-lib.js`）会把 YAML 对象直接复制进 `_index.yaml`；若 YAML 用 `description`，index 存 `description`；但首页渲染 JS 读取 `desc` 字段，两边字段名不一致导致渲染为空。

**修复**：
1. 把所有 meta.yaml 中的 `description:` 改为 `desc:`
2. build 脚本已加 normalize 逻辑兜底（`description` → `desc`），但源文件仍应统一

**防止**：在 `infocard-style-man-skill` Anti-patterns 和 `infocard-metadata-provenance` 中均已记录此约束，发布前检查字段名。

### 验证 commit 模式（每个 style skill 应记录）
每个 style skill 应在 Implementation Notes 或 Acceptance Checklist 末尾记录**已验证通过的 live commit**：

```text
已验证 commit：`abc1234`（YYYY-MM-DD）
- 线上：https://ccwq.github.io/infocard-pub/theme/{slug}.html
- 验证内容：桌面 + 390px 移动端截图均 PASS
```

这样未来重构时可以快速对比 live 渲染，不只靠 skill 文档描述。

### 10. Acceptance Checklist

必须有门禁 checklist：

- [ ] token 与 theme 文件一致
- [ ] 章节结构符合本 schema
- [ ] layout skeleton 可执行
- [ ] mobile rules 明确
- [ ] anti-patterns 明确
- [ ] 没有发布 / CI / git / CDP 等越界流程
- [ ] theme demo / `_themes.yaml` / skill 命名一致

### 11. Naming / Aliases

必须包含：

- 英文 skill name
- 中文名
- 常用别名
- 触发词
- 主题 slug
- 对应 theme 文件路径，如果存在

## Link Delivery

- 在 infocard 相关交付里，预览页、demo 卡、参考页、主题页等外链优先用 Markdown 可点击链接，不要裸 URL。
- 这条规则属于 infocard 风格交付规范的一部分，适用于所有平台输出，不限定某个客户端。
- 需要给出多个局域网预览地址时，优先用可点击链接列表，避免在聊天里只堆裸 IP/URL。

## Theme Gallery Visibility Pitfall

- 新增主题时，`theme/*.html` 和 `infocard-*-style` skill 只是第一步；必须同步更新 `_themes.yaml` 并重建 `themes.html`，否则主题页不会出现新主题。
- 如果公网页面没出现新主题，优先检查两件事：
  1. 生成产物是否已随 commit 一起提交（尤其是 `_index.yaml` / `index.html`）；
  2. GitHub Pages 是否已经部署到最新 push。
- 这类问题应归类为“主题可见性 / 发布链路”，不要误判为 style 主题本身失效。
- 详细复盘见 `references/theme-gallery-link-delivery-note.md`。

## Review Procedure

审查一个 style skill 时，按以下顺序执行：

1. **识别对象**
   - skill 名称
   - 对应 theme 文件
   - 是否已注册到 `_themes.yaml`

2. **Schema 覆盖检查**
   - 对照 Unified Style Skill Schema 标记：完整 / 缺失 / 弱化 / 越界。

3. **边界检查**
   - 发布、CI、git、Pages、CDP、图片下载、metadata 等内容是否混入 style 主体。
   - 如果混入，标记为越界，并建议归位。

4. **一致性检查**
   - skill 描述的 token 是否和 theme 文件一致。
   - skill 描述的组件是否在 theme/demo 中存在。
   - theme 文件中的新增组件是否在 skill 中说明。

5. **冗余检查**
   - 是否与 `any2card` 的通用生成流程重复。
   - 是否与 publisher / metadata / mobile verifier 重复。
   - 是否存在多个 style skill 讲同一类规则但命名不同。

6. **结论分级**
   - PASS：结构完整，边界清楚，可作为主题规范。
   - NEEDS NORMALIZATION：可用，但章节结构不统一或缺少关键块。
   - NEEDS SPLIT：混入大量 workflow / CI / 发布 / 案例笔记，需要拆分。
   - FAIL：不是 style spec，无法作为主题技能使用。

## Creation Procedure

> ⚠️ **门禁**：创建 style skill **不等于** 自动出现在 themes.html。必须同时完成步骤 2–4（注册 + 预览页 + 重建），风格才会在预览页可见。本会话教训（2026-06-14；2026-06-17 BigWhite 再次验证）：创建/新增 `infocard-*-style` 后，如果只改 skill 或只写 `theme/*.html`，而没有同步 `_themes.yaml`、`themes.html` 与生成产物，公网主题页就不会出现新主题。

创建新的 infocard style skill 时：

1. 明确主题定位。
2. 确定是否已有相近主题，避免重复造轮子。
3. 如果用户给了参考站点或参考图，先做一个短版 `grill-me` 对齐：一次只问一个问题，默认 3 轮；如果用户明确要求更细，可放宽到最多 5 轮，但不要超过 5。
4. 按 Unified Style Skill Schema 起草。
3. 如果存在 theme 文件，同步写明路径和 token 对应关系。**风格选择**：先用 `references/content-type-to-style-mapping.md` 的决策树判断合适风格，不要凭直觉猜。如果内容包含代码架构/知识图谱 → graph-paper；如果内容是自动化工具/终端感 → darkblue；如果无法判断，优先选 main-style（swiss 红蓝，最稳）。
6. 如果没有 theme 文件，标记为 "skill-only theme spec"，不要假装已有模板。
7. **新增主题时必须同步更新 `_themes.yaml` 并重建 `themes.html`**，然后在公网主题页复核主题是否出现。
8. 将案例、踩坑、会话中提炼出的视觉校调、配色微调、验证结论放到该主题自己的 `references/` 里，而不是堆进主 SKILL.md；例如 `references/darkblue-style-creation-pattern.md` 记录了从 Nezha 图像提取深蓝工作台风的全流程；本次 graph-paper 主题对应的会话笔记见 `references/codegraph-graph-paper-style-note.md`。
9. 完成后用 Acceptance Checklist 做门禁。

> 📎 参考实例：从图像创建深蓝工作台风 → 见 `references/darkblue-style-creation-pattern.md`
> 📎 图像驱动主题创建的通用视觉评审循环 → 见 `references/image-to-theme-visual-review-loop.md`

完整流程（包括 theme 预览页、_themes.yaml 注册、rebuild_themes.py）见 `references/new-theme-creation-workflow.md`。
主题总览页看不到新风格时，先查 `references/theme-gallery-regeneration-and-visibility.md`，它记录了 `_themes.yaml` → rebuild → live Pages 验证这条最短修复链。

新增参考：`references/content-type-to-style-mapping.md` 记录内容类型 → 视觉风格映射规律（代码架构→graph-paper，自动化工具→darkblue 等），来源为 2026-06-27 session 两张卡片的风格选择决策验证。

新增参考：`references/body-paper-background-consistency-20260627.md` 记录 `theme/main.html` body 背景色与 swiss 卡片 `--swiss-bg` 不一致导致"多余空白"的根因、修复与验证过程。

新增参考：`references/bigwhite-theme-rollout-20260617.md` 记录了 BigWhite 主题从本地预览到公网可见的修复链，以及 Pages 因 `_index.yaml` 过期而失败的典型报错。

新增参考：`references/graph-paper-style-session-note.md` 记录 codegraph 启发下的 graph-paper-style 命名、视觉 DNA 和本地化图示资产用法。

新增参考：`references/table-border-radius-collapse-pitfall.md` — `border-collapse:separate` + `colspan="2"` 下 `<td>` 的 `border-radius` 被渲染模型静默忽略；记录 4 种修复方案（collapse 改法、内层 div wrapper、无结构改动的视觉替代、去除 separate）、根因分析和验证命令。session 来源：mattpocock/skills v12 scene-row 圆角失效修复。

新增参考：`references/screenshot-verification-technique-stack.md` 记录视觉评审截图链路（browser_vision / Page.captureScreenshot 均超时 → CDP PrintToPDF → Python base64 decode → pdftoppm → VLM 分析），以及已知可用端口和失败恢复决策树。**2026-07-14 补充**：静态截图无法验证 `:hover` 状态；hover 效果 CSS 正确即可通过，不需要强制截图验证。

新增参考：`references/sage-swiss-style-session-note.md` 记录 sage-swiss-style 从零精准复刻的完整评审轨迹（5 轮 8.1→9.5）、设计语言固化 token、关键设计决策和交付物链接。

## Maintenance Procedure

维护现有 style skill 时：

1. 先判断是：
   - 小修补
   - schema 化重排
   - 越界内容拆分
   - 与 theme 文件对齐
   - 合并 / 废弃重复主题

2. 小修补可以直接 patch。
3. schema 化重排应保留原有有效 token、组件和禁忌，但重排到统一章节。
4. 越界内容默认只标记并建议归位，不自动迁移。
5. 若用户明确授权迁移，才把内容拆到对应 skill 或 references。
6. **用户纠正任务类型时先回滚错误产物，再创建正确的 class-level 风格技能。**
   - 例如用户把“发布一张卡”改成“创建一个新的风格 skill”，应先撤回误发内容，再抽象出新 style skill，而不是在错误产物上直接继续堆料。
2. 主题重建工作流（facts.json 缺失、主题错配）：见 `references/theme-rebuild-workflow-20260712.md`。

3. 主题重命名 / 改名 / rebrand 的统一流程见 `references/theme-rebrand-and-rename-workflow.md`。
   - 这类工作先改 skill，再改 `_themes.yaml` / `themes.html` / `theme/{slug}.html` / 资产文件名，最后做全仓库旧名清零检查。
   - 新增主题时，优先把会话中提炼出的视觉校准、配色微调、验证结论放到该主题自己的 `references/` 里，而不是堆进主 SKILL.md；例如 `infocard-wood-style` 的 `references/wood-style-session-note.md`、`infocard-darkgreen-style` 的 `references/darkgreen-style-creation-note.md`。

## Redundancy and Boundary Policy

本技能采用 **标记并建议归位** 原则：

- 发现越界内容时，指出它为什么不属于 style skill。
- 指出它应该归属到哪里。
- 不默认执行迁移。
- 只有用户明确说“迁移 / 拆分 / 重构 / 直接改”，才执行写入。

常见归位规则：

| 越界内容 | 应归属 |
|---|---|
| build / verify / commit / push / Pages 延迟 | `infocard-pub-publisher` |
| date / updated / path / sidecar provenance | `infocard-metadata-provenance` |
| 390px 截图、overflow 修复、浏览器验收 | `infocard-mobile-verifier` |
| 内容抽取、网页转卡、通用 HTML 生成 | `any2card` |
| 具体案例复盘、一次性 session 教训 | 当前 skill 的 `references/` |
| 图片下载、CDP 路由、Wikimedia 抓取 | 对应 scraper / media / verification skill 或 references |

## Gatekeeping Standard

本技能是 **门禁型** 管理员：

- 创建新 style skill 前，应先过 schema checklist。
- 重构现有 style skill 前，应先做结构审查。
- 如果 checklist 不通过，应标记为不合格并给出修复建议。
- 不强制阻断用户当前任务，但必须明确风险。

门禁结论格式：

```text
结论：PASS / NEEDS NORMALIZATION / NEEDS SPLIT / FAIL
原因：...
缺失：...
越界：...
建议：...
下一步：...
```

## Output Formats

### 1. Style Skill 审查报告

```text
结论：NEEDS NORMALIZATION
对象：infocard-xxx-style

Schema 覆盖：
- Overview：有
- Use Cases：弱
- Design DNA：有
- Color Tokens：缺
- Typography：有
- Layout Skeleton：弱
- Component Rules：缺
- Mobile Rules：有
- Anti-patterns：弱
- Acceptance Checklist：缺
- Naming / Aliases：有

越界内容：
- GitHub Pages 发布延迟 → 应归 infocard-pub-publisher
- CDP target_id 路由 → 应归 mobile/verifier 或 references

建议：
1. 补 Color Tokens
2. 补 Layout Skeleton
3. 把发布流程迁出主文档
```

### 2. 新 Style Skill 创建骨架

```text
# infocard-xxx-style

## Overview
## Use Cases
## Design DNA
## Color Tokens
## Typography
## Layout Skeleton
## Component Rules
## Mobile Rules
## Anti-patterns
## Acceptance Checklist
## Naming / Aliases
```

### 3. 维护方案

```text
目标：把 infocard-xxx-style schema 化
范围：只改 SKILL.md，不改 theme 文件
风险：可能需要后续同步 theme demo
步骤：
1. 保留现有 token
2. 重排章节
3. 抽出 CI/CDP 内容到 references
4. 补 checklist
验收：schema checklist PASS
```

## Common Pitfalls

1. **把 style 管理员当成发布管理员**
   - 错。发布归 `infocard-pub-publisher`。

2. **把一次性踩坑写进主 style spec**
   - 错。主 spec 应稳定；案例和 session note 放 references。

3. **只统一标题，不统一责任边界**
   - 错。schema 化不只是改章节名，还要清理越界内容。

4. **把 retheme adapter 当完整 theme spec**
   - 例如“绿色化”这类技能可能是转换层，不一定是完整主题。需要先判断类型。

- **graph-paper 专项检查**：审查 `infocard-graph-paper-style` 或 `theme/graph-paper.html` 时，不只看配色是否一致，还要对照主题预览确认：首屏是否 graph-first、hero graph 与章节图是否重复、是否有极淡网格纹理、是否保留工程注释感、是否退化成报告页。

8. **theme-gallery 发布只改 themes.html 不够**
   - 新增 `infocard-*-style` 时，源头必须是 `_themes.yaml`，然后用 `python3 scripts/rebuild_themes.py` 重建 `themes.html`。
   - 主题页验收看 `themes.html` + `theme/<slug>.html`，不要误等 `_index.yaml` / 首页搜索。
   - 如果本地已重建但线上主题页暂时没显示，先按 Pages 传播延迟处理，不要立刻把问题归因于主题定义失败；可参考 `infocard-pub-publisher/references/theme-gallery-visibility-and-push-lag.md`。
   - 主题创建与发布的完整检查清单见 `references/theme-gallery-theme-creation-publish.md`（位于 `infocard-pub-publisher`）。

10. **风格选择靠直觉而非内容分析** — 发布信息卡时，如果用户没有指定风格，必须先分析内容类型（代码架构？自动化工具？知识图谱？），再对照 `references/content-type-to-style-mapping.md` 选择，而不是凭视觉偏好随意选。见 2026-06-27 CoreCoder（graph-paper）和 MoneyPrinterTurbo（darkblue）的验证案例。

11. **grill-me 只问一个问题** — grill-me 对齐时每次只问一个关键问题，问完根据回答直接推进；不要一次性抛出多个问题堆在一起。见 2026-06-27 "两边 margin 澄清" grill-me 流程（用户发截图 → 问 A/B/C 三个方向 → 用户选 B → 修复 → 验证）。

12. **VLM 用于视觉分析时结论优先** — `mcp_minimax_understand_image` 返回的描述用于理解页面，不要当事实断言直接引用。视觉问题（多余留白、重叠等）的根因判断必须通过 browser_navigate 访问实际页面验证，不能只靠截图分析。

13. **过度治理阻断当前任务** — 管理员应给门禁和风险，不应在用户只要快速出卡时强行展开大规模重构。

13. **过度治理阻断当前任务** — 管理员应给门禁和风险，不应在用户只要快速出卡时强行展开大规模重构。
   - 管理员应给门禁和风险，不应在用户只要快速出卡时强行展开大规模重构。

7. **内容边框与外层边框贴死**
   - 不要用负外边距把顶部条、hero 条或装饰条硬撑到 shell 边框上。
   - 如果外壳与内部卡片边框看起来"合并成一条粗线"，优先怀疑 shell padding / section spacing，而不是先改颜色。
   - 修复优先级：先加大外层呼吸感，移除负 margin，再检查是否还有内部 border 与外框贴边。
   - 具体根因与修复案例见 `references/border-overlap-shell-vs-content.md`。

8. 对于“图像分层 / 可编辑 PSD / 背景移除 / 图层拆解”这类跨模型话题，先走 `ai-image-layer-workflows` 的方法地图，再决定具体主题与发布风格；不要把任务写成单一模型宣传页。
2. 主题重建工作流（facts.json 缺失、主题错配）：见 `references/theme-rebuild-workflow-20260712.md`。

3. 主题重命名 / 改名 / rebrand 的统一流程见 `references/theme-rebrand-and-rename-workflow.md`。
   - 这类工作先改 skill，再改 `_themes.yaml` / `themes.html` / `theme/{slug}.html` / 资产文件名，最后做全仓库旧名清零检查。
   - 新增主题时，优先把会话中提炼出的视觉校准、配色微调、验证结论放到该主题自己的 `references/` 里，而不是堆进主 SKILL.md；例如 `infocard-wood-style` 的 `references/wood-style-session-note.md`，`infocard-darkgreen-style` 的 `references/darkgreen-style-creation-note.md`。

- [ ] 已明确对象范围：style skill only / style + theme / full visual chain
- [ ] 已使用 Unified Style Skill Schema
- [ ] 已区分 style 规则与发布、metadata、mobile、any2card 规则
- [ ] 已标出缺失章节
- [ ] 已标出越界内容及建议归属
- [ ] 已给出 PASS / NEEDS NORMALIZATION / NEEDS SPLIT / FAIL 结论
- [ ] 如涉及写入，已获得用户明确授权
- [ ] 如涉及 theme 文件，已检查 skill 与 theme 的 token / slug / name 一致性

## Current Alignment Record

本技能根据用户 grill-me 对齐结果创建：

1. 角色边界：**全流程管理员** — 创建、审查、维护、合并、废弃 style skill，也能指导修改现有 style。
2. 管理范围：**style skill + theme 文件** — 同时约束 `theme/*.html`、`_themes.yaml`、主题预览页与 style skill 一致性。
3. 产出格式：**Schema 治理型** — 先给统一 Style Skill Schema，再按 schema 创建 / 审查 / 重构每个 style。
4. 冗余处理：**标记并建议归位** — 指出越界内容应该迁到 publisher / metadata / mobile / any2card / references，但不自动改。
5. 权威性：**门禁型** — style skill 创建 / 重构前必须过 schema checklist，否则标记为不合格。

## Live Registry

已注册主题（2026-06-27 更新）：

| slug | css_class | position | CSS Signature（主要色值） | skill |
|---|---|---|---|---|
| q-style | q | 1 | 暖白底 + 金/橙 accent | infocard-q-style |
| green-style | green | 2 | 翡翠绿 + 白底 | infocard-green-style |
| black-head-style | black | 3 | 黑色 hero 头 + 白纸正文 + 红主强调 | infocard-black-head-style |
| main-style | main | 4 | `#E60012`(红) + `#1A3A5C`(深蓝) + `#F2F2F2`(灰 body) + `#fff`(page) | *(无独立 skill，见 Anti-patterns; 2026-06-27 body bg 修复为 `#F2F2F2`) |
| blue-technical-manual-style | blue | 5 | 深蓝 `#0036a3` + 冷灰 + 等宽字体 | infocard-blue-technical-manual-style |
| darkblue-style | darkblue | 6 | 深蓝渐变 + 玻璃面板 + 图标化工作台 | infocard-darkblue-style |
| hardblue-style | hardblue | 7 | `#c8102e`(红) + `#0a0a0a`(黑) + `#0036a3`(蓝) + `#006b3c`(绿) + `#e8c200`(黄) | infocard-hardblue-style |
| redswiss-style | redswiss | 7 | `#c8102e`(红) + `#0a0a0a`(黑) + 暖米灰底；允许 `--blue/--green/--purple/--orange` 用于 badge pill，不得引入变量定义外的蓝/绿/橙/黄色 | infocard-redswiss-style |
| color-material-style | color-material | 8 | 暖底画布 + 深色核心面板 + 彩色节点 | infocard-color-material-style |
| wood-style | wood | 9 | 木纹棕 + 米白纸感 + 等宽字体 | infocard-wood-style |
| handline-style | handline | 10 | 手绘草图 + wired-elements 边框卡片 | infocard-handline-style |
| darkgreen-style | darkgreen | 11 | `#0d2b1a`(深绿) + `#1a3a2a` + `#00ff88`(终端绿) | infocard-darkgreen-style |
| graph-paper-style | graph-paper | 14 | 米白纸底 + 细黑灰线网格 + 等宽字体 + 节点连线 | infocard-graph-paper-style |
| pixelstack-style | pixelstack | 15 | 像素堆叠 + 金字塔方块 + 像素思考者小人 | infocard-pixelstack-style |
| scrapbook-style | scrapbook | 16 | 手账拼贴 + 胶带/贴纸装饰 | infocard-scrapbook-style |
| archive-green-style | archive-green | 17 | 瑞士档案绿 `#7c9a6a` + 米白底 | *(theme-only) |
| sage-swiss-style | sage-swiss | 18 | Sage Green `#8a9a7a` + 深墨绿 `#2d4a3e` | *(theme-only) |
| crayon-style | crayon | 18 | `#f0ead8`(米黄) + `#2a6fa8`(蓝) + `#2a8a6e`(绿) + `#7955ab`(紫) + `#d45c1a`(橙) | infocard-crayon-style |

### CSS Signature 查表法

当需要判断一张卡实际用了哪个主题时，从 HTML 提取 `:root` 块对照：

```bash
python3 -c "
import re
h=open('docs/<slug>.html').read()
m=re.search(r':root\s*\{([^}]+)\}',h,re.DOTALL)
if m: print(m.group(0)[:400])
"
```

| 主题 | CSS 签名 |
|------|---------|
| darkblue | `--bg:#070b18` 或 `#0c1020` + `--cyan:#58c3ff` + `--blue:#4a78ff` + 多色辅助 |
| redswiss | `--bg:#f5f2ec` + `--red:#c8102e` + `--ink:#0a0a0a`（暖白纸+纯红黑，无蓝黄绿） |
| hardblue | `--bg:#f6f4ef` + `--red:#d80018` + `--blue:#1f63ff` + `--soft-red:#fde9eb` + 42px 网格背景 |
| color-material | `--canvas:#f7f2e8` + `--purple:#6e3fd6` + `--green:#2e9b4b` + `--blue:#2e6be6` + `--orange:#f59e0b` |
| main-style | `--paper:#fffdf9` + `--red:#c8102e` + `--blue:#0036a3` + `--yellow:#e8c200` + `--green:#15803d` |
| darkgreen | `--bg:#0d2b1a` + `--green:#00ff88` |
| 其他 | 查 `theme/<name>.html` 的 `:root` 块 |

**历史教训（2026-07-11~12）：** 18 张卡中 langchain 用自定义蓝橙 CSS（标 hardblue），mengto CSS 是 main-style（标 redswiss）。本次修复 langchain（重建 hardblue）和 mengto（修正 meta）。剩余 3 张因 facts.json 缺失无法重建，保留原 darkblue。

**常见混淆：redswiss vs main-style**
- 有 `#1A3A5C` 或 `--blue:#0036a3` → **main-style**（main-style 允许深蓝辅助）
- 无蓝/黄/绿，纯红 `#c8102e` + 黑 `#0a0a0a` → **redswiss-style**

> 本规则来源于 2026-06-27 session：用户询问 `20260525-creai-metagpt-compare.html` 主题，错误判断为 redswiss，实为 main-style（CSS 含 `#1A3A5C` 深蓝）。
