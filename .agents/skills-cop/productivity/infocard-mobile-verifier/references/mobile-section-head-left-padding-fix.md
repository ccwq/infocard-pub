# Q-style / Blue Technical Manual 红色章节头贴边修复案例

## 问题描述

用户说“红色标题贴边了”，指的是信息卡中带红色大编号方块（`section-no`）的章节头部在移动端左边距为 0，内容直接贴到屏幕左边缘。

**典型场景**：
- Q-style 或 Blue Technical Manual 风格的信息卡
- 每个章节有 `<div class="section-head">` 包裹 `<div class="section-no">01</div>` + 标题元信息
- 桌面端 `.page` 有 `margin:0 auto` 和 `padding:0 0 140px`，内容区有内边距
- 移动端 `@media (max-width:720px)` 只覆盖了 grid 列宽和字号，**没有给 `.section-head` 补 `padding-left`**
- 后果：`.section-head` 从 x=0 开始，红色方块紧贴左边缘，视觉上像"贴边"

## 根因

CSS 变量层级的 `var(--paper)` 背景色和 body 外层留白由 `.page` 控制，但 `.section-head` 本身在移动端没有独立 left padding。

## 诊断路径（正确顺序）

1. **确认是哪个元素贴边**：用户说"红色标题贴边了" → 问"是指红色 01 方块本身，还是红色方块右侧的标题？"（本案例是红色 01 方块）
2. **查 class**：确认是 `.section-head` / `.section-no` 组合
3. **查 CSS**：在 HTML 中 grep `.section-head` 的 `@media` 块
   ```bash
   grep -n "section-head\|section-no" <file>.html
   ```
4. **看移动端规则**：是否只有 `grid-template-columns` 覆盖，缺少 `padding-left`
5. **量化定位**：浏览器 DevTools Console 查 `getBoundingClientRect().x`，确认 x=0

## 修复方案

在移动端媒体查询中给 `.section-head` 补 `padding-left`:

```css
@media (max-width:720px){
  .section-head{padding-left:14px}  /* ← 加这一行 */
  .section-head{grid-template-columns:72px 1fr}
  .section-no{width:72px;height:72px;font-size:26px}
}
```

## 验证方法

1. 浏览器 390×844 视口下截图，确认红色方块左侧有留白
2. `getBoundingClientRect().x` 应 ≥ 10（14px padding 在 390px 下约等于 14px，非完全边框盒会略有差异）

## 关键教训

- 用户说"某元素贴边"→ 立即定位到具体 DOM class，不要先跑横向溢出排查
- 横向溢出排查（`scrollWidth > clientWidth`）是**全局性问题**；贴边是**局部元素缺少 padding**
- 这两种问题的修复路径完全不同，不要混用
- Q-style 和 Blue Technical Manual 风格卡片的 `.section-head` 移动端 left padding 是已知高发位置

## Session Reference

本案例：`20260605-hermes-agent-workflow-stack.html`（Hermes 工作流栈信息卡，Blue Technical Manual 风格）