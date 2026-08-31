# infocard-darkblue-style Creation Pattern

## Session Reference
Created 2026-06-12. Source: Nezha card design image → new style extraction.

## Design Language Extracted

### Color Tokens (from Nezha card)
```css
:root{
  --bg:#0c1020;       /* 深蓝黑底 */
  --bg-2:#11162a;     /* 渐变中层底 */
  --panel:#171c2b;   /* 玻璃面板底 */
  --panel-2:#0f1424;  /* 面板子底 */
  --ink:#eef4ff;     /* 主文字 */
  --muted:#a8b7df;   /* 弱信息文字 */
  --line:rgba(255,255,255,.12); /* 边框 */
  --cyan:#58c3ff;    /* 青蓝主强调 */
  --blue:#4a78ff;    /* 蓝 */
  --green:#2db36a;   /* 绿-运行中 */
  --yellow:#f4c84c;  /* 黄-警告 */
  --purple:#8459ff;  /* 紫-CTA/主下载 */
}
```

### Background Pattern
```css
body{
  background:
    radial-gradient(circle at 18% 10%, rgba(88,195,255,.16) 0 10%, transparent 11%),
    radial-gradient(circle at 86% 8%, rgba(132,89,255,.18) 0 9%, transparent 10%),
    radial-gradient(circle at 72% 72%, rgba(45,179,106,.10) 0 13%, transparent 14%),
    radial-gradient(circle at 18% 78%, rgba(244,200,76,.08) 0 11%, transparent 12%),
    linear-gradient(180deg,#0b1020 0%,#10162a 46%,#0c1020 100%);
}
```

### Icon Component (SVG, not emoji)
```html
<div class="mini-icon cyan" aria-hidden="true">
  <svg viewBox="0 0 24 24" width="19" height="19"
    stroke="currentColor" fill="none"
    stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
    <path d="..."></path>
  </svg>
</div>
```
**Rule**: Use SVG icons, not emoji. Clean linear icons with `stroke="currentColor"`.

### Layout Skeleton
```
.hero         (grid 2col: copy | visual panel)
  └─ kicker-row / title / subtitle / subcn / pill-row / hero-note
  └─ hero-visual (compare panel + mini-cards + gradient strip)
.shell        (grid 3col: workspace | tasks/terminal/editor | status/stats)
  └─ panel (glass with border + shadow)
.feature-row  (6-col grid of icon+span feature cards)
.download     (gradient CTA button)
.footer
```

### CSS for Glass Panel
```css
.panel{
  background:linear-gradient(180deg,var(--panel) 0%, #141a29 100%);
  border:1.5px solid rgba(255,255,255,.08);
  border-radius:18px;
  box-shadow:0 12px 26px rgba(0,0,0,.18);
}
```

## Creation Checklist (same as infocard-style-man-skill schema)

- [ ] `_themes.yaml`: slug/css_class/pill/position/title/desc/keywords/swatch/preview_url/ref_links/note
- [ ] `theme/{slug}.html`: full element demo (hero + shell + features + CTA + footer)
- [ ] `scripts/rebuild_themes.py`: auto-generates themes.html from _themes.yaml → run after YAML change
- [ ] `themes.html`: verify 10 themes (if 9 before → 10 after)
- [ ] Push → verify HTTP 200 on theme preview page
- [ ] Skill `content/infocard-{slug}-style` created with full schema

## Anti-patterns
- Don't use emoji as primary icons (use SVG linear icons)
- Don't use warm paper texture / Q-style / wood-style elements
- Don't make large red areas (darkblue is cold/neutral, not red)
- Don't skip the `theme/{slug}.html` preview page — it's required for _themes.yaml preview_url
