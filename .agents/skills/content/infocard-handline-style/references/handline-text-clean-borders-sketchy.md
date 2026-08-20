---

## 第二次回归（2026-06-13）：浅色纯 CSS 边框在米纸底消失

### 症状
用户截图反馈：topbar 底边、footer 边框"看不见"。线上页面 `border-bottom: 1px solid #d0c8be` 在米纸底 `#f5efe6` 上对比度极低，肉眼几乎不可见。

### 根因
- `topbar { border-bottom: 1px solid #d0c8be; }` — `#d0c8be`（浅暖灰）与背景 `#f5efe6` 太接近
- `footer { border: 2px dashed #c0b8a8; }` — 同理
- 这两处**不是** rough-box（由 JS SVG 生成手绘边框），而是**纯 CSS 边框**；在米纸底上需要足够深才能形成视觉锚点

### 修复
批量替换所有浅色边框 → `#2c2723`（深墨褐）：
```bash
for f in docs/YYYYMMDD-*.html; do
  sed -i 's/#d0c8be/#2c2723/g; s/#c0b8a8/#2c2723/g; s/#c9c0b3/#2c2723/g' "$f"
done
```

### 教训
handline 的米纸底背景（`#f5efe6`）决定了所有**纯 CSS 结构性边框**必须 ≥ `#2c2723`，不能凭直觉选"好看的中灰色"。

### 验证
```bash
grep -rn "d0c8be\|c0b8a8\|c9c0b3" docs/YYYYMMDD-*.html  # 空 → PASS
```

### 相关 commit
- `f0c7408` — `Fix handline border colors: #d0c8be/#c0b8a8 → #2c2723`（7 cards 批量修复）

---

## 第三次回归（2026-06-13）：GitHub Pages CDN ~80s 延迟导致修复后用户仍看到旧版

### 症状
修复已 push，线上 `border-bottom: 1px solid #2c2723` 已生效，但用户截图仍显示旧版浅色边框。

### 根因
GitHub Pages CDN 缓存 TTL 约 80-120 秒，push 后立即访问会拿到旧版本。用户未做强制刷新（Cmd+Shift+R / Ctrl+Shift+R）。

### 解决方式
1. push 后耐心等待 80-120 秒再验收
2. 提供 `?v=N` cache-bust URL：`https://...html?v=2`
3. 告知用户强制刷新

### 教训
修复 push 后**不能立即截图验收**，需等待 CDN 传播。用户截图看到旧版不等于修复失效。