# pixelstack `.pix` 类应用规则 & stage 结构详解

> 来源：gsap-skills pixelstack 版重建（2026-06-20）。用户反馈："并不符合 infocard-pixelstack-style 的风格"。

## 核心问题

构建 gsap-skills pixelstack 时，我写了一个普通风格的信息卡（只有像素色板、像素边框），漏掉了 pixelstack 三件套的所有 CSS 结构。结果：视觉上像 pixelstack，颜色对，但三件套完全没有。

## `.pix` 类的正确应用对象

`.pix` 类（8角像素装饰边框）是贴在**结构性容器**上的：

| 元素 | 用 `.pix`？ | 边框实现方式 |
|---|---|---|
| `.topbar` | ✅ 是 | 直接加 `.pix` 类 |
| `.hero` | ❌ 否 | 自有 `border:3px solid var(--line); box-shadow:4px 4px 0 0 var(--line)` |
| `.stage` | ❌ 否 | 自有 `border:3px solid var(--line)` + 内部 pseudo-elements |
| `.layer article` | ✅ 是 | 直接加 `.pix` 类 |
| `.footer` | ✅ 是 | 直接加 `.pix` 类 |
| 其他面板（如 `.note`、`.install`） | ✅ 是 | 直接加 |

**关键区分**：`hero` 和 `stage` 是联合使用的，`hero` 外层 + `stage` 内层，`hero` 有自己的描边，`stage` 不需要 `.pix`，因为 stage 的视觉特征靠 pseudo-elements（沙地噪点、底部沙点）建立。

## 正确的 Skeleton（修正版）

```html
<!-- topbar: .pix 直接贴在 topbar 上 -->
<div class="topbar">
  <div class="topbar-line">
    <span class="pixel-dot"></span>
    <span class="topbar-title">repo / name</span>
  </div>
  <div class="topbar-date">MIT · STYLE · 2024</div>
</div>

<!-- hero: .hero 自身有描边，不加 .pix -->
<section class="hero">
  <!-- stage: 舞台，三件套核心区 -->
  <div class="stage">
    <!-- 消散箭头（左侧） -->
    <div class="arrow"></div>
    <!-- 金句（箭头右侧） -->
    <div class="arrow-quote">金句上半句，<br><em>金句下半句</em>。</div>
    <!-- 像素思考者小人 -->
    <div class="character" aria-hidden="true"></div>
    <!-- 金字塔四层 -->
    <div class="pyramid">
      <div class="block l4"><span class="corner"></span>顶层名称<span class="baseline"></span></div>
      <div class="block l3"><span class="corner"></span>第三层<span class="baseline"></span></div>
      <div class="block l2"><span class="corner"></span>第二层<span class="baseline"></span></div>
      <div class="block l1"><span class="corner"></span><div class="slice-grid"><i></i><i></i><i></i><i></i><i></i></div>底层名称<span class="baseline"></span></div>
    </div>
  </div>

  <!-- hero-right: 标题区 -->
  <div class="hero-right">
    <h1 class="hero-title">主标题</h1>
    <p class="hero-lead">导语说明</p>
    <div class="hero-meta"><span>tag1</span><span>tag2</span></div>
    <div class="recall-strip">
      <article>
        <span class="k">LABEL</span>
        <b>结论名</b>
        <p>说明文字</p>
      </article>
      <article>
        <span class="k">LABEL2</span>
        <b>结论名2</b>
        <p>说明文字2</p>
      </article>
    </div>
  </div>
</section>

<!-- layers: 每个 layer article 都加 .pix -->
<section class="layers">
  <article class="layer l1">
    <span class="lvl">L1 · 模块名</span>
    <h3>标题</h3>
    <p>正文说明</p>
    <div class="skills"><span>tag</span></div>
  </article>
  <!-- l2, l3, l4 同理 -->
</section>

<!-- sticky note -->
<div class="note"><b>关键词</b> 说明正文</div>

<!-- footer: 加 .pix -->
<div class="footer">...</div>
```

**错误写法**（之前误传）：
```html
<!-- ❌ 错误：.hero 不需要 .pix -->
<section class="hero pix">

<!-- ❌ 错误：.stage 加 .pix 会覆盖 pseudo-elements 的背景 -->
<div class="stage pix">
```

## stage 的 pseudo-elements 详解

`.stage` 有两个 pseudo-elements，必须同时存在：

```css
.stage::before {
  /* 沙地网格背景（10px 格子 + 20px 点阵） */
  background-image:
    linear-gradient(rgba(45,27,0,.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(45,27,0,.12) 1px, transparent 1px),
    radial-gradient(circle at 50% 50%, rgba(85,139,47,.2) 0 1px, transparent 1px);
  background-size: 10px 10px, 10px 10px, 20px 20px;
}
.stage::after {
  /* 底部沙点噪点（固定高度 14px） */
  height: 14px;
  background-image:
    radial-gradient(circle at 6px 10px, #d6a86a 0 2px, transparent 2px),
    radial-gradient(circle at 18px 6px, #c69356 0 2px, transparent 2px),
    radial-gradient(circle at 30px 11px, #d6a86a 0 2px, transparent 2px);
  background-size: 36px 14px;
}
```

## pyramid block 的结构

每层 block 都有 `.corner`（右上角小方块）和 `.baseline`（底部像素点阵）：

```css
.block .corner {
  position: absolute; right: 6px; top: 6px;
  width: 10px; height: 10px;
  background: rgba(45,27,0,.18);
}
.block .baseline {
  position: absolute; left: 0; right: 0; bottom: 0; height: 6px;
  background: repeating-linear-gradient(90deg, rgba(45,27,0,.25) 0 4px, transparent 4px 8px);
}
```

如果 block 内文字很长，可以在 `.l1` / `.l3` 内部加 `.slice-grid`：

```html
<div class="block l1">
  <div class="slice-grid"><i></i><i></i><i></i><i></i><i></i></div>
  gsap-plugins · gsap-react
  <span class="baseline"></span>
</div>
```

## layer 的 4 层颜色

```css
.layer.l1 .lvl { background: var(--gsap-light); color: var(--gsap); border: 1.5px solid var(--gsap); }
.layer.l2 .lvl { background: var(--blue-pale); color: var(--ink); border: 1.5px solid var(--line); }
.layer.l3 .lvl { background: var(--blue-mid); color: var(--ink); }
.layer.l4 .lvl { background: var(--orange); color: #fff; }
```

GSAP 主题把 L4 改成 GSAP 绿色（`--gsap`）体现品牌色也是可以的，但保留 `--orange` 是标准色。

## 经验教训

1. **pixelstack 不是"像素色+像素边框"**：核心是 CSS pseudo-elements（沙地背景、底部沙点）、box-shadow 像素小人、渐稀消散箭头。这些没有模板就会漏。
2. **先读模板再写卡**：所有 pixelstack 卡片都应从 `theme/pixelstack.html` 复制完整的 `<style>` 块，再填入内容。不要只写色板和 border。
3. **三件套是强制性存在**：缺一个就不算 pixelstack，必须返工。
4. **write_file 超时分文件**：大于 15KB 的 HTML 分 header/body/footer 三段写，避免 stream timeout。
