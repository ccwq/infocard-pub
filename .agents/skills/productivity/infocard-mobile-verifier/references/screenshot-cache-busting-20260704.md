# Screenshot Cache-Busting: ?cb=timestamp Pattern

**Date**: 2026-07-04
**Trigger**: OpenWiki mobile overflow fix — vision analysis showed old CSS despite successful push
**Root Cause**: Playwright screenshots can return cached page state even after CSS update

## Problem

After pushing CSS fix (`@media(max-width:400px)` for `.sop-steps`), screenshot still showed two-column layout. vision_analyze confirmed "SOP 步骤是双列" even though HTML had been pushed and verified via `curl -I`.

## Root Cause

Playwright browser instance cached the page. The URL was identical (`https://...20260703-openwiki.html`) so the browser served a stale cached version.

## Solution

```bash
# Always use cache-busting query param for post-fix verification
playwright screenshot --viewport-size="390,844" --full-page \
  "https://ccwq.github.io/infocard-pub/docs/SLUG.html?cb=$(date +%s)" \
  /tmp/SLUG-390.png
```

## Verification Sequence

1. Push CSS fix → `git push origin main`
2. Wait for Pages deployment (poll HTTP 200)
3. **Screenshot with `?cb=$(date +%s)`** ← mandatory for post-fix verification
4. vision_analyze the fresh screenshot
5. Only then report to user

## Anti-Pattern

```bash
# WRONG — can show stale cache
playwright screenshot --viewport-size="390,844" --full-page \
  "https://...openwiki.html" /tmp/openwiki-fix-390.png
```

## User Signal

When user sends screenshot and says "截图像我证明你解决了" → always respond with `MEDIA:/tmp/filename.png` so user can verify the screenshot is from live URL.
