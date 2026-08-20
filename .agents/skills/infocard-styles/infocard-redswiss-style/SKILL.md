---
name: infocard-redswiss-style
description: 红黑瑞士风信息卡 — 用于开源工具图鉴、重型 CLI 生态对比、AI 工具集合类内容。红色斜切 Hero + 纯红黑无蓝配色 + category-dot 色点。模板位于 `theme/redswiss.html`。
category: infocard-styles
tags: [infocard, redswiss, red, black, Swiss, tool, CLI, high-density]
---

# infocard-redswiss-style · 红黑瑞士风

## 定位

用于开源工具图鉴、CLI 生态集合、AI 工具对比等重型多项目内容。视觉锚点：红色斜切 hero + 纯红黑无蓝 + category-dot 色点。

## CSS 变量

```css
:root {
  --bg:      #f5f2ec;   /* 暖米灰背景 */
  --paper:   #fffdf9;   /* 卡片白 */
  --ink:     #0a0a0a;   /* 纯黑 */
  --red:     #c8102e;   /* 红色强调 */
  --soft-red:#fff5f6;   /* 浅红背景 */
  --line:    #0a0a0a;   /* 边框 */
  --shadow:  6px 6px 0 rgba(10,10,10,.10);
}
```

**关键：没有 `--blue`，没有蓝/黄/绿辅助色。**

## ⚠️ 主题引用方式：必须内联 CSS，禁止外部引用 theme 文件（2026-07-13 教训）

**根因**：`<link rel="stylesheet" href="/theme/redswiss.html">` 在 GitHub Pages 部署后会 404（`/theme/redswiss.html` 被解析为 `https://username.github.io/theme/redswiss.html` 而非 `/infocard-pub/theme/redswiss.html`）。

**正确做法**：发布到 infocard-pub 的所有卡必须把 redswiss CSS **内联**到 `<style>` 标签中。`theme/redswiss.html` 仅作为开发参考，不作为生产引用。

```bash
# 从主题文件提取 CSS 内联到 HTML
curl -s "https://ccwq.github.io/infocard-pub/theme/redswiss.html" | \
  python3 -c "
import re, sys
content = sys.stdin.read()
m = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if m: print('<style>' + m.group(1) + '</style>')
"
```

**验证**：发布前检查 HTML 中是否存在 `<link.*stylesheet.*theme`，若存在则必须改为内联 `<style>`。

## 发布级可读性门禁（2026-06-16）

RedSwiss 模板示例里可能出现 8–10px 的标签/说明文字，但给用户发布或重建信息卡时必须按当前 infocard-pub 规范做最终覆盖：

- 移动端与正文可见文字最小字号 **≥ 11.2px**；meta `.sub`、kicker、tagline、table header、flow caption 也算可见文字，不得保留 8/9/10px。
- 发布前用 390px viewport 读取 DOM computed font-size，确认 `small=[]` 或最小值 `>= 11.2`。
- RedSwiss 仍要保持纯红黑：验证 HTML/CSS 中没有 `--blue`，也不要引入蓝/黄/绿辅助变量。
- 若示例 CSS 与本门禁冲突，以本门禁为准；先修当前卡，再考虑回补模板。

## 核心组件参数

### topbar-meta 三行结构（扩展版 · 2026-06-07）

topbar-meta 默认是两行结构，当需要把一个长段落（如"4 大失败模式"）压缩进 meta 区时，可扩展为**三行**：

```css
.topbar-meta {
  padding: 9px 14px;           /* 收紧：旧 14px */
  grid-template-rows: auto auto auto;  /* 三行 */
}
.meta-row-fail {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 5px;
  padding-top: 6px;
}
```

**HTML 示例（Matt Pocock 4 失败模式）：**
```html
<div class="topbar-meta">
  <div class="meta-row-high">...</div>
  <div class="meta-row-low">...</div>
  <div class="meta-row-fail">
    <div class="meta-pill-sm" style="border-left:4px solid var(--red)">Misalign<span class="sub">沟通缺口</span></div>
    <div class="meta-pill-sm" style="border-left:4px solid var(--red)">Verbose<span class="sub">术语未对齐</span></div>
    <div class="meta-pill-sm" style="border-left:4px solid var(--red)">Broken<span class="sub">无反馈闭环</span></div>
    <div class="meta-pill-sm" style="border-left:4px solid var(--red)">Mudball<span class="sub">架构熵增</span></div>
  </div>
</div>
```

**何时用三行**：当内容中有一个"问题/失败模式/原因"列表，每个问题有标题+描述，但它们对决策的权重不足以单独成节时——压缩成 pill 放入 topbar-meta，**删除原 section**，减少信息噪音。

| 行 | 内容 | 样式类 | 说明 |
|----|------|--------|------|
| 上行（2列） | 可信度锚点：Stars / Tests | `.meta-pill-lg` | 15px / 900 |
| 下行（3列） | 能力范围：Harness数 / Public CLIs / 来源 | `.meta-pill-md` / `.meta-pill-sm` | 12px / 800 |

**CSS（已验证，移动端自动切 2列）：**

```css
.topbar-meta {
  padding: 9px 14px;
  border-left: 3px solid var(--line);
  display: grid;
  grid-template-rows: auto auto auto;
  gap: 0;
  align-content: start;
  background: #f6f1f1;
}
.meta-row-high {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;
  padding-bottom: 6px;
  border-bottom: 2px solid var(--line);
  margin-bottom: 5px;
}
.meta-row-low {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 5px;
}
.meta-pill-lg {
  border: 2px solid var(--line);
  padding: 8px 10px 6px;
  background: #fff;
  font-weight: 900;
  font-size: 15px;
  line-height: 1.1;
}
.meta-pill-lg .sub {
  display: block;
  font-size: 9.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: #888;
  margin-top: 2px;
}
.meta-pill-md {
  border: 2px solid var(--line);
  padding: 5px 8px 4px;
  background: #fff;
  font-weight: 800;
  font-size: 12px;
  line-height: 1.2;
}
.meta-pill-md .sub {
  display: block;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: #888;
  margin-top: 1px;
}
.meta-pill-sm {
  border: 2px solid var(--line);
  padding: 4px 7px 3px;
  background: #fff;
  font-weight: 700;
  font-size: 11px;
  color: #666;
  line-height: 1.3;
}
.meta-pill-sm .sub {
  display: block;
  font-size: 8.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: #aaa;
  margin-top: 1px;
}
@media (max-width: 720px) {
  .topbar { grid-template-columns: 1fr; }
  .topbar-meta { border-left: none; border-top: 3px solid var(--line); }
  .meta-row-high, .meta-row-low { grid-template-columns: 1fr 1fr; }
}
```

**HTML 示例（CLI-Anything）：**

```html
<div class="topbar-meta">
  <div class="meta-row-high">
    <div class="meta-pill-lg">42.2k<span class="sub">Stars</span></div>
    <div class="meta-pill-lg">2461<span class="sub">Tests</span></div>
  </div>
  <div class="meta-row-low">
    <div class="meta-pill-md">65<span class="sub">Harness</span></div>
    <div class="meta-pill-md">19<span class="sub">Public CLIs</span></div>
    <div class="meta-pill-sm">HKU<span class="sub">DS Lab</span></div>
  </div>
</div>
```

**HTML 示例（Matt Pocock）：**

```html
<div class="topbar-meta">
  <div class="meta-row-high">
    <div class="meta-pill-lg">16<span class="sub">Skills</span></div>
    <div class="meta-pill-lg">60k<span class="sub">Newsletter</span></div>
  </div>
  <div class="meta-row-low">
    <div class="meta-pill-md">10<span class="sub">Engineering</span></div>
    <div class="meta-pill-md">5<span class="sub">Productivity</span></div>
    <div class="meta-pill-sm">MIT<span class="sub">License</span></div>
  </div>
</div>
```

### Hero / Topbar 其余部分

| 元素 | 值 |
|------|-----|
| `topbar` grid | `grid-template-columns: 1.28fr .72fr`，`margin-bottom: 8px`（旧 14px） |
| `topbar-hero` 背景 | `linear-gradient(135deg, var(--red) 0%, #d92a45 58%, #111 58%, #111 100%)` |
| 斜切比例 | 红→黑 在 58% 处分割 |

### 统计条 `.stats`

flex 横向排列，2px border，统一 box-shadow：
```css
.stats{display:flex;flex-wrap:wrap;border:2px solid var(--line);margin-bottom:14px;overflow:hidden;box-shadow:var(--shadow)}
.stat{flex:1;min-width:60px;padding:10px 12px 8px;border-right:2px solid var(--line);text-align:center;background:#fff}
.stat:last-child{border-right:none}
```

### CLI 网格 `.cli-grid`

4列网格，8px gap，`.cli-card` 内用 `.cat-dot`（8×8px 圆点）表示分类颜色：
```css
.cli-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.cli-card .cat-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--red)}
```

### Section 结构

```css
.section{border:2px solid var(--line);margin-bottom:10px;overflow:hidden;background:var(--paper);box-shadow:var(--shadow)}
.sec-head{background:var(--ink);color:#fff;padding:7px 12px;display:flex;justify-content:space-between;align-items:center}
.sec-head .num{color:var(--red);font-size:13px;font-weight:900}
```

## 标准结构模板

```html
<header class="topbar">
  <div class="topbar-hero">
    <div class="kicker">分类 · 来源</div>
    <h1 class="demo-title">标题<br>副标题</h1>
    <p class="sub-line">副标题说明（max 52ch）。</p>
    <div class="tagline">关键词 · 许可证</div>
  </div>
  <div class="topbar-meta">
    <!-- 两行结构：上行大字，下行三列（见上方 HTML 示例） -->
  </div>
</header>
<div class="stats">
  <div class="stat"><strong>42.2k</strong><span>Stars</span></div>
  <div class="stat"><strong>4k</strong><span>Forks</span></div>
  ...
</div>
<div class="pills">
  <span class="pill red">关键词</span>
  <span class="pill dark">关键词</span>
</div>
<section class="section">
  <div class="sec-head"><span class="num">01</span><span class="label">SECTION NAME</span></div>
  <div class="sec-body">
    <div class="cli-grid">
      <div class="cli-card">
        <div class="cname"><code>tool-name</code></div>
        <p>描述</p>
        <div class="ver">N tests</div>
      </div>
    </div>
  </div>
</section>
```

## topbar-meta grill-me 工作流（≤5 轮）

当用户对 topbar-meta 区域提出调整需求（发截图 + 标注，或说"右上 meta 区要改"）时，用此工作流澄清：

**Round 1**：判断是 A（换数据）/ B（改呈现方式）
> "这里不满意是觉得（a）信息选错了/该换别的数据，还是（b）数据对但呈现方式不对（格式/排列/字号层级）？"

**Round 2（若 B 或 A+B）**：选方案
> "B 类有三层解法：
> - B1 字号分层：Stars/Tests → 大号 bold；Harnesses/CLIs → 中号；Fork/HKU → 小号 muted
> - B2 两行 grid：上行大字（HStars + Tests）；下行三列（Harnesses + CLIs + Fork）
> - B3 改结构：topbar-meta → 2×3 stat-cell（固定行高）
> 选 B1 / B2 / B3 还是 B1+B2 同时？"

**Round 3（确认）**：确认端适配
> "移动端和 PC 端都要考虑适配，选 B1+B2：两行 grid + 三级字号，720px 断点下自动切 2 列。"

**Round 4（执行）**：CSS + HTML + 验证
- 改 `theme/redswiss.html` 模板
- 改当前 `docs/YYYYMMDD-slug-redswiss.html`
- 构建 + 推送 + 截图验收两张卡（当前卡 + 模板演示页）

**Round 5（验收）**：截图确认 4 项
- 两行结构 ✓ | 字重/字号分层 ✓ | 移动端不溢出 ✓ | 整体更紧凑 ✓
  </div>
</section>
```

## `.meta.yaml` 必填字段（含 `path`）

```yaml
slug: "YYYYMMDD-slug-redswiss"
path: "docs/YYYYMMDD-slug-redswiss.html"   # 必须有，否则 build 报"缺少 path 字段"并跳过 date-fix
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

> ⚠️ **坑：`path` 字段缺失会导致 `fix-meta-date.js` 跳过该文件**。build 输出 `SKIP docs/YYYY-slug.html.meta.yaml | 缺少 path 字段`，该卡的 `updated`/`date` 不会被自动修正，后续 CI verify 可能因此失败。**每个 meta.yaml 必须同时包含 `slug` + `path`**，缺一不可。

## 创建流程

1. 读取 `theme/redswiss.html` 作为模板
2. `date '+%Y-%m-%d %H:%M:%S'` 获取时间戳（Asia/Shanghai wall-clock，**不是** `date +'%Y-%m-%dT%H:%M:%S+08:00'`，后者会产生 ISO T/Z 格式导致 CI `verify-meta-timestamps.js` 失败）
3. 写 `docs/YYYYMMDD-slug-redswiss.html`
4. 写 `docs/YYYYMMDD-slug-redswiss.html.meta.yaml`（**必须包含 `updated` 字段**）
5. `npm run build && npm run verify`
6. `git add + commit + push`
7. `sleep 80 && curl -sI <URL>` 验收 HTTP 200
8. `browser_vision` 移动端截图验收

### 单开源项目卡典型结构（新增组件 · 2026-07-07）

当信息卡主体是**单个开源项目**（如 Zvec、cognee、Blinko），而非 CLI 工具集合或事件回顾时，用以下节序列：

| 节号 | 标题 | 组件 | 说明 |
|------|------|------|------|
| 01 | 核心爽点 | `.feature-grid`（2列6格） | 4-6个核心卖点卡片 |
| 02 | 技术架构 | `.arch-diagram`（3列） | 应用→引擎→存储 三层架构图 |
| 03 | vs 对比表 | `.comparison-table` | 4列：维度 / ★项目 / 同类A / 同类B |
| 04 | 适用场景 | `.scenario-list` | 场景名+描述的横排列表 |
| 05 | 快速上手 | `.quick-cmd` + `.code-block` | pip/npm命令 + 代码示例 |
| 06 | 版本新特性 | `.cli-grid`（4列） | 新版本亮点功能 |

**新增组件 CSS：**

```css
/* .arch-diagram：3列架构图 */
.arch-diagram{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:4px}
.arch-cell{border:2px solid var(--line);padding:10px 12px;background:#fff;text-align:center}
.arch-cell .arch-icon{font-size:20px;margin-bottom:5px}
.arch-cell .arch-name{font-weight:900;font-size:12px;margin-bottom:3px}
.arch-cell .arch-desc{font-size:11px;color:#555;line-height:1.4}
.arch-arrow{text-align:center;font-size:18px;font-weight:900;color:var(--red);display:flex;align-items:center;justify-content:center;padding:0 4px}

/* .scenario-list：场景列表 */
.scenario-list{display:flex;flex-direction:column;gap:8px}
.scenario-item{display:grid;grid-template-columns:36px 1fr;border:2px solid var(--line);background:#fff;overflow:hidden;box-shadow:4px 4px 0 rgba(10,10,10,.08)}
.scenario-icon{background:var(--red);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;padding:8px 4px}
.scenario-body{padding:8px 12px}
.scenario-name{font-weight:900;font-size:12px;margin-bottom:2px}
.scenario-desc{font-size:11.5px;color:#444;line-height:1.45}

/* .comparison-table 高亮行 */
.comparison-table .highlight td{background:#fff5f6;font-weight:800}
.badge{padding:2px 6px;border:1.5px solid var(--line);font-size:10px;font-weight:800;background:#fff}
.badge.red{background:var(--red);color:#fff;border-color:var(--red)}

/* .quick-cmd：安装命令高亮条 */
.quick-cmd{background:#0a0a0a;color:#d4d0c8;border:2px solid var(--line);padding:10px 14px;margin-bottom:10px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;font-weight:800;letter-spacing:.02em}
```

**Zvec 卡参考**：`/home/ccwq/qbox/opendir/project/infocard-pub/docs/20260707-zvec.html`

## 坑点

- `references/redswiss-github-research-wiki-sync.md` — GitHub API 调研四源并行模式、Zvec 调研数据样本、Wiki sync 流程与 git add 顺序陷阱
- `references/awesome-design-md-redswiss-pattern.md` — 2026-07-08 VoltAgent/awesome-design-md 卡片版式创新：src-grid（品牌分类网格）、use-flow（三步操作流）、compare（左右对比）；含 anti-pattern 修正：redswiss 允许使用 `--blue/--green/--purple/--orange` CSS 变量作为 badge pill，但不得引入这些变量定义以外的蓝/绿/橙/黄色
- `references/event-retro-redswiss-pattern.md` — event/policy retro layout for redswiss cards (hero + metrics + stance blocks + impact matrix + action).
- `references/redswiss-rebuild-verification-20260616.md` — release-grade RedSwiss DOM audit: 390px overflow, min font >= 11.2px, image natural sizes, and literal `--blue` token check.

### Anti-pattern 修正（2026-07-08）

**原描述**：redswiss "没有 `--blue`，没有蓝/黄/绿辅助色"

**实际情况**：`theme/redswiss.html` 定义了 `--blue`、`--green`、`--purple`、`--orange` 四个 badge 专用 CSS 变量（用于 pill 颜色变体）。发布时可以使用这些变量。

**修正后规则**：
- ✅ 可以使用 `--blue`、`--green`、`--purple`、`--orange` 作为 `.badge` / `.tag` pill 颜色
- ❌ 不得引入这些变量定义以外的蓝/绿/橙/黄色（如 `color: #1e90ff` 或 `rgba(0,136,255)`）
- ❌ 不得将蓝色用于 card / panel 背景色（保留给 `.badge.blue` pill）
- ✅ 所有色值必须源自 `:root` 中已定义的 CSS 变量

### 坑：GitHub Pages CDN 缓存导致验证失败

**现象**：push 后立即 `curl -sI https://...` 返回 HTTP 200，但 `browser_navigate` 后的 accessibility tree 仍显示旧内容（没有新元素 text）。

**根因**：GitHub Pages CDN 缓存 TTL 约 60-120s。

**解法**：
1. `sleep 80 && curl -sI <URL>` 等待后验证
2. 缓存破坏：`curl -sI https://.../slug.html?v=2`，强制绕过 CDN 读取源站
3. accessibility tree 验证：新版内容出现（如 `Star 16.1k`）则部署成功

### 坑：`fix-meta-date.js` 导致 CI verify 失败

**现象**：`npm run build` + `npm run verify` 本地通过，但 CI 报 `_index.yaml out of date`。

**根因**：`fix-meta-date.js` 用 `fs.utimes()` 修改所有 `meta.yaml` 的 mtime，导致 `_sort_ts` 变化，与 git 提交时不一致。

**解法**：每个 `meta.yaml` 必须包含 `updated` 字段（值同 `date`）。当 `updated` 存在时，`fix-meta-date.js --write` 模式 SKIP 该文件，`_sort_ts` 不变。

```yaml
date: "2026-06-07 15:18:25"
updated: "2026-06-07 15:18:25"  # 必须加，防止 CI verify 失败
```

> ⚠️ **格式必须严格为 `YYYY-MM-DD HH:MM:SS` wall-clock，不接受 ISO 8601 格式（如 `2026-06-07T15:18:25+08:00`）**。`verify-meta-timestamps.js` CI gate 会拒绝 ISO T/Z 后缀。

### 常见 HTML 结构错误

- `.cli-card` 不要嵌套：每个卡片单独一个 `<div class="cli-card">`，不要在另一个 `.cli-card` 内再开一个
- `.sec-body` 内可包含 `.cli-grid`、`.stats`、`.code-block` 等子组件
- `.pills` 和 `.cli-grid` 的 gap 不同：pills 用 6px，cli-grid 用 8px

### ⚠️ Git Add 顺序陷阱（Wiki Sync 坑 · 2026-07-07）

Wiki 新文件必须先 `git add` 再 `git commit`，否则 commit 不包含新文件。验证：`git status` 必须干净。详见 `references/redswiss-github-research-wiki-sync.md`。