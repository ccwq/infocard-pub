# grid2 CSS 列宽被浏览器 stealth 扩展覆盖

## 问题现象

移动端 390px 视口下，`.grid2` 容器内 4 张卡片列宽不等：
- 左侧卡片：80.8281px
- 右侧卡片：275.172px
- 差距约 3.4×，视觉严重失衡

即使 CSS 明确写了 `repeat(2, 1fr)`、`minmax(0, 1fr) minmax(0, 1fr)` 或 `calc(50% - 4px) calc(50% - 4px)`，computed 样式仍然错误。

## 根因定位

1. **CDP 检查**（在 browser_console 运行）：
```js
var e = document.querySelector('.grid2');
var s = window.getComputedStyle(e);
'cols:' + s.gridTemplateColumns + ' gridW:' + s.width;
// 输出：cols:80.8281px 275.172px gridW:364px
// 说明 grid-template-columns 被覆盖
```

2. **CSS rules 检查**（检测是否有注入覆盖）：
```js
var all = [];
var sheets = document.styleSheets;
for (var i=0; i<sheets.length; i++) {
  try {
    var rules = sheets[i].cssRules;
    for (var j=0; j<rules.length; j++) {
      var r = rules[j];
      if (r.selectorText && r.selectorText.includes('grid2')) {
        all.push('[' + r.selectorText + ']: ' + r.style.gridTemplateColumns + ' (specified)');
      }
    }
  } catch(e) {}
}
JSON.stringify(all);
// 输出：[".grid2"]: "calc(50% - 4px) calc(50% - 4px)" (specified)
// 说明 CSS 里写的是正确的，但 computed 不符
```

3. **grid shorthand 检查**：
```js
var e = document.querySelector('.grid2');
var s = window.getComputedStyle(e);
'gridTC:' + s.gridTemplateColumns + ' grid:' + s.grid;
// 输出：gridTC:24px 332px grid:820.203px 651.188px 117.734px / 24px 332px / ...
// 说明 .grid2 上被注入了 grid 简写属性，覆盖了 grid-template-columns
```

4. **inline style 检查**：
```js
var el = document.querySelector('.grid2');
el.getAttribute('style');
// 输出：null（无内联样式）
```

结论：Hermes Browserbase 的 `cdp_override` stealth 功能给 `.grid2` 注入了 `grid` 简写属性，该简写覆盖了 `grid-template-columns` longhand。`grid` 简写优先级高于 stylesheet 中的 `grid-template-columns`。

## 解法

给 `.grid2` div 加 `!important` 内联样式，压制扩展注入：

```html
<div class="grid2" style="grid-template-columns: calc(50% - 4px) calc(50% - 4px) !important; display: grid !important; gap: 8px;">
```

## 验证

390px 视口下：
```js
var e = document.querySelector('.grid2');
var s = window.getComputedStyle(e);
JSON.stringify({cols:s.gridTemplateColumns, gridW:s.width});
// 期望输出：{cols:"178px 178px", gridW:"364px"}
// cardWidths: [178, 178, 178, 178, 364]
```

## 修复记录

| 日期 | 文件 | 修复内容 |
|------|------|----------|
| 2026-06-06 | `20260606-hermes-one-agent-studio.html` | 首次发现，修复 grid2 列宽 |
| 2026-06-06 | `20260606-ai-ui-design-tools.html` | 新卡直接加 inline style 预防 |

## 其他受影响的 grid 容器

根据实际测试，受影响的容器包括：
- `.grid2`（2列卡片）
- `.fit-grid`（适合/不适合）
- `.closing-grid`（最终判断区）

所有这些容器在蓝技手册风格卡片中都应加 `!important` 内联样式，或考虑用 CSS class 加 `!important` 规则：
```css
/* 在 stylesheet 中加 */
.grid2, .fit-grid, .closing-grid {
  grid-template-columns: var(--grid-cols, calc(50% - 4px) calc(50% - 4px)) !important;
}
```