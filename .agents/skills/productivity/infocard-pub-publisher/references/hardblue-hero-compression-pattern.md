# hardblue Hero 压缩模式 session record

**日期**: 2026-06-07  
**卡片**: `docs/20260607-gpt-image-2-prompts-hardblue.html`  
**commit**: `9e75600` style: compress hero - remove stats grid, shrink padding/font, merge stats into badge-row

---

## 用户意图
用户看了 GPT-Image-2 Prompts hardblue 卡后说 Hero 区域（kicker + stats + alert 三块叠加）太厚。

## 对齐过程（grill-me ≤3轮）
- Round 1: 问"哪块浪费"，用户选 A（Hero 区）
- 给出方案：去掉 stats grid → 4 个数据点合并进 badge-row，alert 变薄
- 用户确认，执行

## 具体改动

### CSS 变化
| 属性 | Before | After |
|------|--------|-------|
| `.hero-copy` padding | 22px | 16px |
| `.hero-copy` gap | 14px | 10px |
| `h1.demo-title` clamp | `clamp(30px,4.6vw,52px)` | `clamp(24px,3.8vw,42px)` |
| `.subtitle` | 14px / 1.6 | 12.5px / 1.52 |
| `.badge` min-height | 33px | 28px |
| `.badge` padding | 6px 10px | 5px 9px |
| `.badge-row` gap | 8px | 6px |
| `.alert` border | 3px | 2px |
| `.alert` padding | 15px | 10px 12px |
| `.alert` gap | 10px | 8px |
| `.alert strong` | 15px | 13.5px |
| `.alert p` | 14px / 1.68 | 12.5px / 1.6 |

### HTML 变化
- 删除 `<div class="stats">`（4 个独立 stat box）
- 新增 `.badge.ink`（黑底小字）4 枚嵌入 badge-row
- media query 移除 `.stats` 引用

### 删除的 CSS 类
```css
.stats, .stat, .stat .k, .stat .v  /* 全部移除，不再使用 */
```

### 新增的 CSS 类
```css
.badge.ink{background:#111;color:#fff;font-size:11px;min-height:24px;padding:4px 8px}
```

## 验收方法
1. 本地文件确认：`grep -n "stats\|stat\b" docs/20260607-gpt-image-2-prompts-hardblue.html` → 无输出
2. 推送后等待 GitHub Pages 重建（~80s）
3. 用 `?v=2` 强制绕过 CDN 缓存后截图验收
4. 确认 badge-row 里出现 `Star 16.1k` / `分类 7` / `收录 359+` / `License CC0`

## 关键教训
- 修改已发布卡片的样式 → 只提交 HTML，不重跑 `npm run build`（因为没有新卡加入）
- GitHub Pages CDN 延迟 80-120s，验证时加 `?v=N` query string 强制刷新
- 压缩 Hero 最有效的单次改动是移除 `.stats` grid，数据合并进 badge-row

## 何时用此模式
用户说"Hero 太厚" / "stats grid 去掉" / "badge-row 压缩" → 应用此模式。