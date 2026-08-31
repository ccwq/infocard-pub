# CSS Grid + 绝对定位子元素陷阱

## 场景

在 poster-shell 模式中，每个 `.skill-card` 使用 `display:grid; grid-template-columns:86px 1fr`。
`.card-stripe` 是绝对定位（`position:absolute`），`.card-body` 是网格子元素。

## 失败现象

绝对定位元素从文档流中抽出后，`.card-body`（没有显式 `grid-column`）会自动
fall through 到第 1 列（编号列），导致正文实际宽度只有 86px，出现"单字成行"。

## 根因

```
grid-template-columns: 86px 1fr
[ 编号 86px ] [ 正文 1fr ]
```

绝对定位的 `.card-stripe` 不参与网格布局，浏览器重新分配列：
- `.card-body` 没有 `grid-column:2` → 落入第 1 列 → width = 86px ❌
- `.card-stripe` 绝对定位，left:72px → 压到正文区域 ❌

## 正确做法

```css
.skill-card {
  display: grid;
  grid-template-columns: 86px 1fr;
  position: relative;   /* 为绝对定位子元素建立包含块 */
}
.card-stripe {
  position: absolute;
  left: 72px;          /* 编号列(86px)之后 14px 处 */
  top: 16px; bottom: 16px;
  width: 2px;
  opacity: .38;
}
.card-body {
  grid-column: 2;      /* ← 必须显式指定，否则落入第1列 */
  padding: 16px 28px 16px 34px;
}
```

## 验证方法

```javascript
// 浏览器控制台执行
const b = document.querySelector('.card-body').getBoundingClientRect();
const s = document.querySelector('.card-stripe').getBoundingClientRect();
console.log('body.width:', b.width, 'stripe.left:', s.left);
// body.width 应 ≈ 570+，stripe.left ≈ body.left + 72
```

## 适用条件

- 父容器使用 `display:grid`
- 至少有一个子元素使用 `position:absolute`
- 其他子元素需要占满"剩余列"
