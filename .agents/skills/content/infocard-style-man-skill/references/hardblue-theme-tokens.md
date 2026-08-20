# hardblue Theme CSS Token System

## Source of Truth

Canonical template: `docs/20260610-obscura.html` (29,492 bytes)

## Token Values

```css
:root{
  --red:#c8102e;     /* 红：主强调、section-no 块背景、card 边框、footer 顶部 */
  --black:#0a0a0a;   /* 黑：card 边框、tag 深色、quote 背景、code 背景 */
  --white:#f5f2ec;   /* 白：card 背景、quote 文字 */
  --gray1:#171717;   /* 深灰1：body 背景色板 */
  --gray2:#2b2b2b;   /* 深灰2 */
  --gray3:#666;      /* 中灰 */
  --gray4:#aaa;      /* 浅灰 */
  --gray5:#ddd;     /* 边框灰 */
  --blue:#0036a3;   /* 蓝：blue card 背景 */
  --green:#006b3c;  /* 绿：green card 背景 */
  --yellow:#e8c200; /* 黄：yellow tag 背景 */
}
```

## Body Background Pattern

hardblue 的 body 背景是深色 + 网格纹理：

```css
body{
  background:
    radial-gradient(circle at 20% 0%,rgba(200,16,46,.08),transparent 28%),
    linear-gradient(0deg,rgba(255,255,255,.02) 1px,transparent 1px) 0 0/100% 38px,
    linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px) 0 0/38px 100%,
    var(--black);
}
```

不要替换成纯色、渐变或暖米色。

## Card Structure

- `.page`: `width:min(780px,calc(100% - 16px)); margin:0 auto; padding:10px 0 96px`
- `.card`: `border:3px solid var(--red); background:var(--white); box-shadow:8px 8px 0 rgba(0,0,0,.16)`
- 红色 3px 边框 + 黑色 8px 阴影（硬核手册感）

## Header (Hero)

```html
<header class="header">
  <!-- grid 布局，背景渐变 -->
  <div class="hero-copy">...</div>
</header>
```

背景：`linear-gradient(180deg, var(--red), #aa0f26)`，底部 `border-bottom: 3px solid var(--black)`

## Stats Bar

```html
<div class="stats">
  <div class="stat">
    <div class="k">KEY</div>
    <div class="v">VALUE</div>
    <div class="d">description</div>
  </div>
</div>
```

背景白色，黑色 2px 边框，v 值红色

## Section Blocks

- `.section`: `margin-top:32px; border-top:2px solid var(--black); padding:16px 14px 0`
- `.section-head`: grid(88px | 1fr)，左侧编号块，右侧 meta
- `.section-no`: `width:88px; height:88px; border:2px solid var(--black); background:var(--red); color:#fff; font-size:30px`
- 编号块是 hardblue 的视觉核心标志

## Grid Variants

```css
.grid2 { grid-template-columns: repeat(2, minmax(0,1fr)); }
.grid3 { grid-template-columns: repeat(3, minmax(0,1fr)); }
.grid4 { grid-template-columns: repeat(4, minmax(0,1fr)); }
```

## Card Variants

- `.cardbox`: 白底 2px 黑边框
- `.cardbox.dark`: #111 底白字
- `.cardbox.blue`: #0036a3 底白字
- `.cardbox.soft`: #f7f6f2 浅灰底
- `.cardbox.green`: #eefbf1 浅绿底

## Tag / Chip / Badge

- `.chip`: 白底白边框，浅色字
- `.chip.dark`: #111 底白字
- `.chip.red`: 白底红字红框
- `.chip.blue`: 白底蓝字蓝框
- `.tag`: 白底黑边框黑色字体
- `.tag.red/.blue/.green/.dark/.yellow`: 对应色背景

## Save Button

```css
.save{
  display:block;
  width:fit-content;
  position:static;       /* 不用 fixed，避免遮挡正文 */
  margin:14px 0 0 auto;
  background:linear-gradient(135deg,#c8102e,#a10f25);  /* 红渐变，不是蓝 */
  ...
}
```

## Anti-patterns Summary

| 错误 | 正确 |
|------|------|
| 引入 orange/amber 色系 | 严格用红黑蓝绿黄 |
| 暖米色 body 背景 | 深色 + 网格纹理 |
| 蓝色 save 按钮 | 红渐变 save 按钮 |
| 浅灰 1px 边框 | 3px solid 红边框 |
| 软阴影 | `8px 8px 0 rgba(0,0,0,.16)` 黑色硬阴影 |
| 小写 section 编号 | 88×88px 大写编号块 |