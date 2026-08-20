# Grid2 Stealth Extension Bug — 跨主题 CSS 注入修复

## 问题现象

在已发布的信息卡（任何主题：蓝技手册、黑头、主骨架）中，`390px` 移动端下 `.grid2` 两列不等宽：
- 期望：各 `178px`（等分 390px 宽度）
- 实际：`80px / 275px`（或类似不等分）

## 根因

浏览器 stealth 扩展（`cdp_override`）在运行时注入了一条 `grid` 简写属性，覆盖了 CSS 文件中声明的 `grid-template-columns`，导致列宽计算失效。

stealth 注入的代码形如：
```js
element.style.grid = "..."; // 简写，覆盖了 grid-template-columns
```

`display: grid` 本身不受影响，但 `grid-template-columns` 和 `gap` 被简写覆盖。

## 修复方案

给所有 `.grid2` div 追加**内联 `!important` 样式**，压制 stealth 的注入覆盖：

```html
<div class="grid2" style="display: grid !important; grid-template-columns: calc(50% - 4px) calc(50% - 4px) !important; gap: 8px !important;">
```

关键点：
- `display: grid !important` — 压制 stealth 可能修改的 display
- `calc(50% - 4px) calc(50% - 4px) !important` — 压制 grid-template-columns 被覆盖
- `gap: 8px !important` — 压制 gap 被覆盖

## 验证方法

```js
getComputedStyle(element).gridTemplateColumns
// 期望返回 "178px 178px"（或等分的两个值）
// 若返回不等分值如 "80.8281px 275.172px"，说明仍被覆盖
```

浏览器 console 检查：
```js
var rows = document.querySelectorAll('.grid2');
rows.forEach(r => console.log(r.className, getComputedStyle(r).gridTemplateColumns));
```

## 适用场景

所有使用 `.grid2` / `.img-row-2` / `.fit-grid` 等网格布局的信息卡，任何主题均受影响。

## 不适用的场景

- `display: flex` 布局不受影响
- `grid-template-areas` 暂未发现被覆盖
- 桌面端（> 760px）因容器宽度足够，即使不等分视觉也不明显