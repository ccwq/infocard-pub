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

## Mobile evidence recipe

This is a cache-diagnosis recipe only. It does not grant release authority and does not define a publish sequence.

1. Ask the Publisher for the exact deployed URL after the publish SOP completes.
2. **Screenshot with `?cb=$(date +%s)`** to avoid stale browser state.
3. Inspect the fresh screenshot and report mobile findings to the Publisher.
4. Keep the result as `VISUAL_PASSED` or `VISUAL_PENDING`; do not infer release success from this recipe.

## Anti-Pattern

```bash
# WRONG — can show stale cache
playwright screenshot --viewport-size="390,844" --full-page \
  "https://...openwiki.html" /tmp/openwiki-fix-390.png
```

## User Signal

When a user supplies a screenshot, record its URL/viewport provenance before treating it as evidence; do not turn the screenshot recipe into a separate publishing workflow.
