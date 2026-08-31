# themes.html iframe 背景渗入导致移动端底色异常（2026-07-10）

## 症状
Vision 模型描述移动端截图"底部有灰色区域，像是右栏没关闭"。

## 根因
`themes.html` 的 `.preview-iframe` CSS：
```css
.preview-iframe{...background:#F2F2F2}  /* line ~48 */
```
iframe 背景色（父页浅灰）透进深蓝卡片底部，在视觉上像是"右栏渗入"。

## 诊断流程

### 1. 先用 CDP Runtime.evaluate 量化
```javascript
// 在 390px 移动端视口下执行
document.body.scrollWidth + 'x' + document.body.clientWidth
// 结果：414x374
```
- `414 - 374 = 40px ≈ 24px (Linux overlay scrollbar) + 16px(1rem)`
- 差异恰好是滚动条宽度，不是内容溢出

### 2. 定位具体子元素
```javascript
JSON.stringify({
  heroW: document.querySelector('.hero-panel')?.offsetWidth,  // 219
  mainW: document.querySelector('.main-panel')?.offsetWidth,    // 374
  flexDir: getComputedStyle(document.querySelector('.card-wrap')).flexDirection, // "column"
  overflow: document.body.scrollWidth > document.body.clientWidth  // true（滚动条导致）
})
```
- `@media (max-width: 720px)` **已生效**（flexDirection: column）
- hero 和 main 宽度均在 390px 内，无内容溢出
- 问题不在卡片本身，在父页 iframe 背景

### 3. 视觉来源定位
themes.html line 48: `.preview-iframe{...background:#F2F2F2}` → 改 `#0f1929`（深蓝同色）

## 修复
```bash
# themes.html line 48
- .preview-iframe{...background:#F2F2F2}
+ .preview-iframe{...background:#0f1929}
```
Commit: `75de5bb` ("fix: iframe preview background from #F2F2F2 to #0f1929")

## 经验规则

| 信号 | 来源 | 修法 |
|---|---|---|
| 移动端底部颜色与卡片主色调不一致 | themes.html iframe 背景渗入 | 改 iframe background 颜色 |
| scrollW - clientW ≈ 24px (Linux) | 滚动条，不是内容溢出 | 不修卡片 CSS |
| scrollW - clientW >> 滚动条宽度 | 子元素真正溢出 | 查具体 class 的 overflow/wrap |
| Vision 描述"右栏装饰条" | themes.html iframe wrapper 混入 | 对直接 URL 截图，不走 themes |

## 防止重现
每次新建 infocard 主题时，同步确认 themes.html iframe 背景色与卡片主背景一致。
已在 memory 记录：themes.html iframe 背景需与卡片 body 一致。
