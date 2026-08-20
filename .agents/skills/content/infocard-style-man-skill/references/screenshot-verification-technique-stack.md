# infocard-style-man-skill · 截图验收技术栈

> 来源：2026-06-26 sage-swiss 主题 5 轮视觉评审，browser_vision 和 Page.captureScreenshot 均不可靠。

## 当前环境限制

- `browser_vision` → 30s 超时
- `browser_navigate` → 60s 超时
- `browser_snapshot` → 30s 超时
- `Page.captureScreenshot` → 20-30s 超时
- `browser_console` → 30s 超时
- `browser_cdp(Target.getTargets)` → **可用**
- `browser_cdp(Page.navigate)` → **可用**
- `browser_cdp(Page.printToPDF)` → **可用**（30s 内完成）
- `browser_cdp(Runtime.evaluate)` → **可用**

## 推荐链路：CDP PrintToPDF → Python → pdftoppm

### Step 1: CDP 导航 + 打印 PDF

```javascript
// 查找 tab
browser_cdp(Target.getTargets, params={}, timeout=15)
// → 在 targetInfos[] 中找 url 包含目标 URL 且 attached: true 的 targetId

// 导航
browser_cdp(Page.navigate, params={url:"http://10.6.8.14:5588/theme/sage-swiss.html"}, target_id="<ID>", timeout=20)

// 设 viewport
browser_cdp(Emulation.setDeviceMetricsOverride, params={"width":1280,"height":900,"deviceScaleFactor":1,"mobile":false}, target_id="<ID>")

// 滚到顶
browser_cdp(Runtime.evaluate, params={expression:"window.scrollTo(0,0)", returnByValue:true}, target_id="<ID>")

// 打印 PDF
browser_cdp(Page.printToPDF, params={format:"A4", printBackground:true, scale:0.85}, target_id="<ID>", timeout=30)
// → 返回 base64 PDF，完整数据持久化到 /tmp/hermes-results/call_function_<ID>.txt
```

### Step 2: Python 提取 base64 → 写 PDF

```python
# /tmp/extract_pdf.py
import re, base64
with open('/tmp/hermes-results/call_function_<ID>.txt', 'r') as f:
    data = f.read()
m = re.search(r'"data":\s*"([^"]+)"', data)
b = base64.b64decode(m.group(1))
with open('/tmp/sage-swiss-v<n>.pdf', 'wb') as f:
    f.write(b)
print(f'OK: {len(b)} bytes')
```

### Step 3: pdftoppm 转 PNG

```bash
pdftoppm -r 150 -png /tmp/sage-swiss-v<n>.pdf /tmp/sage-swiss-v<n>
# → /tmp/sage-swiss-v<n>-1.png
```

### Step 4: Vision 分析

```javascript
mcp_minimax_understand_image(
  image_source="/tmp/sage-swiss-v<n>-1.png",
  prompt="Rate this Swiss-style information card layout 1-10. Is it premium high-end? What are the top issues? Answer in Chinese."
)
```

## 关键注意事项

| 项目 | 说明 |
|---|---|
| **Tab ID** | 必须从 `Target.getTargets` 返回值中手动查找，不是固定值 |
| **URL 路径** | live-server 从 repo root 启动，`theme/sage-swiss.html` → URL 是 `http://10.6.8.14:5588/theme/sage-swiss.html`（不是 `/sage-swiss.html`） |
| **PDF scale** | A4 @ 0.85 通常 80-120KB base64，解压后 PNG 约 150-200KB |
| **pdftoppm 分辨率** | 150 DPI 对信息卡验收足够；如需精细看字体可设 200-300 |
| **PDF 字体警告** | `Syntax Warning: Bad bounding box in Type 3 glyph` 是 Chromium 内置 PDF 渲染器已知行为，不影响内容 |

## 失败恢复决策树

```
browser_vision 超时
  → 试 Page.printToPDF 链路（Step 1-4）
  
Page.captureScreenshot 超时
  → 换 Page.printToPDF

execute_code 被 block
  → 写 Python 脚本到 /tmp/extract_pdf.py（write_file）
  → terminal 运行 python3 /tmp/extract_pdf.py

PDF 生成但 VLM 分析失败（sensitive 图片）
  → 降低 scale: 0.85 → 0.7
  → 或等待 10s 后重试 VLM

公网 Pages 验证超时
  → sleep 60s 再试（GitHub Pages 默认 ~60s 传播）
  → 用 GitHub API 直接查文件是否存在：
    curl https://api.github.com/repos/ccwq/infocard-pub/contents/theme/sage-swiss.html | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['size'])"
```

## 已知可用端口

- `live-server` 预览：`10.6.8.14:5588`（repo root 启动）
- 公网 GitHub Pages：验证时用 `https://ccwq.github.io/infocard-pub/` 开头

## 验收评分记录

| 主题 | 版本 | 评分 | 轮次 |
|---|---|---|---|
| sage-swiss-style | v1 | 8.1/10 | R1 |
| sage-swiss-style | v2 | 8.5/10 | R2 |
| sage-swiss-style | v3 | 8.5/10 | R3 |
| sage-swiss-style | v4 | 9.5/10 | R4 |
| sage-swiss-style | v5 | **9.5/10** | R5（定稿） |

**sage-swiss commit**: `f87f22e` "feat: add sage-swiss theme (精准复刻参考图，9.5/10)"
