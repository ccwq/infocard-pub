# 2026-06-03 Neo Mirai + SkillOpt mobile repair notes

## What happened
- External visual insert was sourced from `https://impeccable.style/cases/neo-mirai/`.
- Candidate images discovered: `og-image-v2.jpg`, `assets/cases/neo-mirai/live-fold.png`, `assets/openai_image_2_hifi.jpg`, `assets/openai_image_2_brand.jpg`, `assets/cases/neo-mirai/live-page.png`.
- The published card inserted **exactly one** image, chosen as the content anchor.
- The inserted image was downloaded locally and referenced from `docs/assets/images/20260602-skillopt-cookbook/live-fold.png`.

## Layout failure pattern observed
- A rebuild can accidentally lose foundational CSS rules while still leaving the page visually plausible on desktop.
- The first symptom on mobile was a stats/header strip rendered as normal block flow instead of a compact dashboard grid.
- The root cause was not the text itself; it was missing layout rules for `.stats`, `.stat`, and `.meta .rev`, combined with a mobile body width rule that still used `100vw`.

## Fix pattern
1. Restore the base layout rules first:
   - `.meta .rev`
   - `.stats` as a grid
   - `.stat` padding / alignment / min-width
   - warning text emphasis rules
2. For mobile, collapse before shrinking text:
   - `body{width:100%; max-width:100%; overflow-x:hidden}`
   - `.card{width:100%; max-width:100%}`
   - hide the empty header middle column
   - keep `meta` as flex-wrap content
   - change stats to `repeat(2, minmax(0, 1fr))`
3. Add global anti-overflow guards:
   - `.card, .card * { max-width:100%; min-width:0; overflow-wrap:anywhere; word-break:break-word; }`
4. Verify with a browser/mobile viewport before publishing.

## Verification rule
- Always confirm exact image count after insertion.
- If the first-fold stats strip looks like a desktop缩放稿, treat it as a structure problem and fix the grid, not just the font size.
- Use a 390px browser pass after the visual insert is added.
