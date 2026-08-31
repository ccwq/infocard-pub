# 表格移动端响应式规范

## 核心反模式（禁止）

**错误代码**：
```css
@media (max-width: 720px) {
  .card-grid, .timeline, .tbl tr { display: block; }
  /* ↑ .tbl tr{display:block} 将每行<tr>变成block，破坏列对齐 */
}
```

**根因**：`tr{display:block}` 是 div 布局的常用技巧，但在 `<table>` 上会把所有 `<td>` 堆叠成一列，彻底摧毁列对齐结构。

---

## 正确做法

```css
/* 基础表格：固定列宽（跨所有视口） */
.tbl {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;           /* ★ 核心：固定列宽 */
}
.tbl th:nth-child(1), .tbl td:nth-child(1) { width: 25%; }
.tbl th:nth-child(2), .tbl td:nth-child(2) { width: 37.5%; }
.tbl th:nth-child(3), .tbl td:nth-child(3) { width: 37.5%; }

/* 移动端：横向滚动保持行列结构 */
@media (max-width: 720px) {
  .tbl {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
    min-width: 100%;
  }
  .tbl thead, .tbl tbody, .tbl tr { display: table-row; }
  .tbl th, .tbl td { white-space: normal; }
}
```

**列宽推荐比例**：
- 第一列（标签/维度）：25%
- 内容列：各 37.5%（3列时）或 50%（2列时）

**关键 CSS 说明**：
- `table-layout: fixed`：强制浏览器按 width 比例分配列宽，不受内容长度影响
- `overflow-x: auto`：内容超宽时水平滚动，不撑破布局
- `display: table-row`（移动端）：恢复行列结构，与 `display:block` 互斥
- `display: block`（外层 `.tbl`）：让 table 支持 `overflow-x`

---

## 验证流程

1. 移动端模拟：`browser_cdp → Emulation.setDeviceMetricsOverride({width:390,height:844,mobile:true,deviceScaleFactor:2})`
2. 截图：`Page.captureScreenshot`
3. 视觉检查：三列对齐、无溢出、无需横滚
4. 如有问题，先确认 `table-layout: fixed` 已加，再检查列宽比例

---

## 参考案例

- **2026.05.26** `20260526-hermes-vs-agent-browser.html`：修复前 `.tbl tr{display:block}` 导致列错位，修复后 `table-layout:fixed` + 固定列宽，390px 移动端三列对齐通过。Commit: `9210f25`