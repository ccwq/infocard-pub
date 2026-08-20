# Homepage filter strip density escalation (2026-06-25)

Use this when the user says the homepage taxonomy/tag area is still too loose, too large, or not mini enough **after** a first compact pass.

## Signal words
- 太松散
- 元素太大
- 字体太大
- 间距太大
- 不够紧凑
- 参考 `design-taste-frontend`

## What the user actually means
Do **not** interpret this as a taxonomy-model problem. It is a **visual-density correction** under the existing archive shell.

The right response is to tighten the existing strip, not to explain why it is already compact.

## Escalation path
1. Remove explanatory copy blocks first.
   - Compress the header into a terse control strip.
   - If present, remove visible helper prose such as long notes about how taxonomy works.
2. Remove homepage-level `全部关键词` if the user says it still feels bulky.
   - The keyword row should start directly with mini keyword chips.
3. Shrink all three layers together.
   - section/title text
   - taxonomy row labels
   - chips / count badges / `+N`
4. Reduce visual weight, not just font size.
   - shadow offset down to ~1px
   - chip height down to ~20px (or ~18px in an extreme pass)
   - tighter vertical gaps around dividers and headers
5. Use the user's screenshot as the primary evidence source for what still feels oversized.
   - Focus first on: chip height, count badge size, shadow weight, title-to-row gap, row-to-divider gap.

## Good default targets for the second pass
- filter-strip gap: ~5px
- header title: ~11px
- kicker: ~8px
- taxonomy row label: ~9px
- chip text: ~9px
- count badge: ~7px
- chip/button height: ~20px
- `+N` control: ~20px tall, ~9px text
- shadow: ~1px offset

## What not to do
- Do not defend the prior design verbally before changing it.
- Do not re-open grill-me if the user already gave a clear correction.
- Do not treat `design-taste-frontend` as an infocard theme/template selector here. Treat it as a design-direction signal: less explanation, tighter hierarchy, denser control-strip language.
- Do not change the taxonomy data model when the complaint is clearly about density.

## Release reminder
Homepage filter-strip changes are not complete until all of these happen together:
- source CSS/JS updated
- `index.html` asset version anchor updated
- `docs/version.json` updated
- public homepage HTML references the new `?v=` strings
