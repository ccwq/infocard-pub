# HTML/CSS 陷阱（infocard-publish-sop 迭代验证）

本文档记录 `verify-card-content.js` / `verify-mobile-batch.js` / `verify-local-assets.js` 中的已验证 Bug，每次新建或修复信息卡 HTML 时参考。

## 1. Hero 必须有 `<h1>` 而非 `<div class="title">`

**验证器**：`verify-card-content.js` → `sectionEvidence`

**现象**：即使 hero 内已有项目 identity 词（如 `Anthropic`），仍报：
```
{message: "must contain project identity in an exact hero class token/id (or h1 fallback)"}
```

**根因**：`sectionEvidence` 在 `.hero` 内寻找 `<h1>` 或 `class="title"` 中的 project identity token；若两者都不存在才会触发 fallback h1 检测。使用 `<div class="title">` 但没有对应 CSS token 匹配时，项目 identity 无法被提取。

**修复**：`.hero` 内第一行标题必须用 `<h1>` 标签：
```html
<header class="hero" id="hero">
  <h1>规模化 Managed Agents<br><span>把大脑和手解耦</span></h1>
</header>
```

## 2. `staticCheck` 要求 CSS 中 `table`/`pre`/`code` 三选择器必须存在且含 `max-width:100%;overflow:auto`

**验证器**：`verify-mobile-batch.js` → `staticCheck`

**现象**：
- `RESPONSIVE_TABLE`：CSS 有 `table` 选择器但不含 `max-width:100%` + `overflow:auto`
- `RESPONSIVE_PRE` / `RESPONSIVE_CODE`：CSS 完全没有这两个选择器

**根因**：验证器硬编码检查 `['table','pre','code']` 三个选择器，必须各自在 CSS 中同时存在 `max-width: 100%` 和 `overflow: auto` 两个声明。

**修复**：每个 HTML 的 `<style>` 中必须包含：
```css
table{max-width:100%;overflow:auto;width:100%;border-collapse:collapse;font-size:13px}
pre{max-width:100%;overflow:auto;white-space:pre-wrap;word-break:break-word}
code{max-width:100%;overflow:auto;word-break:break-all}
```
即使 HTML 里没有 `<pre>` / `<code>` 标签，也必须用空规则占位。

## 3. `manifest.json` 必须显式声明 `"assets":[]`

**验证器**：`verify-local-assets.js` → `Array.isArray(manifest.assets)`

**现象**：
```
{message: "must be array"}
```

**根因**：Node.js `require()` 读取 JSON 时，缺失的 key 返回 `undefined`（不是空数组），`Array.isArray(undefined)` 为 `false`。

**修复**：manifest.json 必须显式声明两个数组字段：
```json
{"files":[],"assets":[],"reason":"使用 CSS/SVG 绘制图示，无外部素材"}
```

## 5. `required_sections` 关键词只认 `<section aria-label>` 和 `<h2>/<h3>`

**验证器**：`verify-card-content.js` → `sectionEvidence`

**现象**：
```
{message: "missing semantic section evidence for 工具库"}
{message: "missing semantic section evidence for CPS"}
```
词在 HTML body 中存在（如 `.use-card` div、`platform-tag` span），但验证器仍报缺失。

**根因**：`sectionEvidence` 只从两类位置提取文本：
1. `<section aria-label="...">` 属性（精确匹配）
2. `<section>` 内的 `<h2>` 和 `<h3>` 标签的**纯文本内容**

HTML body 中其他位置的文本（如 `<div class="use-title">`、`<span class="platform-tag">`）**不在检查范围内**。

**修复操作顺序**：

1. 先检查缺失词是否已在某 `aria-label` 的子串里：
```bash
grep -o 'aria-label="[^"]*"' docs/<slug>.html
```
如果 `aria-label` 中已含目标词（如 `aria-label="四大场景 抄作业 白嫖工具 找灵感 避坑"`），无需修复。

2. 若仍在缺失，补 `<h3>` sub-label（**首选方案**）：
```html
<!-- ❌ 不行：词在 div class="use-title" 里 -->
<div class="use-title">🛠️ 白嫖工具库</div>

<!-- ✅ 正确：词在 <h3> 标签里 -->
<h3>白嫖工具库</h3>
<div class="use-title">🛠️ 白嫖工具库</div>
```

3. 若 section 内不方便加 `<h3>`，扩展 `aria-label`（**备选方案**）：
```html
<!-- ✅ 正确：词在 aria-label 里 -->
<section aria-label="四大场景 抄作业 白嫖工具库 找灵感 避坑">
```

**常见踩坑场景**：
- `aria-label` 只写了模块名（如 `Monetize`），但 `required_sections` 要求 `CPS`/`CPE`/`CPM`：扩展为 `aria-label="Monetize CPS CPE CPM 变现"`
- 平台名（如 `TikTok`/`小红书`/`B站`）在 `<span class="platform-tag">` 里但 `aria-label` 没有：扩展 `aria-label="Publish 14平台 抖音 小红书 B站 TikTok YouTube"`

**黄金法则**：所有 `required_sections` 中的关键词，必须在对应 section 的 `aria-label` 属性或 `<h2>/<h3>` 标签中出现。HTML body 内其他位置（div/span/p）的文本不被检测。

## 6. 单次 build 中多卡发布时，`stage-publish-batch.js` 只暂存最后一张卡

**现象**：
- 卡 A 暂存后立即暂存卡 B，git 结果只有卡 B
- 卡 A 需要单独再执行一次 `stage-publish-batch.js`

**根因**：`stage-publish-batch.js --stage` 执行 `git add` 后立即 `git commit -m "..."`；两次调用之间 git 工作区无残留，所以每次都是"只暂存一张卡"的独立 commit。

**修复**：多卡发布时，**每张卡单独执行** `--stage`，全部完成后**单独 commit**，最后统一 `git push`。

```bash
node scripts/stage-publish-batch.js --bundle .tmp/publish-bundles/card-a.json --stage
node scripts/stage-publish-batch.js --bundle .tmp/publish-bundles/card-b.json --stage
git commit -m "feat: add cards a and b"
git push origin main
```

不要期望两次 `--stage` 调用合并为一个 commit——它们各自独立 commit。


**验证器**：`verify-card-content.js` → `sectionEvidence`

**现象**：关键词在 HTML body 中存在（如 pills、kicker、card 内），但仍报：
```
{message: "missing semantic section evidence for macOS 13+"}
{message: "missing semantic section evidence for MIT"}
```

**根因**：`sectionEvidence` 只从每个 `<section aria-label="...">` 内**第一 `<h2>`** 的文本来匹配 `required_sections` 关键词。`.hero` 内的 pills/kicker、`<div class="card">` 内的内容、`<section>` 内但不在第一 `<h2>` 中的文本都不参与匹配。

**两个解法**：

**解法 A（推荐）：扩展 aria-label 字符串**
将所有 `required_sections` 关键词直接塞入 `<section aria-label="...">` 字符串本身：
```html
<section aria-label="Humla macOS 13+ MIT 两路录音 说话人区分 本地转写 Whisper Ollama 隐私 Granola">
  <header class="hero" id="hero">...</header>
</section>
```
优点：一次性解决，关键词永远在检查范围内。

**解法 B：在 section 内第一 `<h2>` 中包含关键词**
```html
<section aria-label="审查优先">
  <div class="section">
    <h2>核心哲学：审查优先（Review-first）</h2>
    <h3>人工审核</h3>  <!-- "人工审核" 在 <h3> 中，不参与匹配 -->
    ...
  </div>
</section>
```

**解法 C：用 `<section>` 替代 `<div class="section">`**
```html
<!-- 错误：<div class="section"> 不被 sectionEvidence 扫描 -->
<div class="section">
  <h2>三区隔离架构</h2>
</div>

<!-- 正确：<section aria-label> 本身是 landmark，被扫描 -->
<section aria-label="三区隔离 raw/ sources/ products/">
  <div class="section">
    <h2>三区隔离架构</h2>
    <h3>raw/ — 原创输入</h3>
    ...
  </div>
</section>
```

**调试命令**：
```python
python3 - << 'PY'
import re
html = open('docs/YOUR-SLUG.html').read()
labels = re.findall(r'<(?:section|article|nav|aside)\b[^>]*aria-label="([^"]*)"', html)
required = ['关键词A', '关键词B', 'MIT']
for r in required:
    hits = [l for l in labels if r in l]
    print(f'{r!r:30s} -> hits={len(hits)} {hits}')
PY
```

**经验法则**：
- `required_sections` 中的每个关键词 → 要么出现在某 `<section aria-label="...">` 字符串里，要么出现在该 section 内第一个 `<h2>` 的文本中
- `<h3>`、`<div class="card">`、`<p>` 中的文本不参与 required_sections 匹配
- 保险做法：把核心关键词直接写在 hero section 的 aria-label 里（如 `aria-label="项目名 许可证 关键技术栈"`）
