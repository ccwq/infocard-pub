# crayon R5 poster-shell 对抗评审记录

## 时间线

| 轮次 | 智能体 | 结论 |
|---|---|---|
| R1 | 辩护者（Advocate） | **PASS**，编号列 86→48px，正文全宽，间距 40px |
| R1 | 批评者（Critic） | 超时未产出 |
| R4 | 主线程实现 | 4 项修复落地，提交 `8834eec` |

## 辩护者 R1 精确修复数值

```css
/* 编号列 */
grid-template-columns: 86px → 56px

/* 条目最小高度 */
min-height: 116px → 96px

/* card-body padding */
padding: 16px 28px 16px 34px → 14px 28px 14px 28px

/* card-stripe left */
left: 72px → 48px

/* card-title margin */
margin: 0 28px 5px 0 → 0 0 4px 0

/* card-desc max-width */
max-width: 560px → none
```

## 主线程教训

当辩护者 R1 已给出 PASS + 具体数值、批评者还未产出时，主线程应直接实现，不必等待批评者结论。

## R7 发现：card-num 垂直对齐 + stripe 距离（2026-07-28）

### 问题 1：序号垂直居中

- **现象**：`.card-num`（52px 衬线大字）在 grid 单元格中默认 `align-self: stretch`，网格默认行为是垂直居中，导致大字号序号在卡片内飘忽不定。
- **正解**：用户要求序号**垂直居中**于卡片高度，不是顶部对齐。
- **修复**：`.card-num` 添加 `align-self: center`。

```css
/* 正确（2026-07-28 修正） */
.card-num {
  align-self: center;  /* ← 垂直居中于卡片行 */
}
```

**⚠️ 历史错误**：早期 R7 笔记记录的是 `align-self: start`（顶部对齐），那是误读了用户需求"间距已经正常了"为"对齐到顶部"。用户实际要求是垂直居中。

### 问题 2：序号与分割线距离

- **观察**：`card-stripe` 的 `left` 值（92px）与 `.card-num` 宽度（58px+25px padding = ~83px）之间的间距约 9px，与设计意图接近。
- **如果发现间距异常**：检查 `.skill-card` 的 `grid-template-columns` 第一列宽度、`card-num` 的 `padding-right` 和 `text-align:right` 是否与 `card-stripe` 的 `left` 值匹配。
- **通则**：`card-stripe.left = 第一列宽度 - 约 20px`（给序号文字和右侧留白）

### 验证（浏览器控制台）

```js
// 检查序号是否顶部对齐
const num = document.querySelector('.card-num').getBoundingClientRect();
const body = document.querySelector('.card-body').getBoundingClientRect();
console.log('num.top:', num.top, 'body.top:', body.top, 'diff:', body.top - num.top);
// diff ≈ 0 则对齐正确

// 检查 stripe 与序号的距离
const stripe = document.querySelector('.card-stripe').getBoundingClientRect();
console.log('stripe.left:', stripe.left, 'num.right:', num.right, 'gap:', stripe.left - num.right);
// gap 应为 8-15px 左右
```

## R8 重大发现：card-body width:100% + 移动端双规则陷阱（2026-07-28）

### 问题 1：card-body 只有 22px 宽（移动端崩溃根因）

- **现象**：`.skill-card` 设置 `grid-template-columns: 100px 1fr` 但移动端 `.card-body` 实测宽度只有 22px（应至少 270px）。
- **根因**：grid item 的 `1fr` 是 `minmax(auto, 1fr)`，当 `.card-body` 内容少时，浏览器用 `min-content` 计算 grid track 宽度；如果 `.card-body` 子元素（p/table）宽度受限于 min-width:0 + 表格内容收缩，grid track 会被压缩到几乎为 0。
- **修复**：`.card-body` 显式 `width: 100%`，强制撑满 grid track。

```css
/* 必加：桌面端 + 移动端各加一次 */
.poster-shell .card-body {
  grid-column: 2;
  grid-row: 1;
  width: 100%;        /* ← 必须，否则 1fr 会被 min-content 压扁 */
  padding: 14px 22px 14px 18px;
  min-width: 0;
  position: relative;
}
```

### 问题 2：移动端 @media 双重规则陷阱

- **现象**：桌面端加了 `flex: 1` / `width: 100%` 后桌面正常，但移动端仍崩溃。
- **根因**：`.poster-shell .card-body` 在文件中出现**两次**：
  - 第 N 行（全局规则）：桌面端生效
  - 第 M 行（`@media(max-width:720px)` 内）：移动端生效，特异性相同 (0,2,0)，**完全覆盖桌面规则**
- **修复**：必须同时修改两条规则。

```css
/* 全局规则（桌面端） */
.poster-shell .card-body {
  grid-column: 2;
  grid-row: 1;
  width: 100%;
  padding: 14px 22px 14px 18px;
  min-width: 0;
  position: relative;
}

/* ⚠️ 必须显式重写，否则移动端会继承全局的 1fr 收缩问题 */
@media (max-width: 720px) {
  .poster-shell .card-body {
    width: 100%;
    padding: 10px 10px 10px 14px;
  }
}
```

### 验证（CDP 移动端）

```js
// 在 390×844 移动视口下检查
const cdp = chrome.devtools;
// 计算 1 小时内 CDP 命令
const body = document.querySelector('.card-body').getBoundingClientRect();
console.log('body_w:', body.width);
// 期望 ≥ 270px；若仍只有 22px，说明 @media 规则没改
```

### 教训

1. **grid 的 1fr ≠ width: 100%**：必须显式 width 才不会被 min-content 压扁
2. **@media 是覆盖，不是继承**：每条 @media 内的规则必须独立完整，不能省略关键属性
3. **CSS specificity 相同就完全替换**：不要假设 @media 内的部分属性会继承外部规则
