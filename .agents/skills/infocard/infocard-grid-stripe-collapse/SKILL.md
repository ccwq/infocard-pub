---
name: infocard-grid-stripe-collapse
description: poster-shell CSS grid + 绝对定位条纹导致 card-body 压缩的根因与修复。
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, css, grid, poster-shell, mobile, crayon]
    related_skills: [infocard-crayon-style, infocard-styles]
---

# infocard grid 时间轴条纹导致 body 压缩的根因与修复

## 场景

poster-shell 模式的 `.skill-card` 使用 CSS Grid：
```css
.skill-card {
  display: grid;
  grid-template-columns: 100px 1fr;  /* 编号列 100px，正文列 1fr */
  position: relative;
}
.card-stripe {
  position: absolute;
  left: 96px; top: 18px; bottom: 18px; width: 1px;
}
.card-body {
  grid-column: 2;   /* 已设，但 body.width 仍只有 22px */
}
```

## 失败现象

- `body.offsetWidth` ≈ 22px（只有 padding 之和）
- 文字在极窄空间内竖向排列

## 根因

绝对定位的 `.card-stripe` 从文档流抽出，**不贡献 grid 轨道宽度**。`grid-column: 2` 确保 body 落入第 2 列，但无法解决第 2 列宽度被压缩到 ≈0 的问题。

## 正确做法

```css
.card-body {
  grid-column: 2;     /* ← 确保在第2列 */
  width: 100%;        /* ← 强制撑满第2列可用宽度（关键修复） */
  min-width: 0;        /* 防止内容撑开 */
}
```

## 验证方法

```javascript
// CDP Runtime.evaluate
var body = document.querySelector('.card-body').getBoundingClientRect();
console.log('body.width:', body.width);
// 正常：桌面 ≥ 400px；失败：≈ 20~30px
```

### 完整验证脚本

```javascript
var cards = document.querySelectorAll('.skill-card');
cards.forEach(function(c, i) {
  if (i > 2) return;
  var num = c.querySelector('.card-num');
  var body = c.querySelector('.card-body');
  if (!num || !body) return;
  var numR = num.getBoundingClientRect();
  var bodyR = body.getBoundingClientRect();
  var cardR = c.getBoundingClientRect();
  console.log(JSON.stringify({
    i: i,
    num_center: Math.round(numR.top + numR.height / 2),
    body_center: Math.round(bodyR.top + bodyR.height / 2),
    card_center: Math.round(cardR.top + cardR.height / 2),
    body_w: Math.round(bodyR.width),
    card_h: Math.round(cardR.height)
  }));
});
```

## 移动端注意事项

`@media(max-width: 720px)` 里**必须重复声明 `width: 100%`**，因为媒体查询内 `grid-template-columns` 改变后，新列宽仍需 width 配合。

```css
@media (max-width: 720px) {
  .skill-card { grid-template-columns: 68px 1fr; }
  .card-body {
    width: 100%;   /* ← 媒体查询内必须重复 */
    padding: 10px 10px 10px 14px;
  }
  .card-stripe { left: 64px; }
}
```

## 相关文件

- `infocard-crayon-style/references/grid-column-trap.md` — grid-column 遗漏导致的竖列问题
- `infocard-crayon-style/references/crayon-r5-poster-shell-20260726.md` — R5 poster-shell CSS 规范

## 判断决策树

```
card-body 宽度 ≈ 20~30px？
├── 已设 grid-column:2 → 检查 width:100%
│   ├── width:100% 已设 → 父 flex 容器压缩了 grid
│   └── width:100% 缺失 → 添加后重验证
├── 未设 grid-column:2 → 加 grid-column:2 + width:100%
└── .skill-card 是 flex → 改用 flex 规则（align-items:center, .card-body flex:1）
```
