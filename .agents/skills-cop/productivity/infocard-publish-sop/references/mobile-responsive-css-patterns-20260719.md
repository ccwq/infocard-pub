# 移动端响应式 CSS 修复模式（2026-07-19）

## 关键教训

**第一轮修复失败原因**：`!important` 在 `@media` 查询内对 `grid-template-columns` 无效，浏览器仍渲染多列。需改用 `display:flex` + `flex-direction:column` 替代 grid 声明，或在 @media 内直接覆盖 grid 为 `1fr` 但必须用 `display:grid` 声明包裹。

**验证方法**：截图 SHA-256 变化 = CSS 生效；页面总高度从短变长 = 响应式堆叠生效。page.width 从 >390 变为 ≈390 也是信号。

## 最小修复 CSS 模板（@media max-width:720px）

```css
/* Hero：grid → flex column */
.hero {
  display: flex !important;
  flex-direction: column !important;
}
.hero-copy {
  border-right: none !important;
  border-bottom: 3px solid var(--line);
}

/* Grid 列 → 单列 */
.grid-3 {
  grid-template-columns: 1fr !important;
}
.grid-2 {
  grid-template-columns: 1fr !important;
}
.grid-4 {
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
}

/* 双栏（two-col/pro-con）→ flex column */
.two-col,
.pro-con {
  display: flex !important;
  flex-direction: column !important;
}

/* 代码块：防止长行撑破布局 */
.code-block {
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch;
}
.code-block pre {
  white-space: pre !important;
  overflow-x: auto !important;
  word-break: normal !important;
  word-wrap: normal !important;
}

/* 统计卡片 */
.stat {
  flex: 1 1 calc(50% - 6px) !important;
}

/* 章节编号块缩小 */
.section-head {
  grid-template-columns: 64px 1fr !important;
  gap: 10px;
}
.section-no {
  width: 64px !important;
  height: 64px !important;
  font-size: 26px !important;
}
```

## 常见错误

1. 只写 `grid-template-columns:1fr !important` 而不改变 `display:grid` → 浏览器忽略
2. `@media (max-width:720px)` 但 CSS 内层选择器没有 `!important` → 被基础样式覆盖
3. `overflow-x:auto` 放在外层 `.code-block` 但 `pre` 有 `white-space:pre-wrap` → 必须同时在 `pre` 上覆盖 `white-space:pre`
4. 网格列数 `grid-template-columns:1fr 1fr` 写错为 `1fr`（单列）但没有设置 `!important`

## 修复后验证

源码中出现媒体查询或 `!important` **不是修复证据**。首轮修复曾因 CSS 覆盖未实际生效而失败；只有浏览器运行结果可以证明修复。

修复前后对比信号：
- 页面总高度：短 → 长（垂直堆叠导致）
- 页面总宽度：>390 → ≈390
- 截图 SHA-256：完全改变
- DOM 实测：`document.documentElement.scrollWidth <= 390`（表格/代码自身专用滚动容器除外）

验收流程：
1. 本地 390px 先验证，再允许 push：截图覆盖 Hero、每个风险区和页面末段；检查 DOM 宽度；视觉审查无 major 问题。
2. 若截图或 DOM 仍显示多列/溢出，使用更具体的选择器或 `display:flex !important; flex-direction:column !important`，不要仅凭源码猜测覆盖成功。
3. push 后等 CDN 刷新（`age:0` 后再截图）并做公网复验。
4. 记录截图路径、SHA、页面尺寸、DOM 宽度与结论；任何实际 FAIL 阻断发布。
5. 仅当视觉基础设施连续 5 次失败、静态与 DOM 都通过时，才可标为 `PUBLISHED_PENDING_VISUAL`；不得称视觉通过。
