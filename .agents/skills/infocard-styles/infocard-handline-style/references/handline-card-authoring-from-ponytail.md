# Handline 卡必须从 ponytail 卡片复制结构

## 核心教训（2026-06-13）

**症状**：新建 `20260613-openskynet.html` 时写了纯 HTML，没有复用 handline 的 CSS/JS 骨架，结果卡片看起来像"白底细黑线普通卡片"，完全不像 handline 风格。

**根因**：handline 的视觉识别度来自两套机制：
1. **内联 CSS**：完整的 token 系统、`.tag-chip`、`.frame`、`.stats-box`、`.quote-band`、`.columns` 等组件类
2. **内联 JS 脚本**：SVG 手绘边框生成器（`jitter` + `mk` + `roughRect` + `drawRough` + `initRough`）

这两套机制**都在 ponuta 卡的 `<style>` 和 `<script>` 块里**，不是从外部文件加载。`/theme/handline.js` **不存在**，引用它会 404。

## 正确工作流

### 第一步：从 ponytail 复制 HTML 骨架

```bash
cp docs/20260613-ponytail.html docs/YYYYMMDD-newcard.html
```

### 第二步：清空内容，保留结构

保留的内容（必须原样保留）：
- `<style>` 块（所有 handline CSS token + 组件类）
- `<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>`
- html2canvas 初始化脚本（`saveBtn` 事件监听）
- parent postMessage height 脚本
- **SVG 手绘边框生成器脚本**（`jitter` → `mk` → `roughRect` → `drawRough` → `initRough`）
- 所有 class 名称（`.frame`, `.rough-box`, `.tag-chip`, `.stats-box`, `.quote-band`, `.compare-two`, `.columns`, `.section-card`, `.section-kicker`, `.install-item`, `.skill-tag`, `.use-case`, `.footer` 等）

### 第三步：填入新内容

替换文字内容时，**不要动 class 名称、不要动 HTML 结构层级**。

### 第四步：构建并提交（含 index 工件）

```bash
npm run build   # 同时更新 _index.yaml 和 index.html
npm run verify

# 立即提交所有产物（同一 commit）
git add docs/YYYYMMDD-newcard.html docs/YYYYMMDD-newcard.html.meta.yaml _index.yaml index.html
git commit -m "Add YYYYMMDD-newcard handline card"
GIT_HTTP_VERSION=HTTP/1.1 git push
```

**关键坑（2026-06-13 新增）**：`npm run build` 会修改 `_index.yaml` 和 `index.html`。如果只 commit 新卡文件而漏掉这两项，CI 的 "Verify Generated Index Artifacts" 会失败（repo 里的 index 比构建产物旧）。Pages 部署也会失败，因为 `_index.yaml` 不含新卡 slug。**必须把 index 工件和新卡文件放在同一 commit。**

恢复方法：补 commit index 工件即可。
```bash
git add _index.yaml index.html
git commit -m "Update index for YYYYMMDD-newcard card"
GIT_HTTP_VERSION=HTTP/1.1 git push
```

### 第五步：验收

```bash
# 等 10-20 秒（GitHub Pages ~70-90s 部署延迟）
curl -sI "https://ccwq.github.io/infocard-pub/docs/YYYYMMDD-newcard.html" | head -1
curl -s "https://ccwq.github.io/infocard-pub/docs/YYYYMMDD-newcard.html" | grep "drawRough"
curl -s "https://ccwq.github.io/infocard-pub/docs/YYYYMMDD-newcard.html" | grep "tag-chip"
curl -s "https://ccwq.github.io/infocard-pub/_index.yaml" | grep "YYYYMMDD-newcard"
```

## 常见失败模式

### ❌ 错误：从零写 HTML

没有 handline CSS token、没有 `rough-box` JS、没有 `.tag-chip` 样式。卡片看起来像普通静态页。

### ❌ 错误：引用不存在的 `/theme/handline.js`

```html
<!-- ❌ 这种引用会 404，因为 handline.js 不存在于仓库 -->
<script src="/theme/handline.js?v=1"></script>
```

handline 的 JS 脚本**必须内联**在每个 HTML 卡片的 `<script>` 块底部。

### ❌ 错误：只保留 HTML 结构，不保留 JS 脚本

```html
<!-- ❌ rough-box 类元素没有 JS 生成器，边框就是普通 CSS 边框 -->
<div class="frame rough-box">...</div>
```

每个带 `.rough-box` 的元素都依赖 JS 在 DOMContentLoaded 时注入 SVG 抖动路径。没有 JS = 没有手绘边框。

### ❌ 错误：build 后不 commit index 工件

```bash
# ❌ 只 commit 新卡文件，漏掉 _index.yaml 和 index.html
git add docs/YYYYMMDD-newcard.html docs/YYYYMMDD-newcard.html.meta.yaml
git commit -m "Add YYYYMMDD-newcard" && git push
# → CI 失败：Verify Generated Index Artifacts completed failure
```

### ✅ 正确：JS 脚本内联在 HTML 底部

```html
<script>
function jitter(v, amt) { return v + (Math.random() - 0.5) * amt; }
function mk(tag, attrs) {
  var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (var k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}
function roughRect(x, y, w, h, opts) {
  opts = opts || {};
  var r = opts.roughness || 1.2, sw = opts.strokeWidth || 2;
  var sc = opts.stroke || '#1a1a1a';
  var g = mk('g', {});
  var points = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  var d = 'M ' + jitter(points[0][0], r * 2) + ' ' + jitter(points[0][1], r * 2);
  for (var i = 0; i < 4; i++) {
    var p1 = points[i], p2 = points[(i + 1) % 4];
    var segs = 4;
    for (var s = 1; s <= segs; s++) {
      var t = s / segs;
      d += ' L ' + jitter(p1[0] + (p2[0] - p1[0]) * t, r * 2) + ' ' + jitter(p1[1] + (p2[1] - p1[1]) * t, r * 2);
    }
  }
  d += ' Z';
  var path = mk('path', {d: d, stroke: sc, 'stroke-width': sw, fill: 'none','stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  g.appendChild(path);
  return g;
}
function drawRough(el) {
  var rect = el.getBoundingClientRect();
  if (rect.width < 8 || rect.height < 8) return;
  var svg = mk('svg', {width: rect.width + 4, height: rect.height + 4, style: 'position:absolute;top:-2px;left:-2px;pointer-events:none;overflow:visible;z-index:0'});
  el.insertBefore(svg, el.firstChild);
  svg.appendChild(roughRect(2, 2, rect.width, rect.height, {roughness: 1.2, strokeWidth: 2, stroke: '#1a1a1a'}));
  el.style.position = el.style.position || 'relative';
}
function initRough() { Array.prototype.slice.call(document.querySelectorAll('.rough-box')).forEach(drawRough); }
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initRough); else initRough();
window.addEventListener('resize', function() { document.querySelectorAll('.rough-box svg').forEach(function(s){ s.parentNode.removeChild(s); }); initRough(); });
</script>
```

## ponytail 卡的关键结构

```
<body>
  <main class="page" id="card">
    <div class="frame rough-box">          ← 外框，JS 生成手绘边框
      <div class="topbar">               ← 顶部标题栏（蓝色）
      <section class="hero">              ← 主内容区（标题 + stats-box）
        <div>
          <h1 class="hero-title">        ← Serif 大标题
          <p class="hero-lead">          ← 副标题
          <div class="hero-note">        ← tag-chip 标签行
        </div>
        <div class="stats-box rough-box"> ← 深色数据盒（JS 边框）
      <div class="quote-band rough-box">  ← 橙沙渐变引用条
      <div class="compare-two rough-box"> ← Before/After 对比
      <div class="columns">               ← 三列布局
        <div class="section-card rough-box"> × 3
      <div class="footer rough-box">      ← 底部虚线框
    </div>
  </main>
  <div class="save-wrap">
    <button id="saveBtn">保存 PNG</button>
  </div>
  <script html2canvas>...</script>        ← 保存功能
  <script postMessage>...</script>         ← iframe 高度上报
  <script roughRect JS>...</script>        ← 手绘边框生成器
</body>
```

## 验证命令

```bash
# 检查是否有 roughRect JS（没有 = 失败）
curl -s URL | grep "function drawRough"
# 检查是否有 tag-chip
curl -s URL | grep "tag-chip"
# 检查 _index.yaml 是否包含新卡（漏 commit index 工件的特征）
curl -s "https://ccwq.github.io/infocard-pub/_index.yaml" | grep "YYYYMMDD-newcard"
```