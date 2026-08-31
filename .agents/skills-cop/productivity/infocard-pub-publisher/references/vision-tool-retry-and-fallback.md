# Vision Tool Retry and Fallback Pattern

**Tested: 2026-06-25**

## Symptom

`mcp_minimax_understand_image` and `vision_analyze` both return HTTP 503 with:
```
'auth_unavailable: no auth available (providers=gemini-cli,xinyuanai666.com@google-key, model=gemini-3-flash-preview)'
```

The error is transient — retrying after 1–5 seconds succeeds.

## Retry Chain

```
mcp_minimax_understand_image (prompt, image_source)
  ↓ 503 / auth error
retry once immediately
  ↓ 503 again
vision_analyze (image_url, question)
  ↓ 503 / timeout
use browser_cdp Page.captureScreenshot as last resort
```

Both MiniMax MCP and the native `vision_analyze` share the same auth provider backend. Failure is per-call, not permanent.

## Fallback: PIL ASCII Preview

When both tools fail and you need to identify the image content:

```python
from PIL import Image
img = Image.open('/home/ccwq/hehome/hermes-data/image_cache/img_*.jpg')
ascii_img = img.convert('L').resize((120, int(img.size[1]/img.size[0]*120*0.5)))
# print rows with '@%#*+=-:. ' chars
```

This gives a low-resolution ASCII preview that often reveals the image subject (e.g. "cat at window" produces recognizable @ shapes).

## When to Use

- User says "图上是什么" with an attached image → try vision tool first
- Vision tool 503 → retry once → PIL ASCII fallback → report what you found
- Do NOT keep retrying in a loop; 1–2 retries is sufficient
- PIL ASCII is a last resort; it cannot read text in images reliably
