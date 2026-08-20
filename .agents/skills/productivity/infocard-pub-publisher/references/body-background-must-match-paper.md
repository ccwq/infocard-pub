# body 背景色必须匹配卡纸背景

## 问题

Karakeep 信息卡在公网展示时，卡片四周出现明显的深色边框/外框，视觉上像是截图有一圈黑边。卡片 HTML 本身（`.page`）背景正确，但外层 `body` 背景是 `#0a0a0a` 深黑色，与卡纸色 `#f8efd9` 形成强烈对比。

## 根因

生成 HTML 时，`body` 和 `.page` 设置了不同的 `background`：

```css
/* 错误 */
body  { background: #0a0a0a; }              /* 深色，制造黑色外框 */
.page { background: var(--paper); }        /* 卡片正确，但外层仍深色 */

/* 正确 */
body  { background: var(--paper); }        /* 与卡片同色，融为一体 */
.page { background: var(--paper); }
```

## 检查命令

每次发布或修复前，grep 确认 body 和 .page 的背景一致：

```bash
grep -n "background" docs/YYYYMMDD-slug.html | grep -E "body|html"
```

**规则**：`body` 和 `.page` 的 `background` 必须一致（都是 `var(--paper)` 或其他卡纸色）。不能 `body` 深色 + `.page` 浅色。

## 验证方法

1. 访问公网 Pages URL
2. 截屏观察卡片外缘是否与背景融为一体
3. 无深色边框/外框 = 通过
4. 黑色边框残留 = 未修复完全

此问题纯靠本地检查无法发现，必须对照公网截图判断。GitHub Pages 部署后的实际渲染结果才是验收标准。

## 修复记录

- **Karakeep 卡**（`20260605-karakeep-bookmark-ai`）：`body { background: #0a0a0a }` → `body { background: var(--paper) }`，同时 `padding-bottom` 从 120px 调至 80px。