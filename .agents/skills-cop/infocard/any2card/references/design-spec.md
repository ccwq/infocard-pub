# 信息卡设计规范

这份文档是信息卡生成的唯一视觉真相源。它的职责不是解释“为什么好看”，而是定义“怎样才算合格、怎样才算原创、怎样才算可读”。

## 1. 设计总则

### 设计目标
- 先把内容说清楚，再让它更有审美。
- 让卡片在手机上直接成立，不依赖用户二次解释。
- 让不同主题真正正交，而不是换色皮肤。
- 让最终输出看起来像独立设计系统，而不是模板集合。

### 交互前置
- 先分析内容，再给出 1 个主推荐 + 2 个备选。
- 先判断画布比例：`auto`、`portrait`、`square`、`landscape`。
- 风格建议必须说明适用场景、核心气质和取舍。
- 先让用户确认特殊要求，再进入 HTML 生成。
- 当内容和场景足够明确时，可以直接推荐默认最优主题，但仍要先说明理由。
- 提问只问会改变结果的事，最多 3 个问题。

### 决策映射

| 内容类型 | 默认比例 | 主推荐 | 备选 | 关键确认点 |
|---|---|---|---|---|
| 长文 / 观点 | `portrait` | 纸感书页 | 文化档案、杂志封面 | 耐读还是传播 |
| 数据 / 对比 | `portrait` | 技术简报 | 档案卡片、文档扫描 | 结论还是清单 |
| 流程 / 规范 | `portrait` | 文档扫描 | 技术简报、档案卡片 | 严谨度 |
| 技术手册 / Agent / API / CLI / 架构说明 | `portrait` | 技术手册红黑 | 瑞士红黑、技术简报 | 是否需要代码块/权限矩阵/操作流程 |
| 强观点 / 品牌 | `square` | Noir Poster | Luxury Studio、杂志封面 | 克制还是张力 |
| 社交传播 / 热点 | `square` | Social Slice | Data Poster、Collage Board | 平台与传播强度 |
| 拼贴 / 多观点 | `square` | Collage Board | Social Slice、文化档案 | 结构感还是活跃感 |
| 不明确 | `auto` | 纸感书页 | Social Slice、文档扫描 | 先读懂还是先传播 |

### 画布比例规则
- `portrait`：高密度、阅读型、复杂结构优先。
- `square`：中低密度、传播型、一屏更完整优先。
- `landscape`：低密度、单一结论、摘要展示优先。
- `auto`：根据内容密度、平台和阅读目标自动决定。
- 不要把 `iPad Pro`、`iPad mini` 这类设备名作为正式产品语言。
- 比例选择目标是减少滚动债务，而不是增加尺寸玩具。

### 不可变规则
1. 内容必须忠实原文，不得编造。
2. 任何视觉装饰都不能损害可读性。
3. 卡片必须能被浏览器直接打开。
4. 卡片必须内置保存 PNG 按钮。
5. 高密度内容默认优先单栏，避免挤压。
6. 主题之间必须改变结构、节奏和气质，不能只改颜色。

## 2. 字体系统

本项目只使用本地字体文件，避免远程字体在截图时失效。

### 字体来源
- `TsangerJinKai02-W04.ttf`
- `NotoSerifSC-Regular.ttf`

### 字体分工

| 场景 | 字体 | 作用 |
|---|---|---|
| 主标题 | TsangerJinKai | 核心视觉锚点 |
| 条目标题 | TsangerJinKai | 章节标题、要点标题 |
| 正文 | NotoSerifSC 或 TsangerJinKai | 长文本阅读 |
| 标签 / 编号 / 来源 | 系统无衬线 | 结构标识、轻量信息 |
| 数字展示 | 系统无衬线或 Mono | 强调数据感 |

### 字体加载写法

```html
<style>
@font-face {
  font-family: 'TsangerJinKai';
  src: url('file://<skill-install-dir>/assets/TsangerJinKai02-W04.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}
@font-face {
  font-family: 'NotoSerifSC';
  src: url('file://<skill-install-dir>/assets/NotoSerifSC-Regular.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: block;
}
</style>
```

## 3. 基础排版

### 字号标准（600px 基础宽度）

| 层级 | 建议值 | 说明 |
|---|---|---|
| 主标题 | 52-64px | 视觉主角，必须有存在感 |
| 条目标题 | 24-32px | 结构锚点，必须清晰可扫读 |
| 正文 | 18-20px | 手机可读底线 |
| 金句 / 副标题 | 20-22px | 比正文略强，承担承上启下 |
| 标签 / 来源 | 14-16px | 结构标识，不抢正文 |
| 页脚 | 14-15px | 最小可读信息 |

### 排版原则
- 标题要有结论感，不要像文章目录。
- 正文字数越多，结构越单栏、越克制。
- 标签只负责标识，不负责装饰。
- 数字要单独被识别出来，尤其是统计、对比、等级和时间。
- 行高优先服务阅读，不优先服务“松弛感”。
- 比例越宽，信息量越要克制，避免横版里塞进长文。

## 4. 基础色板

### 中性底板

| 名称 | 色值 | 用途 |
|---|---|---|
| Parchment | `#f5f3ed` | 经典纸感底色 |
| Ivory | `#faf9f5` | 更亮的卡面 |
| Warm White | `#f6f5f4` | 编辑型主题的柔和底 |
| Near Black | `#141413` | 深色卡片主底 |
| Charcoal | `#30302e` | 边框、深色分层 |

### 文字色

| 名称 | 色值 | 用途 |
|---|---|---|
| Main Text | `#1a1a1a` | 主正文 |
| Secondary Text | `#555555` | 补充说明 |
| Muted Text | `#777777` | 页脚、出处、标签 |
| Light Text | `#eaeaea` | 深色卡片正文 |

### 主题色建议

| 主题方向 | Accent | 适用场景 |
|---|---|---|
| 编辑 / 纸感 | `#2c3e8c` / `#8b6914` | 知识、观点、方法论 |
| 精准 / 工具 | `#1f6c9f` / `#3c7850` | 数据、流程、规范 |
| 电影 / 戏剧 | `#7a3b1e` / `#8b1a2a` | 强结论、故事、品牌 |
| 表达 / 传播 | `#5b2d8e` / `#c0392b` | 社交卡、拼贴、热点 |

### 配色原则
- 一个主题只保留一个主 accent。
- accent 的作用是建立秩序和焦点，不是到处撒。
- 不要用高饱和霓虹色做默认方案。
- 深色卡片必须提前校准对比度，不能靠 opacity 混过去。
- 同一张卡中不要混太多冷暖灰。

## 5. 主题家族

### 家族一：编辑型
关键词：阅读、温度、秩序、纸感。

适合：
- 长文摘要
- 观点文章
- 方法论拆解
- 复盘和思考

审美特征：
- 留白多
- 结构轻
- 标题像书页标题
- 辅助装饰少

### 家族二：精准型
关键词：工具、结构、数字、效率。

适合：
- 流程
- 对比
- 数据简报
- 规范和清单

审美特征：
- 结构严谨
- 数字明显
- 版式紧凑但不拥挤
- 信息层次非常明确

### 家族三：电影型
关键词：张力、场景、对比、戏剧性。

适合：
- 强观点
- 品牌表达
- 争议话题
- 叙事型内容

审美特征：
- 明暗对比强
- 大留白或大压迫感
- 视觉焦点明确
- 更像海报而不是文稿

### 家族四：表达型
关键词：传播、拼贴、节奏、社交感。

适合：
- 小红书 / X / 朋友圈转发
- 话题拆解
- 多观点集合
- 事件速览

审美特征：
- Hook 强
- 模块分明
- 节奏变化明显
- 允许更活泼，但不能乱

## 6. 主题矩阵

|| 主题 | 家族 | 背景 | 核心气质 | 构图骨架 ||
|---|---|---|---|---|---|
| 纸感书页 | 编辑型 | Warm White | 安静、像文章 | 单栏、少装饰 ||
| 杂志封面 | 编辑型 | Parchment | 精致、可传播 | 大标题 + 摘录 + 页脚 ||
| 文化档案 | 编辑型 | Ivory | 学术、稳重 | 分块、注释、引用层次 ||
| 文档扫描 | 精准型 | White / Warm White | 工具化、清晰 | 标题层级 + 列表 ||
| 技术简报 | 精准型 | White | 高效、结论先行 | 数字主导、左右分区 ||
| 档案卡片 | 精准型 | Ivory | 可追溯、事实感 | 编号 + 条目 ||
| Noir Poster | 电影型 | Near Black | 冷、强、戏剧性 | 暗底 + 强对比 ||
| Luxury Studio | 电影型 | Warm White | 高级、场景感 | 大图感 + 少字 ||
| 工业镜框 | 电影型 | Charcoal / White | 精密、技术感 | 框线 + 网格 ||
| Social Slice | 表达型 | White | 直给、利于转发 | 强 Hook + 3-5 信息点 ||
| Collage Board | 表达型 | Ivory | 活跃、拼贴感 | 多模块、节奏变化 ||
| Data Poster | 表达型 | Warm White | 数字驱动 | 数字大、图形辅助 ||
| **瑞士红黑** | 精准型 | White | 瑞士视觉冲击力、any2card 排版 | 红黑块状标题 + 硬边框网格 ||
| **技术手册红黑** | 精准型 | Black shell + Warm White content | 高密度技术手册、架构压缩页、实施指南 | 红色 header + stats 条 + section 线 + 表格/代码/流程组件 ||

### 瑞士红黑（Swiss Red）主题参数

**定位**：any2card 的字体大小/间距/页面宽度 + infocard 的红黑视觉冲击力。适合需要视觉冲击但不失可读性的信息卡。

**继承关系**（重要）：

| 继承自 | 元素 |
|------|------|
| any2card | 字体大小（52-64px 标题 / 18-20px 正文 / 14-16px 标签）、页面宽度（780px max-width）、rem 间距系统（`.75rem` gap / `.95rem` padding）、行高比例 |
| infocard | 配色（`#e60012` 红 + `#000` 黑）、字体字重/字间距风格（标题负 letter-spacing、大写标签）、边框线条（2-3px solid #000 硬边框）、红色分隔条 |

**CSS 变量定义**：

```css
:root {
  --bg: #eef2f8;           /* from any2card */
  --card: #ffffff;
  --ink: #0f172a;
  --muted: #5b6475;
  --line: #d9e1ee;
  --soft: #f8f8f8;
  --red: #e60012;          /* from infocard */
  --black: #000000;         /* from infocard */
  --shadow: none;          /* no shadow, Swiss style */
}
/* Font sizes: from any2card (52-64px title, 18-20px body, 14-16px label, etc.) */
/* Spacing: from any2card (.75rem gap, .95rem padding) */
/* Width: from any2card (780px max-width, responsive) */
```

**核心视觉特征**（来自 infocard）：

| 元素 | any2card 原值 | 瑞士红黑（替换为） |
|------|--------------|------------------|
| Accent 色 | `#2457d6` 蓝 | `#e60012` 红 |
| 边框 | `1px solid rgba(...)` 细边框 + 圆角 | `2-3px solid #000` **硬边框**，无圆角 |
| 标题背景 | 渐变浅蓝 | `#000` 黑底白字 或 `#e60012` 红竖条 |
| 分隔线 | 无 | `border-bottom: 2px solid #e60012` |
| 区块标题 | `#2457d6` 蓝色文字 | `#e60012` 红色 + `::before` 红色竖条 + 大写 |
| 统计卡 | 细边框 | `border: 2px solid #000` 粗边框 |
| 标签 | 圆角 pill | 方形标签或全大写无衬线 |
| 按钮 | 蓝色渐变圆角 | 红色渐变 `linear-gradient(135deg, #e60012, #b3000f)` |

**字体排版规则**（来自 any2card，保持不变）：

- 主标题：52-64px，字重 900，letter-spacing -0.04em
- 条目标题：24-32px，字重 800，letter-spacing 0.04em，大写
- 正文：18-20px，字重 400-500，行高 1.55
- 标签/来源：14-16px，字重 800，全大写
- 页脚：14-15px，字重 400

**布局规则**（来自 any2card，保持不变）：

- 页面最大宽度：`780px`（手机优先）
- 移动端：`calc(100vw - 1.4rem)` padding
- 桌面端：`1.2rem` padding
- 模块间距：`.75rem`（来自 any2card）
- 正文间距：`.88rem` 表文字号，`.95rem` 正文字号（来自 any2card）

**HTML 结构示例**：

```html
<!-- 标题区：黑底白字（来自 infocard） -->
<div class="banner">
  <h1>主标题（any2card 字号 52-64px，字重 900）</h1>
  <div class="sub">副标题（any2card 字间距）</div>
</div>
<div class="bar"></div>  <!-- 红色分隔线（来自 infocard） -->

<!-- 内容区：硬边框卡片（来自 infocard）+ any2card 间距 -->
<div class="grid">
  <div class="sec">
    <div class="h">模块标题（any2card .88rem，字重 900，大写红色）</div>
    <div class="stats">
      <div class="stat">
        <div class="num">123</div>
        <div class="lab">标签</div>
      </div>
    </div>
  </div>
</div>

<!-- 底部：灰色区块（来自 infocard） -->
<div class="footer">来源 · 日期</div>
```

**生成规则**：

- 标题区：黑底白字 banner 或红条大写标题（来自 infocard）
- 分隔线：每个模块前加 `2px solid #e60012` 红色分隔条
- 卡片边框：`2-3px solid #000`，无圆角（来自 infocard）
- Accent 色：`#e60012` 用于标签背景、时间线日期、强调文字（来自 infocard）
- **保持 any2card 的字号系统**：标题 52-64px / 正文 18-20px / 标签 14-16px
- **保持 any2card 的间距**：`.75rem` gap / `.95rem` 正文字号
- **保持 any2card 的页面宽度**：780px max-width + 响应式逻辑
- 按钮：红色渐变 `linear-gradient(135deg, #e60012, #b3000f)`

**触发条件**：用户说"红黑瑞士风"、"瑞士设计"、"有冲击力的信息卡"、"类似之前那张 infocard"、"红黑风"时，默认使用此主题。

### 技术手册红黑（Tech Manual Swiss Red）主题参数

**Golden sample**：`https://ccwq.github.io/infocard-pub/docs/20260529-claude-subagents.html`。当用户说“Claude Sub-Agents 那张”“所有信息卡里最优秀的版本”“响应式、间距、文字大小、布局、配色、元素类型、内容都优秀的版本”时，默认使用本主题作为新基准。

**定位**：面向技术实施手册、Agent/Skill/API/CLI 说明、系统架构、工具矩阵、权限模型、操作流程。它不是普通红黑海报，而是“高密度技术手册压缩页”。

**优先级**：移动端响应式不崩 → 高信息密度 → 字号清晰 → 视觉一致性 → 内容完整性。

**核心视觉 DNA**：

| 元素 | 规则 |
|---|---|
| 外壳 | 黑色页面背景 + 780px 上限 + `.card` 红色 3px 边框 |
| 主色 | `--red:#c8102e`、`--black:#0a0a0a`、`--white:#f5f2ec` |
| 语义色 | 蓝 `#0036a3` 表系统/配置，绿 `#006b3c` 表读取/低风险，黄 `#e8c200` 表注意 |
| 头部 | 红色渐变 `.header`，桌面三栏 `1.15fr 1.4fr .8fr`，含 kicker、h1、sub、meta、REV |
| 统计 | `.stats` 四列数字锚点，移动端 2×2 |
| 正文 | `.section` 12px/14px 紧 padding，`.sec-title` 编号 + 红线 + small 标签 |
| 组件 | `.lead` 黑底定义块、`.grid2/.grid3`、`.box`、`.kv`、`.badge`、`.arch`、`.code`、`.table`、`.list`、`.flow`、`.footer` |
| 响应式 | `@media (max-width:760px)` 下 header 单列，grid/children/footer/flow 全部单列，禁止横向溢出 |

**关键 CSS 数值**：

```css
body{background:var(--black);width:min(780px,100vw);margin:0 auto;overflow-x:hidden}
.card{width:100%;max-width:100vw;border:3px solid var(--red);background:var(--white)}
.header{display:grid;grid-template-columns:1.15fr 1.4fr .8fr;gap:10px;padding:16px 16px 12px;background:linear-gradient(180deg,var(--red),#a90f27)}
.stats{display:grid;grid-template-columns:repeat(4,1fr);background:#121212;border-top:2px solid var(--red)}
.section{padding:12px 14px;border-bottom:1px solid #e6e0d8}
.grid2{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.box{border:1px solid var(--gray-5);background:#f0ede6;padding:10px}
.code{background:#171717;color:#c7f1c7;font-family:'IBM Plex Mono',monospace;font-size:8.5px;line-height:1.55;padding:10px 11px;overflow-x:auto;border:1px solid #222}
@media (max-width:760px){body{width:100vw}.header{grid-template-columns:1fr}.meta{text-align:left}.stats{grid-template-columns:repeat(2,1fr)}.grid2,.grid3,.children,.footer,.flow{grid-template-columns:1fr}}
```

**默认内容结构**：Header → Stats → Warning → 01 核心定义 → 02 架构/格式 → 03 创建步骤/操作流程 → 04 映射关系 → 05 模型/权限/成本矩阵 → 06 编排模式/最佳实践 → Footer。

**完整组件库与 HTML 骨架**：见 `references/claude-subagents-golden-system.md`。

**验收硬指标**：
- 390px：`document.documentElement.scrollWidth <= 390`，header 单列、stats 2×2、所有 grid 单列。
- 780px：header 三栏、stats 四列、grid2 两列、grid3 三列，无横向溢出。
- 必须包含 viewport、html2canvas 保存按钮、`.card` 红框、`.stats`、`.warn`、`.section`、`.sec-title`、`.footer`。

### 主题参数表

每个主题都必须明确这些参数，不能只给名字：

| 参数 | 说明 |
|---|---|
| 背景 | 卡片底色与环境温度 |
| Accent | 唯一主强调色 |
| 字体关系 | 标题、正文、标签的字体分工 |
| 构图骨架 | 单栏、分区、压迫感、留白方式 |
| 装饰预算 | 允许多少线条、块面、引用块 |
| 密度策略 | 面向低密度、中密度还是高密度内容 |
| 页脚策略 | 是否显示编号、来源、日期、品牌痕迹 |

### 主题切换规则
- 不允许主题只变 accent。
- 不允许主题只变背景。
- 不允许不同主题共享同一种骨架再假装有差异。
- 如果同一内容在两个主题里看起来只是“同模板不同皮肤”，则主题设计不合格。

## 7. 卡片密度与模板

### 密度判断

| 密度 | 内容量 | 模板 |
|---|---|---|
| 低密度 | 1 个核心观点 | 大字符主义 |
| 中密度 | 2-4 个要点 | 标准单栏 |
| 高密度 | 5+ 个要点 | 单栏列表 |
| 高密度且桌面展示 | 5+ 个要点 | 多栏网格，仅在明确要求时使用 |

### 模板 A：大字符主义
适用于单一观点、金句、极少要点。

结构：
- 顶部可选标签
- 中央大标题
- 底部补充说明
- 最后是来源

特征：
- 标题占据视觉主导
- 正文尽量少
- 非常适合短结论

### 模板 B：标准单栏
适用于 2-4 个要点的摘要内容。

结构：
- 标题
- 一条分隔线或短 accent
- 要点段落
- 引用块
- 页脚

特征：
- 更像精修过的摘要页
- 信息层次清晰
- 适合公众号、笔记和文章摘要

### 模板 C：多栏网格
只在桌面展示或用户明确要求时使用。

结构：
- 左右分区或二栏/三栏网格
- 每栏负责一个局部主题

特征：
- 适合复杂信息
- 不适合手机默认展示
- 必须谨慎控制每栏字数

### 模板 D：单栏列表
高密度内容的默认模板。

结构：
- 标题
- 分隔线
- 单列要点列表
- 可选引用块
- 页脚

特征：
- 手机最稳
- 适合 5+ 要点
- 依靠留白和分组，而不是多栏挤压

## 8. 视觉组件

### 标题
- 标题必须结论化。
- 不能只是背景陈述。
- 不能空泛。

### 分隔线
- 分隔线要少而准。
- 优先使用短 accent 或全宽分隔，不要线条泛滥。

### 引用块
- 引用块用来承接金句，不是装饰。
- 视觉上必须弱于主标题，强于普通正文。

### 编号和标签
- 编号用来建立序列感。
- 标签用来建立分类感。
- 不要让标签抢主信息。

### 数字
- 数据型主题中，数字必须成为视觉锚点。
- 数字比文字更大、更稳、更直观。

## 9. 图表规则

### 什么时候加图

| 条件 | 建议 |
|---|---|
| 有因果链 | 用 Mermaid 流程图 |
| 有步骤流程 | 用 Mermaid 流程图 |
| 有概念关系 | 用 Mermaid 关系图 |
| 纯观点 / 纯列表 | 不加图 |
| 更适合具象表达 | 用内联 SVG |

### 图表位置
- 放在标题和副标题下方。
- 放在要点列表上方。
- 图的职责是概览，不是抢戏。

### Mermaid 约束
- 只用固定 hex。
- 不用 CSS 变量直接喂给 Mermaid。
- 节点文字要短。
- 深色卡片和浅色卡片要分别校准配色。

## 10. 响应式规则

### 600px 默认宽度
这是默认手机优先方案。适合大多数社交平台和聊天窗口截图。

### 800px 桌面方案
当用户明确说桌面、博客、PPT、iPad、宽一点时，切到 800px。

### 移动端底线
- 正文不低于 18px。
- 标签不低于 14px。
- 不要为了紧凑把正文压得太小。
- 多栏布局必须在移动端折叠为单栏。

## 11. 保存按钮与导出

每张卡都必须内置保存 PNG 按钮，按钮放在卡片外部，不要被截图进去。

### 一键保存按钮（统一固定规范）

- 统一锚点：桌面右下角、移动端右下角
- 统一视觉：红色渐变、白字、8px 圆角、12/18 padding、Mono 字体、轻阴影
- 统一层级：`z-index: 999`
- 统一回退：移动端只允许右下角 10px 微调，不允许改为底部居中或卡片内部

```html
<button id="save-btn" class="save-btn" onclick="saveCard()">保存 PNG</button>
```

```css
.save-btn{
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 999;
  background: linear-gradient(135deg, #c8102e, #b3000f);
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px 18px;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .06em;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0,0,0,.18);
}
@media (max-width: 760px){
  .save-btn{ right: 10px; bottom: 10px; font-size: 11px; padding: 10px 14px; }
}
```

### 保存逻辑
- 使用 `html2canvas`。
- 截图前隐藏保存按钮。
- 保存完成后恢复按钮。
- 文件名要与内容关键词相关。

## 12. 代码结构建议

生成 HTML 时建议保持以下结构：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=600">
  <style>
    /* 字体、变量、基础卡片、主题色 */
  </style>
</head>
<body>
  <div class="card">
    <!-- 主题内容 -->
  </div>
  <!-- 保存按钮 -->
</body>
</html>
```

## 13. 质量检查

### 生成前检查
- 内容是否忠实原文。
- 标题是否是结论。
- 是否已经判断密度。
- 是否应该加图。
- 是否需要切换到更适合的主题家族。

### 生成后检查
- 手机上是否可读。
- 主题之间是否真的不同。
- 卡片是否像独立设计系统。
- 是否还有 fork 痕迹。
- 是否有过度装饰。

## 14. 设计判断优先级

当规则冲突时，按这个顺序决策：

1. 内容忠实
2. 可读性
3. 结构清晰
4. 主题辨识度
5. 审美完成度
6. 装饰细节

如果一项视觉选择会伤害前四项中的任意一项，就不要做。
