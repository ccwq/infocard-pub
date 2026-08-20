# Blue Technical Manual — CSS Skeleton Reference

> 蓝技手册风格信息卡的完整 HTML/CSS 骨架。重建时从此文件复制基础结构，再填充内容。

## CSS Variables

```css
:root {
  --black:   #0a0a0a;
  --white:   #f5f2ec;
  --red:     #c8102e;
  --blue:    #0036a3;
  --green:   #006b3c;
  --yellow:  #e8c200;
}
```

## Page Shell

```html
<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>TITLE</title>
<style>
/* ===== RESET ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body {
  background: var(--black);
  font-family: 'PingFang SC','Microsoft YaHei', sans-serif;
  text-align: center;
  color: var(--black);
}
.page {
  max-width: 720px;
  margin: 0 auto;
  background: var(--white);
  padding: 0 0 80px 0;
  text-align: left;
}
.card {
  border: 3px solid var(--red);
  background: var(--white);
  overflow: hidden;
}
</style>
</head>
<body>
<div class="page">
<div class="card">
  <!-- content here -->
</div>
</div>
</body>
</html>
```

## .header — 黑头红渐变三栏

```html
<div class="header">
  <div class="header-title">HERMES ONE</div>
  <div class="header-sub">一句话定位</div>
  <div class="header-pills">
    <span class="pill pill-blue">Agent</span>
    <span class="pill pill-red">Workflow</span>
    <span class="pill pill-green">Skill</span>
  </div>
</div>
```

```css
.header {
  background: linear-gradient(135deg, #c8102e 0%, #a90f27 100%);
  padding: .85rem 1.2rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .5rem;
}
.header-title {
  font-size: 1.6rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: .05em;
  flex: 1 1 100%;
}
.header-sub {
  font-size: .85rem;
  color: rgba(255,255,255,.85);
  flex: 1 1 auto;
}
.header-pills {
  display: flex;
  gap: .35rem;
  flex-wrap: wrap;
}
.pill {
  padding: .2rem .55rem;
  border-radius: 3px;
  font-size: .72rem;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #fff;
}
.pill-blue  { background: var(--blue); }
.pill-red  { background: var(--red); }
.pill-green{ background: var(--green); }
```

## .stats — 四列数字锚点

```html
<div class="stats">
  <div class="stat">
    <div class="stat-num">5</div>
    <div class="stat-label">Repos</div>
  </div>
  <div class="stat">
    <div class="stat-num">100+</div>
    <div class="stat-label">Skills</div>
  </div>
  <div class="stat">
    <div class="stat-num">261</div>
    <div class="stat-label">Plugins</div>
  </div>
  <div class="stat">
    <div class="stat-num">30K+</div>
    <div class="stat-label">Views</div>
  </div>
</div>
```

```css
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: var(--black);
  border-bottom: 3px solid var(--red);
}
.stat {
  padding: .6rem .4rem;
  text-align: center;
  border-right: 1px solid #222;
}
.stat:last-child { border-right: none; }
.stat-num {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--red);
  font-family: 'Courier New', monospace;
}
.stat-label {
  font-size: .7rem;
  color: #aaa;
  margin-top: .1rem;
  text-transform: uppercase;
  letter-spacing: .05em;
}
```

## .warning — 红竖条警告框

```html
<div class="warning-box">
  <div class="warning-bar"></div>
  <div class="warning-text">
    <strong>前提条件 / 边界 / 注意事项</strong>
  </div>
</div>
```

```css
.warning-box {
  display: flex;
  background: #fff5f5;
  border-bottom: 1px solid var(--red);
  font-size: .82rem;
}
.warning-bar {
  width: 4px;
  background: var(--red);
  flex-shrink: 0;
}
.warning-text {
  padding: .6rem .8rem;
  color: var(--red);
}
```

## .section — 编号章节

```html
<div class="section">
  <div class="section-num">01</div>
  <div class="section-body">
    <div class="section-title">章节标题</div>
    <div class="section-content">正文内容…</div>
  </div>
</div>
```

```css
.section {
  display: flex;
  border-bottom: 1px solid #ddd;
}
.section-num {
  width: 2.8rem;
  background: var(--red);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 900;
  display: flex;
  align-items: flex-start;
  padding: .6rem .4rem;
  flex-shrink: 0;
  font-family: 'Courier New', monospace;
}
.section-body {
  flex: 1;
  padding: .6rem .8rem;
}
.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--black);
  margin-bottom: .3rem;
}
.section-content {
  font-size: .85rem;
  line-height: 1.65;
  color: #333;
}
```

## .code-box — 代码块

```html
<div class="code-box">
  <pre><code>code content here</code></pre>
</div>
```

```css
.code-box {
  background: #1a1a2e;
  padding: .8rem 1rem;
  margin: .5rem 0;
  overflow-x: auto;
}
.code-box pre {
  margin: 0;
  white-space: pre;
}
.code-box code {
  color: #e0e0e0;
  font-size: .78rem;
  font-family: 'Courier New', monospace;
  line-height: 1.6;
}
```

## .flow — SVG 流程图

```html
<div class="flow-box">
  <svg viewBox="0 0 720 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;">
    <defs>
      <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="#888"/>
      </marker>
    </defs>
    <!-- nodes + arrows -->
  </svg>
</div>
```

```css
.flow-box {
  padding: .6rem .8rem;
  background: #f8f8f8;
  overflow-x: auto;
}
```

## .grid2 — 双列对照

```html
<!-- ⚠️ 必须加 !important 内联样式，防止浏览器 stealth 扩展覆盖 grid-template-columns -->
<div class="grid2" style="grid-template-columns: calc(50% - 4px) calc(50% - 4px) !important; display: grid !important; gap: 8px;">
  <div class="grid-item grid-item-fit">
    <div class="grid-item-title">适合场景</div>
    <div class="grid-item-content">…</div>
  </div>
  <div class="grid-item grid-item-not">
    <div class="grid-item-title">不适合场景</div>
    <div class="grid-item-content">…</div>
  </div>
</div>
```

```css
.grid2 {
  display: grid;
  grid-template-columns: calc(50% - 4px) calc(50% - 4px); /* fallback; must be overridden by inline !important */
  gap: 8px;
}
.grid-item {
  background: var(--white);
  padding: .7rem .9rem;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
.grid-item-fit { border-left: 3px solid var(--green); }
.grid-item-not  { border-left: 3px solid var(--red); }
.grid-item-title {
  font-size: .78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .05em;
  margin-bottom: .3rem;
}
.grid-item-content {
  font-size: .82rem;
  line-height: 1.55;
}
```

⚠️ **grid2 必须有内联 `!important`**：Hermes Browserbase stealth 功能会注入 `grid` 简写覆盖 `grid-template-columns`，导致列宽不等。CSS 里写 `grid-template-columns: repeat(2, 1fr)` 不够，必须在 HTML div 上加 `style="grid-template-columns: calc(50% - 4px) calc(50% - 4px) !important; display: grid !important; gap: 8px;"`。

## .img-gallery — 图片画廊（蓝技手册插图标准结构）

当卡片需要合并配图时（如技术示意图、终端截图、流程图），使用此结构。插入位置通常是 `pattern-grid` 之后、`scenario-list` 之前，作为独立 `section`（编号用 📷 emoji 或蓝色背景）。

### CSS

```css
/* ── 图片画廊 ── */
.img-gallery {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.gallery-row {
  display: grid;
  gap: 6px;
}
.gallery-row.row-1 { grid-template-columns: 1fr; }
.gallery-row.row-2 { grid-template-columns: 1fr 1fr; }
.gallery-row.row-3 { grid-template-columns: 1fr 1fr 1fr; }
.gallery-item {
  background: #f5f2ec;
  border: 1px solid var(--gray-5);
  overflow: hidden;
}
.gallery-item img {
  width: 100%;
  height: auto;
  display: block;
  border: none;
}
.gallery-caption {
  padding: 4px 8px;
  font-size: 10px;
  color: var(--gray-6);
  line-height: 1.4;
  background: #f5f2ec;
  border-top: 1px solid var(--gray-5);
}
.gallery-caption strong { color: var(--black); font-weight: 700; }
```

### HTML 结构

```html
<section class="section">
  <div class="sec-head">
    <div class="sec-no" style="background:var(--blue);">📷</div>
    <div class="sec-title">
      <h2>配图说明：工作流架构与实操界面</h2>
      <p>来源：XXX · CC 4.0 BY-SA 协议</p>
    </div>
  </div>
  <div class="img-gallery">
    <!-- 单行大图（主图） -->
    <div class="gallery-row row-1">
      <div class="gallery-item">
        <img src="assets/images/YYYYMMDD-card-slug/main-diagram.png"
             alt="描述"
             onerror="this.style.display='none';this.nextElementSibling.style.display='block';"
             loading="lazy"/>
        <div class="gallery-caption" style="display:none;">⚠ 图片加载失败</div>
        <div class="gallery-caption"><strong>图1：标题</strong><br/>图内要点说明</div>
      </div>
    </div>
    <!-- 双列图片 -->
    <div class="gallery-row row-2">
      <div class="gallery-item">
        <img src="assets/images/YYYYMMDD-card-slug/diagram-a.png" alt="描述" loading="lazy"/>
        <div class="gallery-caption" style="display:none;">⚠</div>
        <div class="gallery-caption"><strong>图2：标题A</strong><br/>说明A</div>
      </div>
      <div class="gallery-item">
        <img src="assets/images/YYYYMMDD-card-slug/diagram-b.png" alt="描述" loading="lazy"/>
        <div class="gallery-caption" style="display:none;">⚠</div>
        <div class="gallery-caption"><strong>图3：标题B</strong><br/>说明B</div>
      </div>
    </div>
  </div>
</section>
```

### 图片获取标准流程

1. **优先从 X 帖本身提取**：`browser_console` 遍历 `article` 元素 → 找 `<img>` → 过滤 profile/emoji/icon → 下载
2. **次选相关博客/平台**：CSDN、博客园等技术平台常嵌入原帖图片 → 直接下载
3. **本地化**：下载到 `docs/assets/images/YYYYMMDD-card-slug/` 再引用，**不要**直接引用外部 URL
4. **下载命令**：`curl -sL -o filename.png '<url>'`
5. **验收**：`curl -sI '<pages-url>/docs/assets/images/...'` 返回 HTTP 200 + `naturalWidth > 0`
6. **onerror 处理**：每个 `<img>` 必须有 `onerror` + 备用 caption，防止单图失败破坏整卡

### 布局原则

- `row-1` 单行大图放对比图/架构图；`row-2` 双列放概念图或截图对；可混合使用
- caption 必须包含：图号 + 标题 + 图内关键信息（不描述图片质量）
- 来源说明放在 section 标题副文本里（如"来源：CSDN · CC 4.0 BY-SA"）
- 移动端全部降级为 `grid-template-columns: 1fr`

## .footer — 来源行

```html
<div class="footer">
  <span>来源：@XAMTO_AI · 2026-06-06</span>
  <button class="save-btn" onclick="saveCard()">保存 PNG</button>
</div>
```

```css
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: .7rem 1rem;
  background: #eee;
  font-size: .72rem;
  color: #666;
}
.save-btn {
  background: linear-gradient(135deg, #c8102e, #a90f27);
  color: #fff;
  border: none;
  padding: .4rem .9rem;
  border-radius: 6px;
  font-size: .75rem;
  font-family: 'Courier New', monospace;
  cursor: pointer;
  position: fixed;
  bottom: 18px;
  right: 18px;
  z-index: 999;
}
```

## Mobile Responsive

```css
@media (max-width: 720px) {
  .stats { grid-template-columns: repeat(2, 1fr); }
  .stats .stat:nth-child(2) { border-right: none; }
  .grid2 { grid-template-columns: 1fr; }
  .section-num { width: 2rem; font-size: .9rem; }
  .header { padding: .7rem .8rem; }
  .save-btn { bottom: 12px; right: 12px; }
}
@media (max-width: 400px) {
  .page { padding: 0; }
  .stat-num { font-size: 1.1rem; }
}
```

## Common Mistakes

| 错误 | 说明 |
|---|---|
| 从其他卡片复制 HTML 后只换颜色 | 这是"换皮"，不是"重建"。必须从零用本骨架。 |
| 省略 `.card` 外框的 `border: 3px solid var(--red)` | 红框是蓝技手册的核心视觉锚点。 |
| `.header` 用蓝底而非红渐变 | 蓝技手册的黑头 = 红渐变，不是蓝。 |
| 省略 `.stats` 或改成文字列表 | 四列数字锚点是第一屏核心。 |
| `.section` 没有红竖条编号 | 编号 + 红竖条 = 技术手册的识别特征。 |
| `.grid2` 没有 `!important` 内联样式 | stealth 扩展覆盖列宽，导致 80px vs 275px 不等分。必须加 inline `!important`。 |
| 省略 `.warning-box` | warning 是蓝技手册的结构性组件，不是可选装饰。 |