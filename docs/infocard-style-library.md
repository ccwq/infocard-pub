# Infocard Style Library

> 从 `infocard-pub/docs/**/*.html` 已发布信息卡中提取的复用样式库。目标是减少每次生成信息卡时的视觉漂移，让颜色、间距、组件和移动端行为有统一基线。

## 产物

- `docs/assets/infocard-style.css`：可直接引入的 CSS 样式库。
- `scripts/extract_infocard_styles.py`：从已发布 HTML 重新统计颜色、class、选择器、字号、间距的脚本。
- `tmp_infocard_style_audit.json`：本次扫描临时输出，提交前不必保留。

## 本次提取范围

扫描 `docs/**/*.html`，共 32 个已发布 HTML。高频元素如下：

### 高频颜色

| 颜色 | 用途归一 |
|---|---|
| `#fff` / `#ffffff` | 页面和卡片白底 |
| `#000` / `#000000` / `#111` / `#1a1a1a` | 主文字、黑色标题区、边框 |
| `#e60012` / `#c8102e` / `#b3000f` | 红色强调、标签、分隔线 |
| `#333` / `#666` / `#888` | 次级文字、弱标题 |
| `#f4f4f4` / `#fafafa` / `#e8e8e8` | 灰底、分隔线、弱背景 |

### 高频组件命名

`tag`、`card`、`card-title`、`card-body`、`section`、`section-title`、`stat`、`badge`、`banner`、`banner-title`、`banner-sub`、`footer`、`grid`、`row`、`pill`、`label`、`highlight`。

### 高频尺寸

- 页面宽度：`780px`
- 常用字号：`10px`、`11px`、`12px`、`13px`、`14px`、`16px`、`22px`、`28px`
- 常用间距：`6px`、`8px`、`10px`、`12px`、`14px`、`16px`、`20px`、`24px`、`40px`

## 引入方式

新卡片优先使用外链：

```html
<link rel="stylesheet" href="../assets/infocard-style.css">
```

如果 HTML 位于 `docs/<slug>/index.html`，使用：

```html
<link rel="stylesheet" href="../../assets/infocard-style.css">
```

页面根节点建议：

```html
<html lang="zh-CN" class="ic-page">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
  <link rel="stylesheet" href="../assets/infocard-style.css">
</head>
<body class="ic-page">
  <main class="ic-shell">
    ...
  </main>
</body>
</html>
```

> 关键：移动端必须使用 `width=device-width` 的 viewport。不要只写响应式 CSS，否则真机可能仍按桌面宽度缩小。

## 基础结构模板

```html
<main class="ic-shell">
  <header class="ic-banner">
    <div class="ic-banner__icon">🛡️</div>
    <div class="ic-banner__body">
      <h1 class="ic-banner__title">标题</h1>
      <div class="ic-banner__sub">副标题 · 来源 · 时间</div>
    </div>
    <div class="ic-banner__badges">
      <span class="ic-badge">关键标签</span>
      <span class="ic-badge ic-badge--black">次要标签</span>
    </div>
  </header>
  <div class="ic-divider"></div>

  <div class="ic-meta">
    <div class="ic-meta__item"><span class="ic-meta__label">调查时间</span><span>2026-05-30</span></div>
    <div class="ic-meta__item"><span class="ic-meta__label">数据来源</span><span>公开资料 / GitHub / 访谈</span></div>
  </div>

  <section class="ic-section">
    <h2 class="ic-section__title">核心发现</h2>
    <div class="ic-grid">
      <article class="ic-card">
        <h3 class="ic-card__title">发现 A</h3>
        <div class="ic-card__body">正文内容。</div>
      </article>
      <article class="ic-card ic-card--black">
        <h3 class="ic-card__title">发现 B</h3>
        <div class="ic-card__body">正文内容。</div>
      </article>
    </div>
  </section>

  <footer class="ic-footer">
    <strong>INVESTIGATIVE JOURNALIST</strong>
    <span>2026.05.30 · v1</span>
  </footer>
</main>
```

## 组件规范

### 1. Banner

- 用 `.ic-banner`、`.ic-banner__title`、`.ic-banner__sub`。
- 标题默认 28px，移动端降到 24px。
- 标签放 `.ic-banner__badges`。

### 2. Section

- 每个内容块使用 `.ic-section`。
- 标题使用 `.ic-section__title`，自带红色竖条。
- 不要在每张卡重新发明标题样式。

### 3. Card

- 普通卡：`.ic-card`
- 黑底强调卡：`.ic-card ic-card--black`
- 灰底卡：`.ic-card ic-card--muted`
- 卡片标题：`.ic-card__title`
- 卡片正文：`.ic-card__body`

### 4. 标签 / 徽章

- 普通红色标签：`.ic-tag` / `.ic-badge`
- 黑色标签：`.ic-tag ic-tag--black`
- 线框标签：`.ic-tag ic-tag--line`
- 圆角胶囊：`.ic-pill`

### 5. 统计块

```html
<div class="ic-stat-grid">
  <div class="ic-stat"><span class="ic-stat__num">32</span><span class="ic-stat__label">已发布 HTML</span></div>
</div>
```

移动端自动 2 列。

### 6. 对比表

桌面端保留表格，移动端自动变纵向卡片：

```html
<table class="ic-compare-table">
  <thead>
    <tr><th>维度</th><th>OmniRoute</th><th>CLIProxyAPI</th></tr>
  </thead>
  <tbody>
    <tr><td>Provider 数量</td><td data-label="OmniRoute" class="is-accent">177</td><td data-label="CLIProxyAPI" class="is-muted">配置接入</td></tr>
  </tbody>
</table>
```

移动端规则来自已修复案例：

- `tr` 使用 `padding: 14px 14px 12px`
- `td` 使用 `line-height: 1.68`
- 通过 `data-col-a` / `data-col-b` 给 value cell 补上下文标签

### 7. 参数行 / 配置行

```html
<div class="ic-param"><b>模型</b><span>Qwen3.6-35B</span></div>
```

### 8. 代码 / 注释

```html
<pre class="ic-code">curl ...</pre>
<div class="ic-note ic-note--red">关键风险说明</div>
```

## 颜色 token 使用原则

- 主视觉只使用 `--ic-ink` + `--ic-red` + 白底。
- 需要深红时用 `--ic-red-deep`，不要随意新增红色。
- 灰色层级固定：`--ic-text-muted`、`--ic-text-faint`、`--ic-line`、`--ic-surface-muted`。
- 只有状态语义才使用绿/蓝/橙：`--ic-green`、`--ic-blue`、`--ic-warning`。

## 移动端规则

所有新卡必须满足：

1. `html/body` 不写死 `780px`，只允许 `max-width: 780px`。
2. 必须有 `viewport width=device-width`。
3. grid 在 `max-width: 768px` 下变单列。
4. 对比表在移动端优先变纵向卡片，不优先横向滚动。
5. 手机端卡片边框与正文必须有可感知内边距；不要让标题/正文贴边框。
6. 发布后必须用 cache-busting URL 验证线上源码和真实渲染。

## 迁移策略

### 新卡

直接引入 `infocard-style.css`，只写内容结构和少量页面级覆盖。

### 旧卡

不要一次性全量替换。推荐顺序：

1. 先迁移最近仍在维护的页面。
2. 每次只迁移 1–3 张卡。
3. 迁移后做 390px 移动端视觉验收。
4. 若页面已有强主题样式，只抽取 token，不强行改组件结构。

## 审查清单

- [ ] 是否引入 `docs/assets/infocard-style.css`
- [ ] 是否使用 `ic-page` / `ic-shell`
- [ ] 是否有 viewport
- [ ] 是否复用 `ic-banner` / `ic-section` / `ic-card` / `ic-footer`
- [ ] 是否避免新增随机红色、随机灰色
- [ ] 移动端是否无横向溢出
- [ ] 首屏是否信息密度足够
- [ ] 是否完成视觉确认
