# 移动端渲染修复记录 · 2026-07-08

## 问题 1：代码块横向溢出

**现象**：`pre` / `.install code` 块内的长命令（如 `npx skills add https://github.com/op7418/...` 超过 60 字符）在 390px 下溢出页面，破坏布局。

**根因**：代码块默认不换行，`word-break: break-all` 允许断字但断点丑；`white-space: pre-wrap` 会折行但需要父容器配合。

**修复**：
```css
.install {
  background: #f7f4ef;
  border: 1.5px solid rgba(27,23,19,.18);
  padding: 10px 12px;
  margin-top: 2px;
  overflow-x: auto;              /* ← 关键：允许横向滚动 */
  -webkit-overflow-scrolling: touch; /* iOS 平滑惯性滚动 */
}
.install code {
  display: block;
  font: 11.5px/1.55 ui-monospace, SFMono-Regular, Menlo, monospace;
  color: var(--ink);
  background: none;
  padding: 0;
  white-space: pre-wrap;         /* 折行 */
  word-break: break-all;         /* 兜底长 URL */
}
```

**通用模式**：任何放长命令的 `<pre>` / `<code>` 块（安装命令、API 调用、git 命令）都必须加 `overflow-x: auto` + `word-break: break-all`。

**验收**：
```js
// Playwright 检查
const overflow = page.evaluate("document.documentElement.scrollWidth <= window.innerWidth");
console.log('No overflow:', overflow); // 期望 true
```

---

## 问题 2：移动端正文字号偏小

**现象**：720px 以下退为单列后，`body` 默认 12.5px 搭配窄列宽，阅读疲劳。

**修复**：
```css
@media (max-width: 720px) {
  body { font-size: 13.5px; }          /* ← 从 12.5px 上调 */
  .col-body { padding: 14px 16px 16px; } /* 增大模块内边距 */
  .install code { font-size: 12px; }
  .suit-list { gap: 6px; }
  .tag-item { font-size: 11.5px; padding: 4px 9px; }
}
@media (max-width: 420px) {
  body { font-size: 12.5px; }          /* 小屏退回基准 */
}
```

**规律**：wood-style 暖米纸背景偏柔，单列布局时字号 +1px 能显著改善可读性；`col-body` 的 padding 是竖向留白的关键，比横向 padding 更影响阅读呼吸感。

---

## Playwright 截图工具链

**Python playwright**（比 Node 版本更稳定）：
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    page.goto(url, wait_until='networkidle')
    page.screenshot(path='/tmp/desktop.png', full_page=False)
    
    # 移动端
    page.set_viewport_size({'width': 390, 'height': 844})
    page.screenshot(path='/tmp/mobile.png', full_page=True)
    browser.close()
```

**安装路径**：`~/.local/lib/python3.12/site-packages/playwright`
**可用命令**：`python3 -c "from playwright.sync_api import sync_playwright; ..."`

**Node playwright** 路径：`/home/ccwq/.local/bin/playwright`（实际是 Python 包装脚本，优先用 Python 写法）。

**验收溢出脚本**：
```python
overflow = page.evaluate("document.documentElement.scrollWidth <= window.innerWidth")
```
期望 `true`；`false` = 有横向溢出。
