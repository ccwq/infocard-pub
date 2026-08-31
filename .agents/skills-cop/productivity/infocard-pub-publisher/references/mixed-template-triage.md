# Mixed-template triage for infocard pages

This reference captures the recurrent failure mode where a page is **not purely stale cache**, but a hybrid of old template structure and newer mobile tweaks.

## Trigger signals
- User says the page is “混乱”, “像桌面版缩小”, or “只改了局部但整体还是旧的”.
- The page has some mobile media queries, but the DOM skeleton still reads like the older template family.
- The page is readable on desktop yet still feels structurally wrong on mobile.

## Triage order
1. Inspect the source HTML first.
2. Search for legacy markers:
   - `.wrap / .banner / .section / .footer`
   - footer-mounted save buttons
   - old `savePageAsPng()` placement
3. Check whether the page is actually a **mixed template**:
   - new CSS layered onto old structural HTML
   - partial mobile overrides without a source rewrite
4. Only after source inspection should cache or Pages freshness be considered.

## Decision rule
- If the page is old or mixed-template, regenerate the page from the current any2card/design-spec path.
- If the page structure is modern but still cramped, then tune typography / spacing / single-column behavior.
- If the page is modern but the public page differs from source, then investigate deploy/cache.

## Session note
In the 20260601-cc-thinking-skills investigation, the page looked “mixed”: it had mobile overrides, but the underlying structure still behaved like a deskto p-style dense grid. The fix path was therefore **source-generation first**, not cache-first.
