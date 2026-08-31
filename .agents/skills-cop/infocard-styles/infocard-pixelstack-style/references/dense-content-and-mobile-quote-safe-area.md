# Dense content and mobile quote safe-area notes

## What this session taught

- Pixelstack does **not** need to stay at 4 blocks. For source-rich topics, the default should expand to **6–8 blocks** so the card can carry facts, mechanism, trade-offs, use cases, and QA notes.
- The three-piece visual anchor remains mandatory: pyramid, thinker, and fading quote/arrow.
- On mobile, left-side quote text must be treated as a responsive element, not a fixed decoration.

## Practical rules

1. Prefer 6–8 blocks when the source has enough structure.
2. Split content into these buckets when available:
   - what it is
   - how it works
   - what changed / key facts
   - where it fits
   - what it trades off
   - who it is for
   - what not to use it for
   - QA / acceptance criteria
3. Mobile quote rule:
   - keep the quote inside the stage safe area
   - if it clips, move it up or make it flow inline before shrinking the whole stage
   - do not rely on `max-width` alone to save a quote that is positioned off-canvas
4. Use browser/mobile vision to confirm quote legibility; DOM width checks alone can miss visual clipping.
