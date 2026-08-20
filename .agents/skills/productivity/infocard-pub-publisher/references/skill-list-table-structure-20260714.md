# skill 列表信息卡的表格结构规范（2026-07-14 实录）

## 问题背景

当信息卡内容是"命令/skill 列表，每项含：名称 + 描述 + 适用场景"时，错误的 HTML 结构会导致表格在 accessibility tree 中显示为 3 列（`适用场景` 被当作独立列头），视觉上"场景行"与"skill 行"混在一起，无法区分层级。

典型错误：使用 `display:grid` 或 `display:flex` 的 div 模拟表格行为，而不是用语义化的 `<table>`。

## 正确的 HTML 结构

### 表头
只有 2 列：`SKILL`（左侧固定宽）+ `技能描述`（右侧）。
**禁止**出现第 3 列表头 `适用场景`。

```html
<table class="xxx-table" aria-label="技能列表">
  <thead>
    <tr>
      <th>SKILL</th>
      <th>技能描述</th>
    </tr>
  </thead>
  <tbody>
    <!-- 每组 skill 包含 2 个 <tr> -->
  </tbody>
</table>
```

### 每组结构（两行一组）

```html
<!-- 第 1 行：SKILL + 描述 -->
<tr>
  <td class="skill-name">/ask-matt</td>
  <td class="skill-desc">询问关于项目架构、最佳实践等... </td>
</tr>
<!-- 第 2 行：适用场景，colspan=2 横跨整行 -->
<tr class="scene-row">
  <td colspan="2" class="scene-cell">
    <span class="scene-label">适用场景：</span>
    需要快速理解项目结构时使用
  </td>
</tr>
```

## CSS 样式要点

```css
/* 表头：深色背景，白字，大写 */
.xxx-table th {
  background: #111;
  color: #fff;
  font-weight: 850;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: .06em;
  padding: 6px 10px;
}

/* 场景行：暖灰底 + 红色左边框 + 与 skill 行间距 */
.scene-row {
  background: #faf5ee;
  border-left: 3px solid #d80018;
}
.scene-row td {
  padding: 6px 10px 8px;
  font-size: 10.5px;
  color: #5f5950;
}
.scene-row + tr {
  border-top: 8px solid #fff; /* 与下一组 skill 间距 */
}
```

## 验收标准（视觉分析检查）

1. 浏览器 accessibility tree 中表头只有 2 个 `<th>`
2. 每组 skill 正好是 2 个 `<tr>`（skill 行 + scene 行）
3. scene-row 的 `<td>` 有 `colspan="2"`
4. 视觉上 scene-row 有暖灰底色、红色左边框
5. 相邻 skill 组之间有清晰垂直间距
6. SKILL 列宽度刚好容纳命令名，不过宽

## 反面教训（Round 1-6 的失败）

- Round 1-2：直接复制旧卡结构，未理解 scene-row 的语义要求
- Round 3-5：反复修改 CSS 样式，未解决根因（HTML 结构本身错误）
- Round 6：`display:grid` 方案使 accessibility tree 显示为 3 列
- **Round 7 修复**：全部改用 `<table>` + proper `<tr>` + `colspan="2"`，5 项检查全部通过

## 根因总结

问题不是 CSS 样式，而是 HTML 语义结构。选择 `<table>` 而非 `div+grid`，场景行用独立的 `<tr>` 而非嵌套在 skill 行内部，场景行 `<td>` 用 `colspan` 横跨所有列。
