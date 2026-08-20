# 390px mobile verification notes for `infocard-main-style`

Session-tested learnings:

- Dense technical tables in main-style cards should not be allowed to shrink into unreadable columns on 390px screens.
- If a table is part of a dense section, wrap it in a dedicated scroll container and give the table a reasonable min-width so the page itself does not stretch.
- Keep the button in normal flow; verify it sits below正文 and does not overlap content.
- For mobile verification, prefer a real 390px full-page screenshot as the source of truth.
- If browser navigation times out during visual QA, use Playwright CLI screenshot as the fallback artifact:
  ```bash
  playwright screenshot -b chromium --viewport-size='390,844' --timeout=60000 --full-page <url> /tmp/<slug>-mobile.png
  ```
- After taking the screenshot, inspect it for:
  - horizontal overflow
  - overlapping save/export button
  - tiny footer/meta text
  - table readability
  - section breakage
