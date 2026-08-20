---
name: infocard-mobile-verifier
description: 信息卡移动端验收与修复技能。用于检查并修复信息卡在手机端的缩放、裁切、字号过小、排版断裂、横向溢出等问题，并通过截图/模拟器验证可读性与完整性。
version: 1.1.0
author: Hermes Agent
tags: [infocard, mobile, verification, responsive, viewport, screenshot, ux]

---

# 信息卡移动端验收技能

## 触发条件
在以下场景启用本技能：
- 用户指出信息卡在手机端显示异常
- 用户要求"字号合适、不可缩放、内容完整、布局精美"
- 用户要求修复信息卡的移动端裁切、缩放或字体过小问题
- 用户要求验证信息卡在手机浏览器中的实际可读性
- 用户要求在发布前进行移动端截图验收

## 目标
确保信息卡在移动端具备以下能力：
- 文字大小适合手机阅读
- 页面不可依赖缩放才能阅读
- 内容不被裁切，不发生横向溢出
- 如果首屏 stats/header 看起来像桌面仪表盘缩小稿，先改结构再调字号

## 已知局限性（2026-07-03 新增）

**Vision 模型幻觉**：在分析移动端截图时，vision 模型会捏造页面不存在的元素（如凭空描述"节省75%圆环图"、"pro-install 标签"等），导致错误的 FAIL 判定。

**应对策略**：
1. **实测优先**：截图分析前先用 `curl -sI` 验证图片/CDN 资源可访问性
2. **用户描述**：vision 分析结果存疑时，直接请用户描述他看到的实际情况
3. **分层验证**：技术指标（HTTP 200、图片 200）用 curl 验证；视觉验收靠用户描述

**多列表格溢出**：4+ 列表格在 390px 下必溢出。优先在内容层面删列（如把 5 列对比表压缩到 4 列），次选加 `overflow-x:auto` 包裹。

**hardblue/redswiss 模板通用缺陷——`.grid-3` 无响应式断点**：在 251 个卡片中，有 120+ 个使用了标准 `.grid-3` 三列布局但 CSS 中完全没有 `@media (max-width:720px)` 将其折叠为单列。用户在手机上看到的是桌面三列等比压缩后的极窄列，内容文字无法阅读。

**修复方法**：在 `.grid-3` CSS 定义后注入断点，并批量扫描/修复所有同类卡片。

```css
@media (max-width:720px){
  .grid-3,.grid-4{grid-template-columns:1fr}
  .grid-2{grid-template-columns:1fr}
  .engagement-grid{grid-template-columns:repeat(3,1fr)}
  .section-head{grid-template-columns:52px 1fr}
}
```

**批量扫描脚本逻辑**（Python）：对 `docs/*.html`，检查有 `repeat(3,minmax` 但无 `grid-3,.grid-4{grid-template-columns:1fr}` 的文件；根据文件内 CSS 结构差异（有的用 `repeat(3,1fr` 而非 `repeat(3,minmax(0,1fr))`，有的用 `display:grid` 分开写），注入到正确的 CSS anchor 点后批量 commit。完整脚本见 `any2card-github-hardblue-workflow/references/grid-3-mobile-fix.md`。

**GitHub Pages 相对路径陷阱**：HTML 文件在 `docs/` 子目录下时，`../assets/img/...` 相对路径会 404（GitHub Pages 解析 `docs/` 下 HTML 时路径计算与 CDN 根不同）。**必须用绝对 CDN URL**：`https://<user>.github.io/<repo>/assets/img/<slug>/<file>`。CDN 直接访问 `assets/img/` 是 200，但从 `docs/` 下引用会因路径解析差异 404。

---

**新增 grid 类在 HTML 中使用但 CSS 未定义（2026-07-23）**：向已有卡片追加新内容时，如果引入了 `.scenario-grid`（场景列表）、`.arch-grid`（双列信息格）、`.install-grid`、`.lsp-grid`、`.feature-grid` 等类名，但这些类在当前卡片 HTML 的 `<style>` 块中没有定义，grid 容器会默认 `width: auto`（由内容撑满父容器），在移动端直接横向溢出。视觉表现：格子内容被截断、代码块文字切掉右侧。

**诊断方法**：
```bash
# 检查某张卡片的 HTML 是否引用了未定义的 grid 类
grep -E 'scenario-grid|arch-grid|install-grid|lsp-grid|feature-grid' docs/<slug>.html
# 对每个出现的类名，确认 CSS 样式块中有定义
grep -n '\.scenario-grid\|\.arch-grid\|\.install-grid\|\.lsp-grid\|\.feature-grid' docs/<slug>.html
# diff 结果为空 → 该类在 HTML 出现但 CSS 未定义
```

**标准修复（三步）**：

1. 在 `<style>` 块中已存在 `.install-grid` / `.lsp-grid` 定义处附近，补写缺失的 grid 定义：
```css
.scenario-grid{display:flex;flex-direction:column;gap:8px}
.scenario-item{border:2px solid var(--line);background:#fff;overflow:hidden;box-shadow:4px 4px 0 rgba(10,10,10,.08)}
.scenario-tag{font-weight:900;font-size:11px;color:var(--red);padding:6px 10px 0;border-bottom:1px solid #eee;line-height:1.3}
.scenario-body{padding:6px 10px 10px}
.arch-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.install-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.lsp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.feature-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.arch-diagram{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
```

2. 在 `@media (max-width: 760px)` 查询中补入这些 grid 类，使移动端折叠为单列：
```css
@media (max-width: 760px){
  .feature-grid,.lsp-grid,.install-grid,.arch-grid,.scenario-grid,.preview-wrap{grid-template-columns:1fr}
  table,thead,tbody,tfoot,tr,th,td{display:block;overflow-x:auto}
  .quick-cmd,pre{max-width:100%;overflow-x:auto}
}
```

3. `.quick-cmd` 代码块需要 `overflow-x:auto` + `white-space:pre` 防止长命令截断：
```css
.quick-cmd{overflow-x:auto;white-space:pre}
```

**注意**：scenario-item 使用 grid 列布局时，`scenario-tag` 必须是 inline 元素（如 `<span>`）而非 block 元素（如 `<div>`），否则撑破固定列宽。推荐直接用纯 flex 纵向堆叠，不用 grid 列结构。

## 标准工作流

### 窄屏适配优先级（新增）
当用户明确要求“移动端适配 / 手机可读 / 重新适配”时，先修结构再调字号，避免只靠缩放掩盖问题：
1. 先看 Hero / 主标题区是否双栏桌面布局直接压成窄列；必要时在 720px 断点前改为单列。
2. 对表格优先做局部横向滚动，而不是缩小整页或把 `<tr>` 改成 block。
3. 对代码块优先保留换行可读性；若过长则加 `overflow-x:auto` + `overflow-wrap:anywhere`。
4. 视觉验收时，以截图和 DOM 数值共同判断，不把“截图里看起来大致正常”当成自动通过。

### 发布后的移动端回归验收
如果卡片已发布且用户要求“进行移动端适配”，必须重新走发布后验收：
- 先改 HTML/CSS 并重新 build、verify、check-leak。
- 再推送并等待 Pages 传播。
- 取 390px 截图，确认没有横向溢出、裁切、过小字号、重叠。
- 若表格存在，确认滚动容器是表格本身而不是整页。

## 标准工作流

### 第 1 步：先做静态检查
打开 HTML，优先检查以下项目：
- 是否存在 `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- 是否存在过小字号（尤其是 8px、9px、10px）
- 是否存在固定宽度容器（如 `width: 780px`、`min-width` 过大）
- 是否存在 `overflow-x: hidden` 可以压制横向溢出
- 移动端 breakpoint 是否存在（`@media (max-width:`）
- `.card` / `.page` / `.wrap` 的宽度约束是否在 720px 下正确收敛

### 第 2 步：枚举所有媒体查询块
使用 Python re 枚举所有 `@media (max-width:` 块：
- 统计有多少个 breakpoint
- 列出每个块涉及的 class 和属性
- 特别关注是否有 `width` / `font-size` / `overflow` 三个维度的覆盖

### 3. 截图验证（390×844 iPhone）
优先使用本地 Chrome headless 或标准 live-server 截图，viewport 设为 390×844，执行以下检查：
- `scrollWidth` vs `clientWidth`：横向溢出检测
- 额外读取 `.page` / `.card` 的 computed width，确认不是“无溢出但仍然偏窄”的半失败状态
- `document.fonts.ready` 后再截图
- 截图路径保存到 `tmp_infocard_mobile_{slug}.png`
- 对截图进行 OCR 或视觉分析（字号是否可读、布局是否完整）

### 3.1 截图工具超时的确定性降级路径

如果本地 Chrome headless 截图超时，不要把失败等同于页面失败，也不要直接宣布视觉通过。若已有可访问的浏览器/CDP 页面目标：

1. **`browser_navigate`** 打开目标 URL，用 `browser_console(expression="document.title")` 确认加载。
2. **`browser_cdp(method="Target.getTargets", params={})`** 获取所有 tab 的 `target_id` 列表。
3. **在 `targetInfos[]` 中用 `title` 匹配**当前页面（因为同一 session 里可能有历史 tab 残留，如 MiniMax 控制台）。取匹配的 `targetId`。
4. **`browser_cdp(method="Emulation.setDeviceMetricsOverride", target_id="<匹配的targetId>", params={"width":390,"height":844,"mobile":true,"deviceScaleFactor":2})`** 设置移动视口。
5. **读 DOM 数值**：`Runtime.evaluate` 读取 `innerWidth`、`scrollWidth`、关键节点的 computed `fontSize`，等待 `document.fonts.ready`。
6. **截图**：`browser_vision` 或 `Page.captureScreenshot`。
7. **以 DOM 数值完成结构性门禁**：`scrollWidth <= clientWidth`、无关键元素超出视口、正文字号不低于 11.2px。
8. 这只能证明响应式结构与可读性指标，不能替代真实视觉截图；元数据应保留 `VISUAL_PENDING` 或等价状态。

**注意**：若当前浏览器 session 有多个历史 tab，`browser_navigate` 打开新 URL 后 `target_id` 已切换到新页面，但旧 tab 的 target_id 仍存在于 `Target.getTargets` 结果中。必须通过 `title` 字符串匹配而非假设只有一个 page target。

本降级路径的经验记录见 `references/cdp-mobile-dom-fallback-20260717.md`。

### 3.5 390px 全宽留白排查
如果截图没有横向溢出，但右侧仍有明显空白：
- 先比较 `innerWidth`、`document.body.clientWidth`、`getComputedStyle(.page).width`、`getComputedStyle(.card).width`
- 重点检查 `.page` 是否仍在用 `calc(100vw - gutter)` 一类的桌面留白逻辑
- 这类问题应按“全宽失败”处理，不要误判成普通 overflow
- 参考 `references/mobile-full-width-390px-recovery.md`

### 3.5 边框重叠 / 重线感专项
- 先用真实目标视口验收：移动端卡片先切到 390px 级别视口；桌面问题不要拿移动端截图下结论。
- 重新打开 live 页面再看，不要沿用切视口前的旧截图或旧 snapshot。
- 重点盯 hero / stats / figure / section 交界处：若两层边框接壤，优先只保留一层分隔线。
- 常见修法顺序：先删冗余边框，再补留白/gap，最后才微调 shadow。
- 细节检查请参考 `references/double-line-overlap-checklist.md`。
- **中段密集截图的误判提醒**：当用户只截了 stats → section number → first role card 的中段时，不要默认是“真双线”。先读 DOM 的实际 gap / padding / box-shadow，再判断是否只是 shadow compression 或间距偏紧。必要时以 spacing 修复优先，border 删除后置。
- **像素/手绘 hero 的顶部安全区**：当 hero 里有绝对定位的 quote / arrow / note 与中央插画叠放时，不要只看元素是否“没重叠”。要检查顶部是否留出足够呼吸位，尤其在 390px 宽度下：优先增加容器 `padding-top`，再微调 quote 的 `top`，以避免视觉上贴顶或与角色、首层块挤压。- 当用户指出“线条重叠”“边框发黑”“角点像双线”时，先不要急着改字号或布局栅格，按下面顺序排查：
1. 先确认是不是**真实双 border**，还是 `box-shadow` 紧贴边框造成的视觉加粗，还是背景网格/高对比带来的错觉。
2. 优先检查 `stats`、`section`、`section-head`、首个内容块之间的**外边距 / 内边距**，以及相邻容器是否都在画边框。
3. **如果问题集中在 hero / visual 封面卡内部**（深色标题条 + 图片 + figcaption 的组合），先检查：
   - `.visual-top` 是否额外画了 `border-bottom`
   - `.visual-body .figure` 是否又保留了 `border-top`
   - `figcaption` 是否用过粗的 `border-top`
   - `.visual-top` / `.visual-body` 的上下留白是否太紧
   这一类通常不是“外层 shell 问题”，而是**封面卡内部两层边框相撞**。优先做法：去掉 `.visual-top` 的底线、去掉 `.visual-body .figure` 的顶边、把 `figcaption` 顶边减薄到 `1px~1.5px`，再补 `visual-body` 的顶部留白。
4. 若是多张卡片同症状，默认按**模板级 CSS**修，不要逐页修内容。
5. 修复优先级通常是：给共享容器留白 > 合并/减少相邻边框 > 再看是否需要微调 shadow。
6. 顶部 stats 卡如果还显得“压线”，优先加大 `stats` 的 `margin-top` 与左右 `padding`，并减轻卡片阴影；不要先删 stats 边框。
7. **高密度调查卡的首屏规则**：先保留一个清晰 verdict / conclusion 块，再放 stats；当证据项超过 4 个时，把样本卡放到下方独立网格，避免把首屏压成“很多线条挤在一起”的感觉。
8. **样本卡优先 1 列堆叠而不是强行多列压缩**：如果移动端看起来像“表格被压扁”或“线条密度过高”，宁可把案例卡改成单列、减少同屏数量，也不要只靠缩字号硬塞。

### 3.6 中段截图验收补充
- 如果用户明确指出截图来自页面中段，不要沿用 hero 顶部的判断模板。
- 先用 DOM 读取该中段的真实块顺序：stats → section-head → first card。
- 通过 `getBoundingClientRect()` 看 gap，比仅靠视觉截图更容易区分“边框相撞”与“间距偏紧”。
- 当 box-shadow 为 `none` 且 border 已清零时，优先怀疑 spacing 太紧而不是 border 设计错误。

参考记录：`references/border-overlap-regression-20260609.md`…`references/2026-06-09-dense-evidence-card-legibility.md`。

### 4. 移动端问题定位（hard rules）

**表格→卡片降级时 CSS Specificity 陷阱（2026-07-22 新增）**：
`@media` 内只对 wrapper div 设 `display:none` **无效**——`<table>` 的浏览器默认 `display: table` 权重更高。
必须在 `@media` 内**直接对 `<table>`、`<thead>`、`<tbody>`** 设 `display:none!important`。详见 `references/table-to-card-responsive-20260722.md`。
| 问题类型 | 修复路径 |
|---|---|
| 字号过小 | 全局 `font-size` 在 `@media (max-width:)` 下放大 |
| 单行长词溢出 | `overflow-wrap: anywhere; word-break: break-word` |
| 网格未折叠 | `@media` 中将 `grid-template-columns` 改为 `1fr` |
| 表格横向挤 | 移动端隐藏 `<table>`，显示 `.table-card-list` 属性卡结构 |

### 陷阱：多列表格未做响应式卡片化降级（2026-07-22 新增）

**现象**：§3 区域包含 7 列表格（涉案主体、时间、高校、手段、涉案金额、处理结果、等级），390px 下被压缩成竖排单字、文字不可读。HTML 中已有 `.case-table-desktop`（桌面表格）和 `.case-list-mobile`（移动端卡片列表）两套结构，CSS `@media (max-width:600px)` 里写了 `.case-table-desktop{display:none}` 和 `.case-list-mobile{display:block}`——但移动端仍然显示表格。

**根因**：CSS 特异性（Specificity）问题。
- `.case-table-desktop` 是 wrapper `div`，CSS 规则 `.case-table-desktop{display:table}` 里的 `display:table` 权重覆盖了 `@media` 里的 `display:none`
- `<table>` 元素本身没有 `.case-table-desktop` class，所以 `@media .case-table-desktop{display:none}` 只能隐藏 wrapper，无法隐藏内部的 `<table>`

**正确修复（四步，2026-07-22 实测验证）**：

**Step 1 — HTML 结构**：同时写两套结构。
```html
<!-- 桌面端：标准表格 -->
<div class="case-table-desktop">
  <table class="case-table">
    <thead>...</thead>
    <tbody>...10行数据...</tbody>
  </table>
</div>

<!-- 移动端：独立卡片列表 -->
<div class="case-list-mobile">
  <div class="case-card">
    <div class="case-card-header">
      <span class="case-card-name">中国农业大学李某</span>
      <span class="case-card-amount">3756万元</span>
    </div>
    <div class="case-card-meta"><span class="cred cred-a">A</span><span>985</span><span>~2020s</span></div>
    <div class="case-card-method">侵吞+虚开发票+虚列劳务</div>
    <div class="case-card-verdict">有期徒刑12年+罚金300万</div>
  </div>
  ...每个案例一行 .case-card...
</div>
```

**Step 2 — 基础 CSS**：两套结构都默认可见，桌面优先。
```css
.case-table-desktop, .case-list-mobile { display: block }
.case-table-desktop table { display: table }   /* 桌面表格 */
.case-list-mobile { display: none }           /* 隐藏移动端卡片 */
.case-list-mobile .case-card { display: block }
```

**Step 3 — 移动端断点（关键）**：**必须直接对 `<table>` 和 `.case-card` 写规则**，不能只对 wrapper。
```css
@media (max-width: 600px) {
  /* 隐藏桌面表格——直接对 table 写，不能只对 wrapper */
  .case-table-desktop { display: none !important }
  .case-table-desktop table { display: none !important }  /* 关键：table 本身 */
  /* 显示移动端卡片 */
  .case-list-mobile { display: block !important }
  /* 防止溢出 */
  .case-list-mobile { width: 100%; max-width: 100%; overflow: hidden; box-sizing: border-box }
}
```

**Step 4 — 卡片 CSS**：每个 `.case-card` 独立可读，金额红色高亮。
```css
.case-card {
  border: 2px solid var(--line);
  background: var(--paper);
  padding: 10px 12px;
  margin-bottom: 8px;
  box-shadow: var(--shadow);
}
.case-card-header {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 5px;
}
.case-card-name { font-size: 12.5px; font-weight: 900 }
.case-card-amount { font-weight: 900; color: var(--red); font-size: 13px }
.case-card-meta { display: flex; gap: 6px; align-items: center; margin-bottom: 4px; font-size: 10px }
.case-card-method { font-size: 11px; color: #333; line-height: 1.4 }
.case-card-verdict { font-size: 10.5px; color: #555; font-weight: 700 }
```

**防复发检查清单（每次写卡时执行）**：
- [ ] 表格有多列（≥5）时，自动准备桌面表格 + 移动端卡片两套结构
- [ ] `@media` 内对 `<table>` 元素本身写 `display:none!important`
- [ ] `@media` 内对 `.case-card` 写 `display:block!important`
- [ ] 用 `!important` 确保媒体查询优先级高于任何内联/行内样式
- [ ] 移动端截图验收（390px），确认表格消失、卡片出现

**常见错误**：
- ❌ 只对 wrapper 写 `display:none`，table 元素不受影响
- ❌ 用 `overflow-x: auto` 把 7 列表格强行塞进 390px（文字被压缩成竖排单字）
- ❌ 以为 `display: table` 在 `@media` 里会被 `display: block` 覆盖（特异性不够）
- 列宽被强行压缩，第一列文字变成**单字竖排**（如"中/国/农/业/大/学/李某"逐字竖列）
- 各列内容被严重挤压，阅读体验极差
- 没有转换为"姓名+金额"一行的卡片列表形式

**根因**：HTML 使用 `<table>` 实现案例列表，但没有对应的移动端卡片化结构。

**正确的移动端表格处理模式**：

1. **桌面端**：`<table>` 展示完整 7 列
2. **移动端**：
   - `<table>` 设置 `display:none`
   - 容器内嵌 `.case-card-list`（display:flex, flex-direction:column, gap）
   - 每个案例一个 `.case-card`：
     ```html
     <div class="case-card">
       <div class="case-header">
         <span class="case-name">中国农业大学李某</span>
         <span class="case-amount">3756万元</span>
       </div>
       <div class="case-meta">
         <span>时间：~2020s</span>
         <span>高校：985</span>
       </div>
       <div class="case-method">侵吞+虚开发票+虚列劳务</div>
       <div class="case-result">有期徒刑12年+罚金300万</div>
     </div>
     ```
   - 卡片内"姓名 + 金额"作为 primary 行（大字号/粗体），其余作为 secondary 行
   - 7+ 列表格在 390px 下必须做卡片化，4-5 列可考虑横向滚动表格

**验证方法**：
```javascript
// CDP 检查表格是否存在移动端替代卡片
const hasTable = await page.evaluate(() => !!document.querySelector('table.section3-table'));
const tableDisplay = await page.evaluate(() => {
  const t = document.querySelector('table.section3-table');
  return t ? getComputedStyle(t).display : 'not-found';
});
const hasCardList = await page.evaluate(() => !!document.querySelector('.case-card-list'));
console.log('table display:', tableDisplay, '| has card list:', hasCardList);
```

**快速判断**：打开 HTML 源码，搜索 `<table>` 标签 → 检查是否在 `@media (max-width:` 内有 `display:none` 或对应 `.case-card-list` 结构存在 → 如果没有 = 本次同款问题。

详细案例记录：`references/table-to-card-responsive-20260722.md`

## 已有陷阱清单（2026-07 综合）

| 陷阱 | 类型 | 状态 |
|------|------|------|
| Vision 模型幻觉 | 工具误判 | 已知 |
| CDP screenshot 被截断 | 工具限制 | 已知 |
| GitHub Pages 图片路径（docs 目录） | 路径陷阱 | 已知 |
| `.grid-3` 无响应式断点 | 布局 | 已知 |
| themes.html iframe 背景渗入 | 视觉误判 | 已知 |
| 390px 全宽留白排查 | 布局 | 已知 |
| 边框重叠 / 重线感 | 视觉 | 已知 |
| **多列表格未做响应式卡片化降级** | **布局（新增 2026-07-22）** | **本次发现** |
| 按钮遮挡 | 给 `.footer` / `figure` 底部加 `padding-bottom` 或 `margin-bottom`，**不是**改 FAB 的 fixed 定位 |

### 第 5 步：修复并复验
每做一次 CSS 修改后，重新截图复验，直到：
- 无横向溢出
- 字号 ≥ 11.2px
- 内容完整不裁切
- 按钮不遮挡正文

## PASS 必须同时满足
1. 无横向溢出：`document.body.scrollWidth <= document.body.clientWidth`
2. 字号 ≥ 11.2px（正文层级）
3. 内容完整不裁切
4. `.save-btn` / `.fab-save` 若存在，验证其功能为 PNG 导出（不是打印）

## 高频修复模式

### 1. 字号全局放大（桌面 → 移动端）
在 `@media (max-width: 720px)` 块中覆盖：
```css
body { font-size: 14px; }   /* 原来是 16px */
h1, h2, h3 { font-size: 16px; }
.kicker, .label, .small { font-size: 10.5px; }
```

### 2. 网格折叠（2-col → 1-col）
```css
/* Desktop: */
.grid { grid-template-columns: 1fr 1fr; }
/* Mobile: */
@media (max-width: 720px) {
  .grid { grid-template-columns: 1fr; }
}
```

### 3. 横向溢出压制
```css
body { overflow-x: hidden; }
.card, .page, .wrap { max-width: 100%; overflow-x: hidden; }
```

### 4. 固定按钮防遮挡
```css
.footer { padding-bottom: 120px; }
figure { margin-bottom: 120px; }
/* FAB 的 position:fixed 是正确的，不改它 */
```

### 5. 表格在移动端转属性卡
桌面保留 `<table class="table">`，移动端：
```css
@media (max-width: 720px) {
  .table { display: none; }
  .table-card { display: block; }
  .table-card-list { display: block; }
}
```
HTML 结构：
```html
<table class="table"><!-- 桌面 --></table>
<div class="table-card-list"><!-- 移动端替换 -->
  <div class="table-card-row">
    <span class="table-card-label">参数</span>
    <span class="table-card-value">值</span>
  </div>
</div>
```

### 6. 图片宽度约束
```css
img { max-width: 100%; height: auto; display: block; }
```

### 7. 字号微调（iOS 根字号的补偿）
如果移动端仍然偏小，给 `body` 加 `text-size-adjust: 100%` 并用 CSS 变量补偿。

### 8. 根字号放大（最彻底方案）
把根字号从 `16px` 改为 `18px` 或 `20px`，在移动端一次性解决所有层级字号偏小的问题：
```css
@media (max-width: 720px) {
  :root { font-size: 18px; }
}
```

### 9. 技术表格在移动端改成属性表/卡片栈
当技术卡里出现桌面型表格（尤其是 3 列及以上，或"参数 / 作用 / 默认值/要点"这类配置表）时，移动端不要只缩字号保表格。
- 桌面端可保留 `<table>`
- 移动端应隐藏 `<table>`，显示 `.table-card` / definition list / label-value stack
- 推荐结构：`term` 单独成行，`dt` 做字段名，`dd` 做字段值
- 不要硬保留多列表格在手机上横向挤压——结构改写在先，字号调整在后

### 10. 靶向修复原则（最重要）
当用户说"问题在 X URL/页面"时，必须**先确认问题确实在 X**，再动手修。不可凭上下文记忆跳转到其他文件。定位错误是最高频不满触发器。

### 11. FAB 固定按钮不算遮挡
当 `.save-btn` / `.fab-save` 使用 `position:fixed` 位于右下角时，`position:fixed` 是**正确设计**，不是错误。脚本不应将其与页面元素比较 overlap。防遮挡正确做法是给内容底部加 padding/margin，**不是**把 FAB 从 fixed 改成 static。

### 12. 诊断优先序（高频返工根因）
用户说"某元素贴边/贴边了"，诊断路径必须**先局部后全局**，不要先跑横向溢出：
1. 定位用户指的具体元素（class / id）
2. 查该元素的 CSS（`padding`、`margin`、`left`）
3. 确认是局部 padding 缺失，还是全局 overflow 问题
- **局部贴边** → 该元素缺少 `padding-left` / `margin-left`，与横向溢出无关
- **横向溢出** → `scrollWidth > clientWidth`，是全局性问题，需加 `overflow-x:hidden`

常见局部贴边高发位置：`.section-head`（红色编号方块）、首屏标题区、内容密集卡片的移动端 left padding。

**反面教训（2026-06-05）**：用户说"红色标题贴边了"，我先跑横向溢出检测（`scrollWidth`、`clientWidth`）、视觉截图分析，花了 4 步才定位到 `.section-head` 的 `padding-left:0`。正确路径：用户明确指"红色标题"→直接查 `.section-head` 的移动端 CSS→一步定位缺 `padding-left:14px`。

### 13. 窄栏感不等于横向溢出
当手机端“看起来太窄”但没有明显横向滚动时，不要只盯 `scrollWidth`。
- 先检查移动端 media query 是否把主容器写成了 `calc(100vw - Nrem)`、`max-width` 过小或大块侧边 padding。
- 重点查 `.page` / `.hero` / `.section` / `.footnote` 的 `width` 与 `padding-right`。
- 判断标准是：页面是否视觉上铺满手机可用宽度，而不是仅仅没有 overflow。
- 如果主体变成窄居中卡片，先恢复主容器到 `width:100%; max-width:100%`，再保留字号和栅格折叠。

### 14. 红色章节头（section-head）移动端贴边
当用户说"红色标题贴边了"，立即定位 `.section-head` / `.section-no`，不要先跑横向溢出排查。
- 横向溢出 → 全局 `overflow-x` 问题；贴边 → 局部元素缺少 `padding-left`
- 高发位置：Q-style 和 Blue Technical Manual 风格卡片的 `.section-head` 在 `@media (max-width:720px)` 中缺少 `padding-left:14px`
- 见 `references/mobile-section-head-left-padding-fix.md`

### 15. 首页时间显示优先级
首页 Vue 的 `buildTimeMeta()` 时间来源优先级：1. `updated_at` / `updated`（最高）→ 2. `date` → 3. `_modified_date`。republish 时若把 `updated` 写成当前时间，首页会显示"当前发布时间"。修复：不要在 republish 时改 `updated`；重建 `_index.yaml` 后再 push。

### 17. `.grid2` 等分被外部样式覆盖
当移动端两列网格看起来写对了，但实际 computed 宽度仍然不等分时，优先检查是否有浏览器注入样式或外部覆盖把 `grid-template-columns` 改掉了。
- 先在 390px viewport 里读 computed style，不要只看源码里的 CSS 规则。
- 如果发现外部样式覆盖，直接在对应 `.grid2` 容器上加内联 `grid-template-columns: calc(50% - 4px) calc(50% - 4px) !important;` 之类的强制声明。
- 修完后再次读取 computed 宽度，确认两列实际像素宽度接近相等，再做截图验收。
- 只验证 stylesheet 文字不算完成，必须验证最终 computed width。

### 19. `.grid2` 等分被外部样式覆盖

**现象**：`@media(max-width:720px)` 里的 `grid-template-columns: 1fr` 不生效，grid 仍保持双列（`heroGrid = "502.344px"` 而非 `"348px"`）。

**根因**：Hermes CDP 的 stealth 扩展（`cdp_override` 模式）在页面加载时注入 CSS，注入 `grid` 简写 property 直接覆盖 MQ 里声明的值。优先级：`injected CSS` > `MQ stylesheet rule`。

**修复**：给需要强制单列化的元素加 **100% inline style + `!important`**：
```html
<section class="hero" style="grid-template-columns: 1fr !important;">
```
这是唯一可靠绕过 stealth 注入的方式。`@media` 里的 `!important` 仍被 injected CSS 压制。

**验证数据**：修复后 `heroGrid` 应为单列宽度（如 `348px`），`flowBox.right < innerWidth`。

### 20. 表格内容横向滚动，但表头/标题必须固定（table-only scroll）

**User requirement**（confirmed 2026-06-18）："我需要的是表格内容的滚动 不是连同表格外是元素一起滚动" — only the table scrolls, card header and title stay fixed.

**Wrong pattern**（被用户拒绝 2026-06-18）：making `.chart-card` or `.wide` the scroll container — this scrolls the card header/title with the table.

**Correct pattern**: dedicated `.table-scroll` wrapper around `<table>` only.

#### HTML — wrap only `<table>` in scroll div
```html
<article class="chart-card">
  <div class="panel-head">...</div>   <!-- 固定，不滚动 -->
  <h2>v1 → v2 逐项变化</h2>          <!-- 固定，不滚动 -->
  <div class="table-scroll">            <!-- 只包裹 table -->
    <table class="diff-table">...</table>
  </div>
</article>
```

#### CSS — make only `.table-scroll` the scroll container
```css
@media (max-width: 720px) {
  .table-scroll {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    display: block;
    min-width: max-content;  /* 强制表格保持自然宽度 */
    width: 100%;
  }
  /* 父容器必须可见，禁止它成为滚动容器 */
  .chart-card { overflow-x: visible; }
  .wide       { overflow-x: visible; }
}
```

#### 验收标准（CDP 验证）
```js
// 1. panel-head 在滚动区外面，overflow-x 为 visible（固定不动）
var ph = document.querySelector('.panel-head');
console.log('panel-head overflow-x:', window.getComputedStyle(ph).overflowX);
// 必须输出 visible

// 2. .table-scroll 是滚动容器，表格比视口宽
var ts = document.querySelector('.table-scroll');
console.log('scrollWidth:', ts.scrollWidth, 'viewport:', window.innerWidth);
// scrollWidth > innerWidth 才说明能滚动

// 3. JS 滚动验证
ts.scrollLeft = 300;
console.log('scrollLeft:', ts.scrollLeft);
// 输出 300 说明滚动正常
```

**高频返工根因**：先在 `.chart-card` 上加 `overflow-x: auto`，发现整张卡片都滚了才回头改。正确路径：grill-me 确认"表格滚动、标题不动"后，直接用 `.table-scroll` wrapper 方案。

### 19. body `overflow-x:hidden` 压制子元素滚动

**现象**：`.flow-box` / `.ref-box` 设置了 `overflow-x:auto`（期望水平滚动），但盒内内容被裁切。

**根因**：`body { overflow-x: hidden }` 在祖先层级压制了所有后代元素的 `overflow-x` 计算。

**修复**：在对应的 `@media` 里给受影响元素的父容器加 `overflow-x: visible`：
```css
@media(max-width:720px){
  .page{overflow-x:visible}
  .flow-box{overflow-x:auto;width:100%;box-sizing:border-box}
}
```
同时给目标元素加 `width: 100%; box-sizing: border-box`。<br>
**组合拳**：body `overflow-x: hidden` + stealth 注入覆盖 MQ + 子元素 overflow auto 三者叠加是最难排查的横向溢出组合。


## 陷阱：Trellis 类高密度卡的多网格横向溢出（2026-07-04 实测）

**现象**：`dagu.html` 多次被用户指出"依然右侧截断"，Trellis 重建卡发布后用户说"右侧截断"。

**根因**：含有 `sop-steps`（5列）/ `platform-grid`（5列）/ `ai-grid`（3列）/ `scenario-grid`（4列）的网格在 390px 下被强制多列压缩，每列宽度过窄导致横向溢出，而非 CSS 本身有 bug。

**修复模板**（Trellis 实测有效）：
```css
/* 第一级响应式：960px 断点收起部分网格 */
@media (max-width: 960px) {
  .hero,
  .content { grid-template-columns: 1fr; }
  .platform-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .scenario-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sop-steps { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .spec-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .faq-grid,
  .team-grid,
  .config-row { grid-template-columns: 1fr 1fr; }
  .compare-body { display: none; }  /* 隐藏对比卡正文，保留标题 */
}

/* 第二级响应式：720px 全部单列 */
@media (max-width: 720px) {
  .platform-grid,
  .scenario-grid,
  .sop-steps,
  .spec-grid,
  .faq-grid,
  .team-grid,
  .config-row { grid-template-columns: 1fr; }
}
```

**验证流程**：
1. `playwright screenshot --viewport-size="390,844" --full-page "https://...html?cb=$(date +%s)" /tmp/check.png`
2. vision 分析确认无横向溢出、SOP 单列
3. commit → push → 等 Pages → `?cb=` 截图复验

**反面教训（2026-07-04）**：只修了 SOP 步骤单列，但忽略了其他网格（platform-grid、ai-grid 等）在 390px 下仍然多列。修复必须覆盖**所有**网格容器的 breakpoint 链，缺一不可。

## 陷阱：Playwright 截图缓存导致误判

**现象**：用户说"依然右侧截断"，但 vision 分析说"单列、无溢出"。同一 URL 截图两次，结果不一样（第一次双列，第二次单列）。

**根因**：Playwright 对相同 URL 做了内部缓存/复用，第一次截图时用的是旧 CSS（CSS 文件或 HTML 本身未更新），第二次才拿到新版本。

**修复**：在 URL 后加 `?cb=<timestamp>` 参数强制绕过缓存：

```bash
playwright screenshot --viewport-size="390,844" --full-page \
  "https://ccwq.github.io/infocard-pub/docs/20260703-openwiki.html?cb=$(date +%s)" \
  /tmp/openwiki-fix-390.png
```

**验证流程**：修 CSS → commit → push → 等 Pages 部署 → 用 `?cb=timestamp` 截图 → vision 分析 → 确认实际布局。

**反面教训（2026-07-03）**：修完 CSS 后直接用原 URL 截图，vision 仍报告双列布局；加了 `?cb=$(date +%s)` 后才确认真实布局为单列。缓存破坏参数是移动端验收的标准步骤，不可省略。

## 陷阱：Playwright Node.js 模块不可用时（2026-07-04 实测）

**现象**：`require('playwright')` 或 `require('@playwright/test')` 报 `MODULE_NOT_FOUND`，但 `playwright` CLI 二进制存在于 `~/.local/bin/playwright`。

**根因**：playwright 以 CLI 工具安装，但 Node.js 模块未装进 node_modules。

**正确做法**：用 Python playwright API 绕过 Node.js 模块缺失：
```bash
python3 -c "
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('https://ccwq.github.io/infocard-pub/docs/{slug}.html', wait_until='networkidle')
    page.screenshot(path='/tmp/{slug}-mobile.png', full_page=True)
    browser.close()
print('done')
"
```
若 Chromium 可执行文件缺失，先运行 `playwright install chromium`。

## 陷阱：Vision 模型会幻觉装饰来源（iframe 混入）

**现象**：vision 模型在分析移动端截图时，可能把 **themes.html 预览页的 iframe 嵌套结构**当成信息卡本身的内容来描述。

**实测案例**（2026-07-02 Dagu 验收）：
- 用户说"依然右侧截断"，vision 模型描述了"黄/浅蓝/粉彩色装饰条"
- 实际情况：themes.html 预览页的 iframe 外框有这些颜色，但 dagu.html 本身**没有任何装饰条**
- 直接对 `https://ccwq.github.io/infocard-pub/docs/20260702-dagu.html` 截图后，vision 分析确认：**无横向溢出、无装饰条、布局干净**

**正确做法**：
1. 用户说"右侧截断/装饰条"时，**先对实际部署 URL 直接截图**，不要通过 themes.html iframe 间接看
2. `playwright screenshot --viewport-size="390,844" https://ccwq.github.io/infocard-pub/docs/20260702-dagu.html /tmp/dagu-390.png`
3. 如果 vision 描述了 HTML 源码里不存在的元素（装饰条、色块、文字），以截图和源码为准
4. 如果用户看到了你"没看到"的东西，问清楚他是在哪个 URL 看的（直接卡 URL vs themes.html 预览）

**补救**：当 vision 描述的内容明显与 HTML 源码不符时，以 HTML 源码和 CDP 查询结果为准。主动向用户指出 vision 分析有误。

---

## 陷阱：iframe 背景色导致"移动端底色异常"（themes.html 渗入）

**现象**：Vision 模型描述"底部灰色区域"，但实际根因是 themes.html iframe 背景色渗入。详见 `references/themes-iframe-bg-渗入-20260710.md`。

---

## 陷阱：CDP screenshot 被截断的应对策略

**现象**：CDP `Page.captureScreenshot` 在大数据量时返回被截断（25K char JSON），无法解码成有效 PNG。

**已验证有效的策略**（按优先级）：

1. **scale 缩放**：在 `Emulation.setDeviceMetricsOverride` 里设 `deviceScaleFactor: 0.5`（或 1），再用默认 scale 截图。实测 scale=1 + 390px 视口截图约 335KB（会截断）；scale=0.5 后缩小约 4 倍
2. **clip 局部截图**：`{clip: {x:0, y:0, width:390, height:120, scale:1}}` 只截顶部 120px，文件小到不会被截断
3. **base64 编码转存**：截断结果仍含部分 base64 数据（到截断位置为止），可以写到 `/tmp/hermes-results/call_function_*.txt` 再手动 decode。方法是 `python3` 读文件 `re.search(r'"data":\s*"([A-Za-z0-9+/=]+)"', data)` 提取，写入 `.png` 文件

**不建议的做法**：
- 不要依赖 `browser_vision` 的内置截图（超时率高）
- 不要直接等 `browser_snapshot` 返回大图（会被截断）
- 优先用 CDP `Runtime.evaluate` 读 DOM 数值（不会截断），结合截图做最终确认

**现象**：vision 模型（`mcp_minimax_understand_image` / `vision_analyze`）对截图的分析可能产生大量不存在于 HTML 中的内容描述。

**实测案例**（2026-07-03 pi-workflow 验收）：
- 截图里只有：hero 文字 + deep-research 流程图 + stats 4格 + 一句话判断 + 4个工作流卡片 + 6种阶段模式 + 6步SOP表 + execution-router + TUI BOARD(3格) + 三层架构 + 依赖
- Vision 模型却"看到"了：节省75%圆环图、pro-install/pro-xml-rss-search/deep-search表格、SVG圆环进度图、"计算原理→扩充图谱→扫一扫处理→延展现实→生成审计报告"文字链
- 这些内容在 HTML 里完全不存在，是纯幻觉

**风险**：按 vision 的分析去做修复方向判断会导致无效返工。

**正确做法**：
1. Vision 只用来确认"有没有横向溢出"这种二元判断
2. 不要用 vision 的详细描述作为 HTML 内容的事实依据
3. 验收结论必须基于实际的 CDP DOM 查询和图片 URL 可达性检查
4. 如果需要验证"某个元素是否存在"，直接用 CDP `Runtime.evaluate` 查 DOM

**补救**：当 vision 描述的内容明显与 HTML 源码不符时，以 HTML 源码和 CDP 查询结果为准。主动向用户指出 vision 分析有误。

## 陷阱：GitHub Pages 图片路径（docs 目录部署模式）

**现象**：图片在本地预览正常，但 GitHub Pages 上 404。`curl` 探测返回 `HTTP/2 404`。

**根因**：当仓库使用 `docs/` 作为 GitHub Pages 根目录时，HTML 文件里的相对路径 `assets/images/...` 会解析为 `<root>/assets/images/...`（不存在），而不是 `<root>/docs/assets/images/...`。

**判断规则**：
- HTML 在 `docs/20260703-pi-workflow.html`
- 图片在 `docs/assets/images/20260703-pi-workflow/logo.png`
- 正确路径写法：`src="docs/assets/images/20260703-pi-workflow/logo.png"`
- 错误路径写法：`src="assets/images/20260703-pi-workflow/logo.png"`

**验证**：发布前用 `curl -sI "https://ccwq.github.io/infocard-pub/docs/assets/images/..."` 确认图片 200。

**修复**（实测 2026-07-03）：
```bash
# 在 HTML 中替换
src="assets/images/
→ src="docs/assets/images/
```

## 输出检查清单
- [ ] 无横向溢出
- [ ] 字号 ≥ 11.2px（正文层级）
- [ ] 内容完整不裁切
- [ ] `.save-btn` / `.fab-save` 功能为 PNG 导出，不是打印
- [ ] 靶向修复：用户指出的 URL 就是实际修复的位置
- [ ] 局部贴边：用户指出的元素本身有足够 left padding（如 `.section-head` 在移动端）
