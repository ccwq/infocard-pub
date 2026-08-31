# HTML 验证门禁的结构性陷阱（2026-07-12 实录）

## 1. verify-card-content.js — sectionEvidence 只读 `<section>` 内第一 `<h2>`

症状：required_sections 验证总是报 missing semantic section evidence，即使 HTML 中已包含对应标题。

根因：sectionEvidence 函数只从两类来源提取证据：
- 所有 h1-h6 标题
- section/article/nav/aside 的 id、aria-label、data-section 属性
- 以及这些 landmark 内部第一个 h1-h6

h3 标签如果被 div.card 包裹而非直接作为 section 的第一个子元素标题，则不会被捕获。

**正确写法：**
```html
<section aria-label="不要养宠物">
<div class="section">
  <h2>不要养宠物：耦合架构的代价</h2>   ← 被 sectionEvidence 捕获
  <div class="grid2">
    <div class="card"><h3>问题</h3>...</div>   ← h3 不被捕获，但可接受
  </div>
</div>
</section>
```

**错误写法（踩过）：**
```html
<div class="grid2">
  <div class="card">
    <h3>不要养宠物：耦合架构的代价</h3>   ← 不被 sectionEvidence 捕获
  </div>
</div>
```

修复：对每个章节用 `<section aria-label="章节关键词">` 包裹，内部第一个 `<h2>` 作为标题。

## 2. verify-mobile-batch.js — staticCheck 要求 table/pre/code CSS 选择器存在且含响应式声明

症状：npm run build 通过，但 verify-mobile-batch.js 报告 RESPONSIVE_TABLE/PRE/CODE 错误。

根因：staticCheck 解析 CSS，检查 table/pre/code 三个选择器是否同时包含 `max-width: 100%` 和 `overflow: auto`。这些选择器即使 HTML 中不存在对应标签也必须存在。

**修复：** 在 CSS 中添加这些规则（无论标签是否被使用）：
```css
table{max-width:100%;overflow:auto;width:100%;border-collapse:collapse;font-size:13px}
pre{max-width:100%;overflow:auto;white-space:pre-wrap;word-break:break-word}
code{max-width:100%;overflow:auto;word-break:break-all}
```

注意：不要使用内联 `style="..."` 在 table 上——静态检查只看 CSS 选择器，内联样式不满足选择器级别的规则检查。

## 3. verify-card-content.js — hero 检查：`id="hero"` 时必须有 `<h1>`

症状：`hero` 验证报错 `must contain project identity in an exact hero class token/id (or h1 fallback)`，即使 hero 内包含项目标识文本。

根因：门禁逻辑先找 `<header class="hero" id="hero">`，若存在则在此 header 内找 `<h1>` 或带 `id="hero"` 的元素。**若有 `id="hero"` 但内部是 `<div class="title">` 而非 `<h1>`，fallback 到无 id 的 h1 检测不会触发**，仍报错。

**正确写法（踩过，2026-07-12）：**
```html
<header class="hero" id="hero">
  <h1>规模化 Managed Agents<br><span>把大脑和手解耦</span></h1>
  <p class="lead">...</p>
</header>
```

**错误写法：**
```html
<!-- ❌ 有 id="hero" 但无 <h1>，fallback 不触发，报 hero 错误 -->
<header class="hero" id="hero">
  <div class="title">规模化 Managed Agents<br><span>...</span></div>
</header>
```

## 4. verify-local-assets.js — manifest.json 缺少 `assets` 字段

症状：本地资产门禁报错 `must be array`，即使 manifest 中 `files` 是空数组。

根因：`scripts/verify-local-assets.js` 第 85 行：
```javascript
if (!Array.isArray(manifest.assets)) errors.push(...)
```
Node.js `require()` 解析 JSON 时，若文件只有 `{"files":[],"reason":"..."}` 而没有 `"assets"` 键，则 `manifest.assets` 为 `undefined`，`Array.isArray(undefined)` → false。

**正确写法（踩过，2026-07-12）：**
```json
{"files":[],"assets":[],"reason":"Anthropic 官方博客无外部素材，使用 CSS/SVG 绘制架构图示"}
```

**错误写法：**
```json
{"files":[],"reason":"无外部图片"}
// → manifest.assets = undefined → 报错 "must be array"
```

教训：manifest.json **必须同时包含 `files` 和 `assets` 两个键**，即使都是空数组。

## 教训总结

- 写新卡片时先用 Python 提取 sectionEvidence，确认 required_sections 中的每个词都能在 evidence 列表中找到子串匹配。
- 所有 section 必须加 `aria-label`，第一个子元素必须是 `h2`。
- CSS 必须显式声明 `table`/`pre`/`code` 的响应式规则，即使 HTML 中没有这些标签。
- hero 标题用 `<h1>` 而非 `<div class="title">`。
- manifest.json 必须有 `assets` 键，不能只写 `files`。

## 调试方法

用 Python 模拟门禁逻辑，提取实际 evidence 列表：
```python
import re, unicodedata
html = open('docs/20260712-anthropic-managed-agents.html').read()
NAMED = {'nbsp':' ','amp':'&','lt':'<','gt':'>','quot':'"','apos':"'",'colon':':','sol':'/'}
def decode(t):
    def rep(m): return NAMED.get(m.group(1), m.group(0))
    return re.sub(r'&(#?\w+);', rep, t)
# 提取 section landmark 内第一 h2
for m in re.finditer(r'<(section|article|nav|aside)\b[^>]*aria-label="([^"]*)"[^>]*>([\s\S]*?)</\1>', html):
    label = m.group(2)
    inner = m.group(3)
    h2s = re.findall(r'<h2[^>]*>([\s\S]*?)</h2>', inner)
    if h2s:
        print(label, '->', h2s[0][:50])
```
