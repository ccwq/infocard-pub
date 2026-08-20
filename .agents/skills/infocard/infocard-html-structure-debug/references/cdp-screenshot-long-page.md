# CDP Screenshot Long-Page Workaround

## Problem

`Page.captureScreenshot` via CDP WebSocket returns `data: ""` (0 bytes) when the page is too tall:
- WebSocket frame limit: **1,048,576 bytes (1MB)**
- PNG of a full infocard page (~3000px+) exceeds this limit
- `clip` option does NOT help — the limit is on the response frame, not the image content
- `Page.printToPDF` also fails with the same frame-size error

## Diagnosis

```python
# Check if the issue is frame-size or something else
r = await cdp(ws, "Page.captureScreenshot", {"format": "png"})
# Returns {'data': ''} → frame size limit
# Returns {'data': 'iVBOR...'} → working, check viewport
```

## Verified Workarounds

### 1. Subagent + agent-browser CLI (RECOMMENDED)

Use a subagent with `agent-browser` CLI which handles the frame transfer differently:

```bash
abc goto "https://ccwq.github.io/infocard-pub/docs/20260819-rakazo-grok-bot.md.html"
# Then set viewport and screenshot via abc CLI
abc screenshot "URL" --out /tmp/rakazo-mobile.png
```

The subagent approach is reliable and used by the visual verification workflow.

### 2. Scroll + Capture Individual Viewports

If WebSocket is available but frame is too big, scroll the page and capture each viewport:
```python
# Set viewport, scroll to each position, capture partial screenshot
# Then assemble in Python with PIL
```

### 3. DOM Measurement Instead of Screenshot (FALLBACK)

When all screenshot methods fail, use DOM measurement for structural verification:
```python
r = await cdp(ws, "Runtime.evaluate", {
    "expression": "JSON.stringify({scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth, innerW: window.innerWidth, hero: !!document.querySelector('.hero'), sections: document.querySelectorAll('.section').length})"
})
```

This provides strong structural evidence even without a visual screenshot.

## Key Insight

The **frame size limit is on the WebSocket connection**, not the screenshot data itself. The agent-browser CLI bypasses this because it streams the screenshot through a different channel. Always delegate to a subagent with the `agent-browser` tool when long-page screenshots are required.
