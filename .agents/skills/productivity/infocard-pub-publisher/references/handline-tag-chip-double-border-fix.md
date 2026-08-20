# handline Tag/Chip 双重边框问题

## 问题

在 handline 风格信息卡中，`.tag-chip` 元素同时出现：
- CSS `border: 1.5px solid #2c2723`
- `rough-box` 类 → JS SVG 抖动路径生成手绘外边框

**结果**：内外双层边框（内 solid + 外 sketchy），视觉错误。

## 受影响卡

- `docs/20260612-repo-to-agent-context.html`
- `docs/20260612-murphys-law.html`
- `docs/20260612-matthew-effect.html`

## 修复方法

从 `.tag-chip` 及所有变体 CSS 规则中移除 `border` 声明：

```css
/* ❌ 错误：CSS border + rough-box SVG 双重边框 */
.tag-chip { border: 1.5px solid #2c2723; ... }

/* ✅ 正确：只有 rough-box SVG 外边框 */
.tag-chip { /* 无 border */ ... }
```

## 验证

截图放大 tag 区域，若有内外双层边框 → CSS `border` 未清理。

## 预防

新建 handline 卡时，`.tag-chip` CSS 规则禁止声明 border。

## 相关

- `ead6d9a` — 修复三张 handline 卡的 tag-chip 双重边框
- `infocard-handline-style/SKILL.md` — Tag/Chip 规则已写入 skill