# grid2 列不等分：浏览器扩展注入 bug 与修复

## 问题现象

移动端（390px）下，`.grid2` 的两列不等分：
- 左侧卡片约 80px，右侧约 275px（极不平衡）
- CSS 中 `grid-template-columns: repeat(2, 1fr)` 或 `minmax(0, 1fr) minmax(0, 1fr)` 均无效
- 浏览器 computed style 显示 `grid-template-columns: 80.8281px 275.172px`

## 根因

**浏览器 stealth/bot-detection 扩展**（`cdp_override` 模式）注入 `grid` 简写属性，直接覆盖 `grid-template-columns`：

```
.grid2 被注入：
  grid: 820.203px 651.188px 117.734px / 24px 332px / auto auto
```

`grid` 简写优先级高于 `grid-template-columns`，且通过 CSS 规则而非 inline style 注入，`:not()` 或 specificity 都无法压制。

## 诊断方法

```js
// 1. 检查 computed grid shorthand（含列宽）
var el = document.querySelector('.grid2');
var s = window.getComputedStyle(el);
'grid shorthand: ' + s.grid; // → "820.203px 651.188px..." 则是扩展注入

// 2. 检查 grid-template-columns（被覆盖后的值）
'gridTC:' + s.gridTemplateColumns; // → "80.8281px 275.172px" 表示被覆盖

// 3. 确认 CSS 规则里 base rule 正确但 computed 错误
// base rule = "calc(50% - 4px) calc(50% - 4px)" 但 computed = "80.8281px 275.172px"
// → 说明有注入属性覆盖
```

## 修复

### 方案一：内联 `!important` 强制覆盖（推荐）

在 `.grid2` div 上加 `style` 属性：

```html
<div class="grid2" style="grid-template-columns: calc(50% - 4px) calc(50% - 4px) !important; display: grid !important; gap: 8px;">
```

`!important` 优先级高于 CSS 规则注入，压制扩展干扰。

### 方案二：`calc(50% - gap/2)` 替代 `1fr`

`1fr` 在某些情况下被内容 min-width 拖拽，导致不等分。使用固定百分比：
```css
.grid2 { grid-template-columns: calc(50% - 4px) calc(50% - 4px); }
/* gap=8px，每个 calc = 50% - 4px = 46% → 两列共 92%，留 8px 给 gap */
```

### 方案三：给子元素加 `min-width: 0`

防止子元素内容（尤其是 `<a>` 链接）撑开列宽：
```css
.box { min-width: 0; min-height: 0; overflow: hidden; }
```

## 验收

```js
var e = document.querySelector('.grid2');
var s = window.getComputedStyle(e);
var cards = e.querySelectorAll('article');
JSON.stringify({
  cols: s.gridTemplateColumns,       // 应为 "178px 178px"（390px 下）
  gridW: s.width,                     // 应为 ~364px
  vw: document.documentElement.scrollWidth,  // 应为 390
  cardWidths: Array.from(cards).map(a => a.offsetWidth)  // 前4个应≈178
});
```

## 影响范围

- 所有使用 `.grid2` 的信息卡（任何主题）
- 扩展同时注入 `grid` 简写给其他常见 class（如 `.stats`、`.grid3`）
- 用法：`display:grid` + `grid-template-columns` 的任何 grid 容器

## 预防

当在 infocard-pub 中使用 grid 布局时，默认给 `.grid2` 等关键容器加 inline `style="..."` 覆盖，而不是完全依赖 CSS class 定义。这是 infocard-pub 页面在特定浏览器环境下的已知兼容性要求。