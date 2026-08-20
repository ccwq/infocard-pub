# Playwright headless screenshot for pixelstack cards

## Reliable approach: CLI binary

```bash
playwright screenshot --viewport-size="390,844" \
  https://ccwq.github.io/infocard-pub/docs/20260702-planning-with-files-cookbook.html \
  /tmp/pwf-cookbook-390.png
```

The binary lives at `/home/ccwq/.local/bin/playwright`.

## Unreliable approach: Node inline script

```javascript
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto('...', { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/tmp/out.png', fullPage: true });
  await browser.close();
})();
"
```

This times out silently without visible error. Always prefer the CLI binary.

## What to check after screenshot

1. Horizontal overflow (scrollbar presence)
2. Right-edge decorative bars from parent iframe (if any)
3. Pixelstack trio visibility: pyramid + thinker + arrow-quote
4. Content readability at 390px
5. "保存 PNG" button does not obscure body text
