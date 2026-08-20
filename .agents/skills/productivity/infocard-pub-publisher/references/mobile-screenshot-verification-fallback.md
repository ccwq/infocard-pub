# Mobile screenshot verification fallback for infocard-pub

Use this when browser-based verification is unavailable, flaky, or missing a usable CDP session.

## Primary method: Python playwright（2026-07-04 实测）

Playwright CLI exists (`~/.local/bin/playwright`) but Node.js module is not in node_modules. Use Python API directly:

```bash
python3 -c "
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.goto('https://ccwq.github.io/infocard-pub/docs/{slug}.html', wait_until='networkidle')
    page.screenshot(path='/tmp/{slug}-mobile.png', full_page=True)
    browser.close()
print('done')
"
```
若 Chromium 缺失，先运行 `playwright install chromium`。

## Pattern
1. Start a local static server for the repo.
2. Open the target HTML with headless Chrome/Selenium at a mobile viewport (typically 390×844).
3. Save a screenshot to a temp file.
4. Inspect the screenshot with `vision_analyze` for:
   - horizontal overflow / clipping
   - mobile text legibility
   - floating action buttons covering正文
   - title and stats readability
5. Only then decide whether the page is ready for publish.

## Practical note
- A fixed bottom-right PNG save button should remain visible, but the page must reserve enough bottom/right safe area so the button does not cover正文 on mobile.
- If the button overlaps content, prefer adding mobile-specific safe padding to the content container rather than moving the button away from the unified position.

## Verification output to record
- screenshot path
- viewport size
- whether the save button overlaps正文
- whether the page has obvious horizontal overflow
