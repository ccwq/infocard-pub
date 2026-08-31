---
name: infocard-pixelstack-style
description: 像素堆叠主题信息卡 — 复古手作 + 思考感像素插画风。骨架三件套（金字塔堆叠方块 + 像素思考者小人 + 消散箭头与金句）必须保留为视觉锚点，承载方法论层级、AI 工作流梯度、工程演进与反直觉金句驱动类内容。模板位于 `theme/pixelstack.html`。
version: 1.0.0
author: Hermes Agent + ccwq
license: MIT
metadata:
  hermes:
    tags: [infocard, style, pixel, retro, theme, methodology, hierarchy, thinker, fade-arrow]
    related_skills: [any2card, infocard-style-man-skill, infocard-pub-publisher]
---

# infocard-pixelstack-style

## Overview

`infocard-pixelstack-style` 是一套**像素插画通用风**信息卡主题：复古手作气质 + 现代中文排版。

它的核心不是"层级金字塔"这个语义，而是**三件套视觉骨架**：金字塔堆叠方块 + 像素思考者小人 + 左侧消散箭头与金句。任何能套进这套骨架的主题都可以用 pixelstack。

## Use Cases

### 适合
- AI 工作流梯度（提示词 → 上下文 → 缰绳 → 循环）
- 方法论层级拆解（任意 N 层金字塔结构）
- 工程演进、抽象阶梯、能力栈
- 反直觉金句驱动的观点卡（左侧箭头 + 金句是核心修辞）
- 复古手作 + 思考感的科技/方法论内容

### 不适合
- 法律、财务、合规等严肃正式内容
- 纯数据密集报表、表格驱动的页面
- 工业冷感、极简科技海报
- 需要实景照片或大图视觉冲击的发布页
- 没有明确层级关系或没有金句的散文式内容

### 典型触发词
- 像素 / pixel / 复古 / retro
- 金字塔 / 堆叠 / 阶梯 / 层级
- 思考者 / thinker / 沉思
- 工程 / 方法论 / 抽象层 / 能力栈
- 反直觉金句 / 一句话总结

### 经验证的落地案例
- **Cookbook / 方法论手册**：`20260702-planning-with-files-cookbook.html`（Planning with Files 完整手册，6 层内容：3 文件结构 + 5 钩子 + 5 规则 + v3 模态 + IDE 支持 + Benchmark）。方法论 + 命令参考 + 表格型内容用 pixelstack 表现良好。
- **演进路线图**：多层版本变迁（v1→v2→v3）配合金字塔层级表达版本递进。
- **工程能力栈**：抽象层从底层到顶层用金字塔递减宽度自然表达。

## Design DNA

### 核心气质
- 米纸底 + 像素硬边方块 + 现代中文混搭
- 像素是骨架，文字是说明；不靠像素字体堆复古感
- 视觉中心永远是金字塔三件套，文字栅格围绕它展开
- 强调"反直觉金句"作为左侧箭头终点
- 风格关键词：retro pixel / hand-crafted / methodology stack / thinker

### 三件套骨架（**强制**）
每张 pixelstack 卡都必须有：

1. **金字塔堆叠方块**（≥3 层，推荐 4 层）
   - 自下而上递减宽度，模拟金字塔
   - 颜色梯度：底层最淡（浅蓝/象牙），顶层最强（橙色 + 白字）
   - 每层都是像素硬边方块（3px 描边 + 4px 阴影）
   - 文字是中文层级名（短，4–6 字）

2. **像素思考者小人**
   - 位于金字塔顶层正上方，CSS box-shadow 拼像素或 SVG 像素图
   - 棕发 + 深蓝西装 + 思考姿态（手抬至下巴）
   - 不强求精确像素人形，能识别为"在顶端思考的人"即可

3. **消散箭头 + 金句**
   - 左侧垂直向上的像素箭头
   - 顶部实心箭头头部，箭杆从上到下逐渐稀疏（间距递增）
   - 箭头右侧紧挨一行**反直觉金句**（深蓝主体 + 橙色强调词）
   - 金句必须短，2 行以内，承载主张

### 视觉原则
1. 像素硬边是核心语言，禁止用圆角、阴影柔化把像素感抹掉
2. 文字保持高清抗锯齿（现代中文字体），**不强制使用像素字体**
3. 主背景永远是米纸底（`#FFF5E6` ~ `#FBF1DA`），不要改深色或纯白
4. 橙色只用于顶层方块、金句强调词、强结论标签，不做大面积底色
5. 深咖描边（`#2D1B00`）是骨架线，所有结构性边框必须 ≥ 这个深度
6. 像素小人和消散箭头是仪式感符号，每张卡都得保留，不能换成 emoji 或 SVG icon
7. 金字塔层数 3–5 层之间，过多会破坏像素阶梯节奏
8. 文字层和像素层在同一张卡里要泾渭分明：像素归像素，正文归正文，不要把正文也做成像素字

## Color Tokens

```css
:root{
  --bg:#FFF5E6;            /* 米纸底 */
  --paper:#FBF1DA;         /* 卡片纸 */
  --ink:#2D1B00;           /* 主深咖描边/主文字 */
  --ink-soft:#3a2a14;      /* 次级文字 */
  --muted:#7a6747;         /* 辅助灰 */
  --line:#2D1B00;          /* 骨架线 */

  --orange:#E65100;        /* 顶层强调橙 */
  --orange-soft:#FFB066;
  --blue-mid:#81D4FA;      /* 中蓝（金字塔第三层） */
  --blue-pale:#B3E5FC;     /* 浅蓝（金字塔底层） */
  --blue-deep:#1E5CB5;     /* 深蓝（小人/箭头主色） */
  --paper-tile:#FAF9F6;    /* 第二层象牙 */
  --note:#FFE9C9;          /* 便签底 */
}
```

### 使用规则
- **底层方块**：`--blue-pale` 浅蓝
- **第二层方块**：`--paper-tile` 象牙
- **第三层方块**：`--blue-mid` 中蓝
- **顶层方块**：`--orange` 橙 + 白字 + 深红文字阴影
- **像素小人**：棕发 + `--blue-deep` 西装 + 肤色 `#f3c7a1`
- **消散箭头**：纯 `--blue-deep`
- **金句**：主体 `--blue-deep`，强调词 `--orange`
- **批注便签**：`--note` 底 + `--orange` 关键词高亮

## Layout

### 标准结构（自上而下）
1. **topbar**：主题名 + 版本 + 三色像素点
2. **hero**：左侧 stage（三件套）+ 右侧标题/导语/标签栏
3. **layers**：4 列 / 2×2 移动端，对应金字塔每一层的展开说明
4. **note**：sticky note 风批注块（橙色关键词强调）
5. **footer**：主题名 + 色 token 速记

### Density rule
- 不要把 source-rich 内容硬压成 4 块浅总结。若材料本身结构足够，默认扩到 **6–8 块**。
- 6–8 块时优先覆盖：what it is / how it works / key facts / ecosystem / scale / boundary / trade-off / QA。
- 如果卡片读起来还是空，通常是结构不够，而不是只需润色标题。

### Hero 内 stage 比例
- 桌面端：左 380px stage + 右侧 1fr 标题区
- 移动端：上 stage + 下标题区（stage 始终在前，承担首屏视觉）
- stage 内部：金字塔居中底部，思考者顶上方，箭头+金句固定左侧
- **移动端 topbar 安全规则**：当顶部三色像素点和标题文字发生挤压/遮挡时，不要只靠缩小字号或减字间距；优先把 topbar 改成**纵向两行**，第一行用 `max-content + 1fr` 的两列结构容纳像素点和标题文本，必要时再把版本/年份单独放第二行并右对齐。顶栏的“装饰点”可以占用自己的安全列，不能压到首字母。
- **固化优先级**：用户说“需要固化”时，先改 `theme/pixelstack.html` 作为 source of truth，再同步补丁到受影响的具体卡；不要只修单页 HTML。
- 每次修改 topbar / arrow-quote / stage 的移动端布局后，都要重新抓取**新**的 390px 截图验证，不能沿用旧截图或旧 target。

### Field-tested hardening patterns

- **压缩 / 召回类卡片要并列表达**：如果主题本身是“压缩器”“召回器”或“压缩 + 检索”工具，不要让主标题只说压缩、把召回降级成附属功能。优先用“压缩与召回”并列命名，或在 hero 下方加一个 2 列 proof strip，把 `compress` / `recall` 同时摆出来。
- **数量型 badges 只讲一边时，另一边要给视觉锚点**：如果 hero badge 已经强化了压缩率，下面的 metrics / compare / callout 必须补一个 recall path、无损召回、跨压缩可搜之类的对照项，不要重复堆压缩率。
- **推荐的 pixelstack 证据链**：hero subtitle → hero meta chips → 2 列 proof strip（compress / recall）→ metrics card 或 compare table → layers / commands。这样既保留像素感，也能把方法论讲完整。
- **移动端验收要看 390px 首屏**：pixelstack 改动后优先看 390px 截图，重点检查 topbar、hero title、pyramid 三件套、第一组指标和 recall 强调是否同时成立。若需要做最终视觉判定，优先用 headless Chrome 截图配合图像理解工具，而不是只看 DOM。

### Support files
- `references/dense-content-and-mobile-quote-safe-area.md`：高密度内容与移动端金句安全区规则。
- `references/mobile-topbar-safe-area-and-solidification.md`：topbar 纵向两行、装饰点安全列、以及模板级固化规则。
- `references/mobile-arrow-quote-safe-area.md`：更具体的 pixelstack 移动端 quote/arrow 安全区修复记录（Zvec 案例）。
- `references/pixelstack-pix-class-and-stage-structure.md`：**`.pix` 类应用规则**（哪些元素加 .pix、哪些不加）、stage pseudo-elements 详解、pyramid block 结构、金字塔配色参考。来源：gsap-skills 重建案例（2026-06-20）。

## Skeleton（精简骨架，可直接套）

> ⚠️ **重要修正（2026-06-20）**：`.hero` 元素本身**不加** `.pix` 类。`.hero` 自有 `border:3px solid var(--line); box-shadow:4px 4px 0 0 var(--line)`。`.pix` 类只贴在 `topbar`、每个 `article.layer` 和 `footer` 上。`.stage` 也不加 `.pix`，它的视觉特征靠 `::before`（沙地网格）+ `::after`（底部沙点）建立。详见 `references/pixelstack-pix-class-and-stage-structure.md`。

```html
<!-- topbar: .pix 直接加在 topbar 上 -->
<div class="topbar">
  <div class="topbar-line">
    <span class="pixel-dot"></span>
    <span class="topbar-title">repo / name</span>
  </div>
  <div class="topbar-date">MIT · STYLE · 2024</div>
</div>

<!-- hero: 自身有 border，不加 .pix -->
<section class="hero">
  <!-- stage: 三件套核心，::before 沙地 + ::after 沙点 -->
  <div class="stage">
    <div class="arrow"></div>
    <div class="arrow-quote">金句上半句，<br><em>金句下半句</em>。</div>
    <div class="character" aria-hidden="true"></div>
    <div class="pyramid">
      <div class="block l4"><span class="corner"></span>顶层名</div>
      <div class="block l3"><span class="corner"></span><div class="slice-grid"><i></i><i></i><i></i><i></i><i></i></div>第三层</div>
      <div class="block l2"><span class="corner"></span>第二层</div>
      <div class="block l1"><span class="corner"></span>底层名</div>
    </div>
  </div>
  <!-- hero-right: 标题区 -->
  <div class="hero-right">
    <h1 class="hero-title">卡片主标题</h1>
    <p class="hero-lead">导语 / 主张 / 一句话定位</p>
    <div class="hero-meta"><span>tag1</span><span>tag2</span><span>tag3</span></div>
    <div class="recall-strip">
      <article><span class="k">模块</span><b>结论A</b><p>说明</p></article>
      <article><span class="k">特性</span><b>结论B</b><p>说明</p></article>
    </div>
  </div>
</section>

<!-- layers: 每个 article 加 .pix -->
<section class="layers">
  <article class="layer l1"><span class="lvl">L1 · 模块</span><h3>标题</h3><p>正文</p><div class="skills"><span>tag</span></div></article>
  <article class="layer l2"><span class="lvl">L2 · 模块</span><h3>标题</h3><p>正文</p></article>
  <article class="layer l3"><span class="lvl">L3 · 模块</span><h3>标题</h3><p>正文</p></article>
  <article class="layer l4"><span class="lvl">L4 · 模块</span><h3>标题</h3><p>正文</p></article>
</section>

<!-- sticky note -->
<div class="note"><b>关键词</b> 说明正文</div>

<!-- footer: 加 .pix -->
<div class="footer">theme · <code>infocard-pixelstack-style</code></div>
```

完整 CSS 在 `infocard-pub/theme/pixelstack.html`，复制其中 `<style>` 块即可。详见 `references/pixelstack-pix-class-and-stage-structure.md`。

### 移动端

- `<720px`：消散箭头隐藏（`display:none`），保留金字塔 + 思考者 + 金句独立成段
- 金字塔每层宽度按比例缩小（最底层 220px → 最顶层 120px）
- layers 改单列堆叠
- 如果英雄区左侧仍保留引语/注释，先缩短文案，再给足左右安全边距；优先用 `left/right + max-width:none + 轻微缩小字号`，不要靠固定 `max-width` 硬撑。见 `references/mobile-arrow-quote-safe-area.md`
- **顶部安全区优先级**：当 quote 贴近 stage 顶边或与角色/顶层方块产生拥挤感时，先加 `.stage` 的 `padding-top`，再微调 `.arrow-quote top`；不要只移动 quote 而忽略 stage 内边距。

## 使用边界（强制）

- **强制保留三件套**：缺任一件不算 pixelstack
- **不要改色温**：米纸底 + 深咖描边是身份识别核心，禁止改深色 / 纯白 / 高饱和
- **不要换成像素字体**：现代中文是默认，纯像素中文字体破坏可读性
- **不要把方块改圆角或加柔化阴影**：像素硬边是核心语言
- **金句必须存在**：左侧箭头如果没有金句陪伴，箭头单独成立无意义

## Pyramid Block Overlap — 根因与修复

### 根因（2026-06-20，gsap-skills pixelstack 案）

`.block` 使用 `margin-top: -3px` 让边框"相接"，但问题是：
- `box-shadow: 4px 4px 0 0 var(--line)` 的阴影向右下扩散 4px
- `-3px` 的负边距让上方 block 向下偏移 3px
- 结果：上方 block 的 box-shadow 正好落在下方 block 的内容区，产生乱线

另外 `.block .baseline`（6px 高像素条纹）是最严重的视觉干扰元素，从每个 block 底部向下延伸，完全覆盖相邻 block 的顶部。

### 修复规则

1. **`.block` 改 `margin-top: 3px`**（正向间距，不是负数）
   - 效果：block 之间有 3px 干净间隔，不重叠；box-shadow 正常向右下扩散，不覆盖下方内容

2. **完全删除 `.block .baseline`** CSS 规则
   - `<span class="baseline"></span>` 从模板 HTML 中删除
   - 像素条纹装饰用 slice-grid 或直接在 block 内容里做，不要用伪元素向边框外延伸

3. **Character bottom 位置重算**
   - 当修改任何 block 高度时，必须重新计算 `.character { bottom: calc(18px + h1 + h2 + h3 + h4) }`
   - 桌面端：block 高度 h1=60, h2=54, h3=50, h4=46 → bottom = 228px
   - 移动端：必须同步更新 block 高度覆盖，然后在 mobile breakpoint 加 `.character { bottom: calc(18px + h1_m + h2_m + h3_m + h4_m) }`

4. **移动端 arrow/quote 处理策略（优先级顺序）**
   - **隐藏装饰元素**（最高优先）：arrow 是装饰性视觉锚点，隐藏它让金字塔独占舞台居中——最干净
   - 重新定位：仅在内容文字需要保留展示时使用（但容易破坏居中对称）
   - 加大间距：可能加剧空间不足
   - **禁止隐藏内容**：永远不因布局问题隐藏实质性内容文字

   具体规则：
   - 桌面端：arrow 固定左侧，quote 在右侧
   - 移动端：`.arrow { display:none }`（必须）
   - 移动端：`.arrow-quote { display:none }`（必须，与 arrow 同步隐藏）
   - 金字塔独占 stage，`left:50%; transform:translateX(-50%)` 自然居中
   - 不要尝试把 arrow 改到右上角或重新定位 quote——会破坏居中对称

### 验证标准

- 桌面端：四层 block 边框清晰无乱线；box-shadow 向外右下扩散不覆盖下方 block 内容
- 移动端：金字塔 + 思考者清晰可见，无 arrow-quote 遮挡，无水平滚动
- Character 小人站立在最上层 block 正上方

## Common Errors

| 错误做法 | 正确做法 |
|---|---|
| 拿掉小人，只留金字塔 | 必须保留小人 |
| 把箭头改成 emoji ↑ | 必须用像素消散箭头 |
| 金字塔每层一样宽 | 必须自下而上递减 |
| 顶层用蓝色 | 顶层必须是橙色（强结论） |
| 把 `.hero` 写成 `<section class="hero pix">` | `.hero` 不加 `.pix`；自有描边；`.pix` 只贴 topbar/layer/footer |
| 用像素中文字体 | 用现代抗锯齿中文 |
| `.block` 用 `margin-top: -3px` | 用 `margin-top: 3px`（正向） |
| 保留 `.baseline` 像素条纹 | 删除；改用 slice-grid 或内容内置装饰 |
| 移动端把 arrow 改到右侧导致金字塔偏左 | 移动端隐藏 arrow，金字塔独占居中，quote 同步隐藏 |

## 模板位置

- 主模板：`theme/pixelstack.html`（相对于当前 active repository root）
- 注册位置：`_themes.yaml` slug=`pixelstack-style` position=`15`
- themes.html 已注册：通过 `python3 scripts/rebuild_themes.py` 重建
