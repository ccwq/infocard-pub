# Headless browser verification fallback

Use this when the normal browser automation path is flaky (for example, CDP navigation or `Page.enable` times out) but the page itself still needs real interaction and export verification.

## When to switch
- `browser_navigate`/CDP hangs or times out on page initialization.
- You need to confirm a button click that triggers a real download.
- You need to verify a long page where a single viewport misses tail sections or footer/button overlap.

## 简化截图方案：`google-chrome` CLI（推荐）

不需要 Playwright 脚本，直接用命令行截图：

```bash
# 桌面端 1280×900
google-chrome --headless=new --disable-gpu \
  --screenshot=/tmp/shot-desktop.png \
  --window-size=1280,900 \
  http://10.6.8.14:5588/docs/YYYYMMDD-slug.html

# 移动端 390×844
google-chrome --headless=new --disable-gpu \
  --screenshot=/tmp/shot-mobile.png \
  --window-size=390,844 --mobile=true \
  http://10.6.8.14:5588/docs/YYYYMMDD-slug.html

# 验证文件生成
ls -la /tmp/shot-*.png
```

`google-chrome`（或 `google-chrome-stable`）比 `chromium-browser` 更可靠。可用路径：`/usr/bin/google-chrome`。

截图后用 `mcp_minimax_understand_image` 分析验收。

## Playwright 方案（当需要交互时）

当需要确认按钮点击、下载完成等真实交互时，使用 Playwright：

1. Start a local HTTP server for the previewed site.
2. Use a Chromium-family headless browser with a tall viewport for screenshot verification.
3. Use Playwright against the local HTTP URL to:
   - confirm the target element exists,
   - click the export/save button,
   - wait for the download event,
   - verify the downloaded file path and size.
4. For long cards, capture at least:
   - one normal first-viewport screenshot,
   - one very tall screenshot to inspect lower sections and floating controls.

## Acceptance cues
- The page is reachable over local HTTP.
- The save/export button exists and is clickable.
- The download completes and produces a non-empty file.
- Tall screenshots show the lower sections fully, without hidden content or button occlusion.

## Session note
This pattern was used successfully for a long `LightAgent` info card when browser CDP timed out during page enable, but headless Chrome + Playwright completed the verification and export click reliably.