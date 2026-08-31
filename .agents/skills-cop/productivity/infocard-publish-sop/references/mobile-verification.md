# 移动端验收方法（390px）

## 常见陷阱

**Browserbase 截图不等于真实 390px：** vision_analyze 收到的截图是 Browserbase 默认视口（1280px 宽屏），即使 CSS 中有 `@media (max-width:560px)` 的单列断点，截图仍是缩放后的桌面视图，无法反映移动端真实效果。

## 正确验收步骤

1. `browser_navigate` 打开卡片 URL
2. `browser_console` 执行 JavaScript 强制覆盖 viewport：

```js
document.querySelector('meta[name="viewport"]').setAttribute('content','width=390,initial-scale=1');
document.body.style.setProperty('overflow-x','hidden');
```

3. `browser_vision` 截图，此时才是真正的 390px 渲染结果
4. 检查要点：
   - 是否有横向溢出（多列布局是否在 390px 下正确堆叠）
   - `pre`/`code` 块是否有 `overflow-x:auto`（防止代码长行撑破布局）
   - `.comparison-table` 是否有 `overflow-x:auto`
   - 基础字号是否可读（正文 ≥12px，标题 ≥16px）
   - 图片是否 `max-width:100%` 且 `height:auto`

## 最小修复判定

- `overflow-x:auto` 加到 `pre,code,.comparison-table` 上 → 最小修复，主线程直接改
- 媒体查询本身缺失或断点错误（如只有 `@media (max-width:900px)` 但无 560px 断点）→ 最小修复，补断点
- 多列改单列的整体布局重构 → 重大问题，退回 agent2

## 常见 CSS 移动端防御写法

```css
img { display: block; max-width: 100%; height: auto; }
pre, code, .comparison-table { overflow-x: auto; max-width: 100%; }
@media (max-width: 900px) {
  .grid-3, .grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 560px) {
  .page { width: calc(100% - 12px); }
  .grid-3, .grid-4, .sdk-grid, .feature-grid { grid-template-columns: 1fr; }
  .stats { grid-template-columns: 1fr 1fr; }
  .comparison-table { font-size: 11px; }
}
```
