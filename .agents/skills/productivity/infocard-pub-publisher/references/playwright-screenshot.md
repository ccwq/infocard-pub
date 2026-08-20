# Playwright 截图：Python 是可靠路径

## 问题

Node.js 的 `playwright` 包在某些环境（volta 管理、shallow clone 等）下 `require('playwright')` 报 `MODULE_NOT_FOUND`，即使 CLI 二进制存在于 `~/.local/bin/playwright`。

## 解决：Python playwright

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('https://ccwq.github.io/infocard-pub/docs/<slug>.html', wait_until='networkidle')
    page.screenshot(path='/tmp/<slug>-mobile.png', full_page=True)
    browser.close()
```

## vision 验证：像素级比推测更可靠

vision 模型有时会给出"可能有溢出"这类推测性判断。

**当 vision 说"可能有问题"时**，做实证验证：

```python
from PIL import Image
img = Image.open('/tmp/<slug>-mobile.png')
print(f'截图尺寸: {img.size[0]}x{img.size[1]}')
right_strip = img.crop((350, 0, min(390, img.size[0]), img.size[1]))
right_strip.save('/tmp/<slug>-right-strip.png')
```

然后对边条截图调用 vision，确认内容是否被截断。实测优先于推测。

## CLI 路径（已知不可靠）

- `~/.local/bin/playwright` — CLI 可用（`playwright --version` ✅）
- Node `require('playwright')` — 在 infocard-pub 工作目录中不可用
- Python `from playwright.sync_api import sync_playwright` — **可靠路径**
