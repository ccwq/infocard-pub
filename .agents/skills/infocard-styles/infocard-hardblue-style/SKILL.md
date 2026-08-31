---
name: infocard-hardblue-style
description: 硬核蓝手册风格信息卡 — 用于技术手册/调查/观点拆解类内容，高密度多章节版式。模板位于 `theme/hardblue.html`，已更新为压缩版（Hero 更紧凑）。
category: infocard-styles
tags: [infocard, hardblue, red, blue, Swiss, high-density, manual]
---

# infocard-hardblue-style · 硬核蓝手册

> Runtime boundary：新流程只消费 `infocard-theme-contract/adapters/index.json` 中的本主题适配器与本文件的视觉令牌/组件说明。下方任何 authoring、worktree、浏览器验收、构建或发布步骤均为 legacy archive，不可从主题层执行。

## 定位

用于重型多章节技术手册、调查、观点拆解、工具图鉴类内容。比 `infocard-redswiss-style` 多了蓝/红/黑三色 hero-bar + 网格底纹 + 96px 大编号块。

## CSS 变量

```css
:root {
  --bg:      #f6f4ef;   /* 暖灰网格背景 */
  --paper:   #fffdf8;   /* 卡片背景 */
  --ink:     #111111;   /* 主文字 */
  --muted:   #5f5950;   /* 次要文字 */
  --line:    #111111;   /* 边框 */
  --red:     #d80018;   /* 红色强调 */
  --blue:    #1f63ff;   /* 蓝色强调 */
  --soft-red:#fde9eb;   /* 浅红背景 */
  --soft-blue:#e8f1ff;  /* 浅蓝背景 */
  --soft-ink:#f7f6f2;   /* 浅灰背景 */
}
```

## 核心组件参数（2026-06-07 压缩版）

### Hero 区域（已压缩）

| 元素 | 值 |
|------|-----|
| `hero-copy` padding | **16px**（旧 22px） |
| `hero-copy` gap | **10px**（旧 14px） |
| h1 `demo-title` | `clamp(24px,3.8vw,42px)`（旧 `clamp(30px,4.6vw,52px)`） |
| `subtitle` | **12.5px / 1.52**（旧 14px / 1.6） |
| `kicker` | padding **5px 9px**，font-size **11.5px**（旧 6px 10px / 12px） |
| `.badge` min-height | **28px**（旧 33px） |
| `.badge` padding | **5px 9px**（旧 6px 10px） |
| `.badge` gap | **6px**（旧 8px） |
| `.badge.ink` | `background:#111;color:#fff;font-size:11px;min-height:24px;padding:4px 8px` |
| `alert` border | **2px**（旧 3px） |
| `alert` padding | **10px 12px**（旧 15px） |
| `alert` gap | **8px**（旧 10px） |
| `alert strong` | **13.5px**（旧 15px） |
| `alert p` | **12.5px / 1.6**（旧 14px / 1.68） |

### 章节组件

| 元素 | 值 |
|------|-----|
| `section-no`（编号块） | 96×96px，3px border，font-size 34px |
| `section-head` gap | 14px |
| `section` margin-top | 30px |
| `card/.mini` padding | 14px |
| `grid-3/.grid-4` gap | 12px |
| `matrix` gap | 12px |
| `risk` top accent bar | 8px |

### 响应式断点

- `1080px`：hero 单栏，grid-4/matrix/risk-grid → 2列
- `720px`：全单栏，section-head → 堆叠

### Mobile save button: position:static only

For technical info cards, the save button must use `position:static` (normal flow). Never `position:fixed` — it always obscures content on mobile. Correct pattern:

```css
.save{
  display:block;width:fit-content;
  position:static;margin:14px 0 0 auto;
  z-index:1;border:0;border-radius:10px;
  padding:11px 14px;
  background:linear-gradient(135deg,#0036a3,#002a7a);
  color:#fff;font:900 12px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  letter-spacing:.06em;box-shadow:0 10px 24px rgba(0,0,0,.35);cursor:pointer
}
@media(max-width:720px){
  .page{padding-bottom:108px}
  .quickline{padding-right:72px}
  /* position:static stays — no fixed offsets */
}
```

## 坑点

```html
<header class="hero">
  <div class="hero-bar"></div>
  <div class="hero-copy">
    <div class="kicker">分类 · 子类</div>
    <h1 class="demo-title">标题</h1>
    <p class="subtitle">副标题</p>
    <div class="badge-row">
      <span class="badge red">主色 badge</span>
      <span class="badge blue">蓝色 badge</span>
      <span class="badge">普通 badge</span>
      <span class="badge dark">深色 badge</span>
      <span class="badge ink">内联数据点</span>
    </div>

Badge color CSS (add alongside other `.badge` rules):
```css
.badge.blue{background:var(--soft-blue);color:var(--blue)}
.badge.dark{background:#111;color:#fff}
.badge.ink{background:#111;color:#fff;font-size:11px;min-height:24px;padding:4px 8px}
.badge.red{background:var(--soft-red);color:var(--red)}
```
    <div class="alert">
      <strong>核心定位句</strong>
      <p>展开说明。</p>
      <div class="mini-row">
        <span class="mini-tag">标签</span>
      </div>
    </div>
  </div>
  <figure class="hero-visual">
    <div class="panel-top">
      <div class="eyebrow">EYEBROW</div>
      <h3>右侧面板标题</h3>
      <p>说明文字。</p>
    </div>
    <div class="panel-body">
      <div class="quote">引文。</div>
      <div class="flow">
        <div class="flow-item blue"><div class="t">Step</div><div class="c">内容</div></div>
      </div>
    </div>
  </figure>
</header>

<section class="section">
  <div class="section-head">
    <div class="section-no">01</div>
    <div class="section-meta">
      <div class="label">LABEL</div>
      <h2>章节标题</h2>
      <p>章节说明。</p>
    </div>
  </div>
  <div class="grid-3">
    <article class="card">
      <div class="tagrow"><span class="tag red">标签</span></div>
      <h3>卡片标题</h3>
      <p>正文。</p>
      <ul><li>要点</li></ul>
    </article>
  </div>
</section>
```

## `.meta.yaml` 必填字段

```yaml
slug: "YYYYMMDD-slug-hardblue"
path: "docs/YYYYMMDD-slug-hardblue.html"
title: "标题"
desc: "摘要（80-210字符）"
date: "YYYY-MM-DDTHH:MM:SS+08:00"
updated: "YYYY-MM-DDTHH:MM:SS+08:00"
tags: ["Tag1", "Tag2"]
category: "knowledge"
source: "github"
source_url: "https://github.com/..."
author: "author"
```

## 创建流程

> ⚠️ 注意：`theme/hardblue.html` 模板文件在 infocard-pub 仓库中**存在**（完整 475 行），优先从该文件复制结构，而非从 SKILL.md 内联模板复制。SKILL.md 中的 HTML 片段仅作快速参考，完整 CSS/HTML 以 `theme/hardblue.html` 为准。

1. 如果用户提供的是过程文件/调研稿（常见于 `/tmp/infocard-process-*.md` 或 `publish-bundle.json`），先读过程文件，再抽取：标题、推荐 slug、关键事实、禁止混淆对象、风格建议
2. 从 `theme/hardblue.html` 复制完整模板到 `docs/<slug>.html`，替换内容；CSS 变量和组件结构保持不变
3. `date +'%Y-%m-%dT%H:%M:%S+08:00'` 获取时间戳
4. 写 `docs/<slug>.html`（从本技能模板复制，替换内容；过程文件建议可直接转成主文案结构）
5. 写 `docs/<slug>.html.meta.yaml`
6. 如果过程文件明确给出“禁止混淆对象”或相关边界，务必在卡片中显式列出，避免读者把相近工具混为一谈
7. **门禁流水线**（全部通过后才提交）：
   ```bash
   npm run build && npm run verify && npm test && node scripts/check-info-leak.js docs/<slug>.html
   ```
   - `npm run build`：生成 `_index.yaml` 和注入 `index.html`，同步 `meta.yaml` 的 `updated` 时间戳
   - `npm run verify`：校验索引一致性
   - `npm test`：运行 `scripts/test/*.test.js` 原生测试
   - `node scripts/check-info-leak.js docs/<slug>.html`：**单文件扫描**（不用 `npm run check-leak`，那是全仓库扫描）
8. **Git 提交（含所有构建产物）**：
   ```bash
   git add docs/<slug>.html docs/<slug>.html.meta.yaml docs/<slug>.md
   git add _index.yaml index.html   # 构建产物，必须一并提交
   git commit -m "feat: publish <title> (<version>)"
   ```
   > ⚠️ push 由用户控制，**不要**默认 push；如用户明确要求不 push，跳过 push 即可
9. `sleep 80 && curl -sI <URL>` 验收 HTTP 200（仅 push 后需要）
10. `browser_vision` 移动端截图验收（390px scrollWidth=390）（仅 push 后需要）

### 过程文件卡片的实践建议

- 标题优先保留项目名 + 受众 + 用途，避免过度抽象化
- slug 优先遵循过程文件推荐值，除非与仓库已有命名冲突
- 如果用户要求“写信息卡（agent2）”，默认把任务视为“基于过程文件直接出稿”，而不是重新调研
- 需要保留一份简短的 wiki/raw 记录时，可同步生成一份轻量草稿，便于后续知识页整理

相关细节见：`references/process-file-card-authoring.md`
相关细节见：`references/worktree-draft-pattern.md`（草稿阶段用独立 worktree 隔离，不污染 main）

## 坑点
## 已废止元素（不要用）

- `.stats` / `.stat` — 已删除，改用 `.badge.ink` 内联
- `theme/hardblue.html` — 文件不存在，CSS 需从 SKILL.md 或 `references/hardblue-css-snapshot.md` 获取

## ⚠️ 两套 hardblue CSS 系统（2026-07-26 发现）

存在**两套不同的 hardblue 视觉系统**，必须区分使用：

### A. 蓝手册系统（skill 定义的正式版）✓
变量：`--bg:#f6f4ef`（暖灰网格背景）/ `--paper:#fffdf8`（卡片白）/ `--ink:#111` / `--blue:#1f63ff` / `--red:#d80018` / `--line:#111`
风格：暖灰网格底 + 纯黑边框 + 红色/蓝色/黑色 hero-bar + 3px 黑色边框
来源：`references/hardblue-css-snapshot.md` 和本 SKILL.md

### B. 深蓝 navy 系统（⚠️ 历史遗留变体，禁止用于新卡）
变量：自定义 `--hb-bg` / `--hb-accent` / `--hb-surface` 等
来源：部分已发布旧卡的内联 CSS（LTX-2.3、uTools vs ZTools 等 2026-07-26 发布）
**问题**：这个变体从未被 skill 正式定义，是历史遗留的自定义 CSS。**新卡不要基于旧卡的 embed CSS 套用**，应从 `references/hardblue-css-snapshot.md` 取正式版 CSS。

**验证方法**：发布前检查 `:root` 变量 — 如出现 `--hb-*` 变量则是旧变体，应替换为正式版 `--bg`/`--ink`/`--blue` 体系。
- `npm run build` 依赖 `fix-meta-date.js` 扫描所有 `docs/**/*.meta.yaml`
- GitHub Pages CDN 缓存延迟约 30-120s，push 后立即 curl 可能 404
- **密集网格的边框合并错觉**：当 `grid-2/grid-3` 中的卡片同时使用 2px border + offset shadow（如 6-8px）时，`gap` 小于 16px 容易在视觉上形成“黑线粘连 / 边框合并”。修复优先级：先加大 `gap`，再收紧 shadow，最后才考虑减弱 border。详见 `references/grid-density-border-shadow-gap.md`。
- **内容边框与外层 shell 贴死**：不要用负外边距把 hero 条、装饰条或分区条硬撑到 shell border 上；先提高 shell padding，再去掉 `margin:-...` 这类写法，最后用截图确认四边都有呼吸感。案例与检查方法见 `references/border-overlap-shell-vs-content.md`。
- **先修复，后固化**：遇到外层 shell 和内容框贴边时，先改 `shell` 的内边距并重新截图验收；不要在首次假设未验证时就把规则写进主 SKILL.md。具体流程见 `references/border-spacing-verification-order.md`。

### 坑：GitHub Pages CDN 缓存导致验证失败

**现象**：push 后立即 `curl -sI https://ccwq.github.io/infocard-pub/docs/...` 返回 HTTP 200，但浏览器仍显示旧内容（或 accessibility tree 看不到新元素）。

**根因**：GitHub Pages 部署完成后，CDN 层（Cloudflare 等）缓存 TTL 约 60-120s，期间 cache-busting 不生效。

**解法**：
1. `sleep 80 && curl -sI <URL>` 等待 80s 后验证（适合顺序流程）
2. 缓存破坏：用 `?v=N` 查询参数 `curl -sI https://.../slug.html?v=2`，强制绕过 CDN 缓存读取源站（适合调试）
3. accessibility tree 验证（`browser_navigate` 后的 snapshot）：GitHub Pages 缓存恢复后，snapshot 中会出现新元素的 text content（如 `Star 16.1k`、`分类 7`），旧版则没有

### 坑：`fix-meta-date.js` 导致 CI verify 失败

**现象**：`npm run build` + `npm run verify` 本地通过，但 CI（如 `pages.yml` / `index.yml`）报 `_index.yaml out of date`。

**根因**：`build-site.js` 内调用 `fix-meta-date.js`，后者用 `fs.utimes()` 修改所有 `meta.yaml` 的 mtime（即使内容不变）。这导致 `_sort_ts`（由 HTML 和 meta.yaml 的 mtime 推导）发生变化，与 git 提交时的 `_sort_ts` 不一致。

**解法（标准流程）**：
每个新卡的 `meta.yaml` 必须包含 `updated` 字段：
```yaml
date: "2026-06-07T15:18:25+08:00"
updated: "2026-06-07T15:18:25+08:00"
```
当 `updated` 已存在时，`fix-meta-date.js` 的 `--write` 模式**不修改**文件（`SKIP ... 无需变更`），所以 `_sort_ts` 不变。**不加 `updated` 则每次 build 都会 touch 文件**，导致 CI verify 报不一致。

### 风格选卡参考

| 风格 | 适用内容 | 特征 |
|------|---------|------|
| `infocard-hardblue-style` | 知识手册、工具图鉴、技术调查、提示词库 | 网格底纹、96px 编号块、红/蓝/黑三色 hero-bar |
| `infocard-redswiss-style` | 开源工具图鉴、重型工具对比、CLI 生态 | 红黑斜切 hero、category-dot 色点、纯红黑无蓝 |
| `infocard-q-style` | 单一工具介绍、轻量笔记、教程类 | 纸感暖白、贴纸标签、宽松排版 |
- **蓝技手册风格选择**：如果是纯技术工具类（如 Claude Code / GitHub 项目），优先选 `infocard-hardblue-style`；如果是 Agent workflow / 调研类，优先选 `infocard-blue-technical-manual-style`

## ⚠️ 风格修改工作流（越界陷阱）

当用户说「调整 infocard-hardblue-style 的样式参数」时，**这句话存在作用域歧义**，必须先澄清再做修改：

### 歧义：修改模板 vs 修改当前卡

| 解读 | 影响范围 |
|------|---------|
| A. 只改 `theme/hardblue.html` 模板 | **所有未来** hardblue 卡 |
| B. 只改当前这张卡的 HTML | **仅这一张**卡 |
| A+B. 两个都改 | 两者都变 |

### 错误示范（越界）
用户说"调整 hardblue 样式"，AI 直接改：
1. 当前卡片 HTML ✅
2. `theme/hardblue.html` 模板 ✅
→ 违反命令边界：用户只授权了当前卡，模板不在授权范围内

### 正确流程（≤3 轮 grill-me）

**Round 1：** 澄清作用域
> "你说调整样式，范围是 A（只改模板，影响未来所有卡）、B（只改当前这张卡）、还是 A+B（两个都改）？"

**Round 2（若 A+B）：** 逐项确认参数值
> "确认：模板和当前卡都改以下参数：hero padding 22→16px / h1 clamp→clamp(24px,3.8vw,42px) / alert border 3px→2px？"

**Round 3：** 执行（得到明确授权后）
- A 路径：只改 `theme/hardblue.html`
- B 路径：只改当前 `docs/YYYYMMDD-slug-hardblue.html`
- A+B 路径：两个都改，完成后分别提交推送

**核心原则：** 不在授权范围内（模板）的修改，必须显式问，不能"顺手改"。

### grill-me "继续" = 默认授权，不另计轮次

当用户说"继续"时，意思是"按默认方案执行"，这不算一轮 grill-me。直接执行默认方案。

| 用户说 | 含义 | AI 动作 |
|--------|------|--------|
| "A" / "B" / 选数字 | 明确选项 | 执行对应方案 |
| "继续" / "继续吧" / "OK" | 接受默认方案 | 执行默认，轮次不+1 |
| "不是这个，另外的" | 拒绝当前轮 | 继续下一轮追问 |

## Active theme adapter contract

This package implements `infocard-theme-contract@1`; only its visual language is current. Earlier authoring, worktree, browser and publishing procedures are archived/deprecated compatibility guidance and must not be executed from this package. `infocard-card-authoring`, `infocard-quality-gate` and `infocard-publish-pipeline` own those responsibilities.
