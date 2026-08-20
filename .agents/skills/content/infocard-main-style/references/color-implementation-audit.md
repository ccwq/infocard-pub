# infocard-main-style: Color Implementation Audit

## 2026-06-05 Core Lesson

**Problem**: Karakeep card used `infocard-main-style` but looked nothing like `theme/main.html`.

**Root Cause**: The skill described design intent ("红黑白主骨架") but did NOT define concrete CSS token values. The card author chose ad-hoc colors (`#28231d`, `#f8efd9`, `--accent1` through `--accent5`) that satisfied "roughly red-black" but diverged wildly from the actual `theme/main.html` palette.

**Conclusion**: A style name alone does NOT guarantee visual consistency. The skill MUST define the CSS token layer, and ALL cards using that style MUST use those exact tokens — not approximate equivalents.

## Why theme/main.html Is NOT the Living Reference

`theme/main.html` is the **UI element demo page** — it shows what each CSS token looks like in isolation, but it is not a complete information card. It lacks the full rhythm, spacing, and design "soul" of a real card.

**The real living reference is `docs/20260530-duix-avatar.html`.** This is the canonical infocard that implements the design system with actual content, real breathing room, and the full visual DNA. When rebuilding or creating a card:
- Use `duix-avatar.html` as the **design template** (structure, rhythm, color application)
- Use `theme/main.html` as the **token reference** (exact hex values for each token)

If a card looks lifeless or mechanical after a rebuild, the card is wrong — it deviated from the `duix-avatar` DNA, not from `theme/main.html`.

## Correct CSS Implementation

```css
:root {
  --red:      #c8102e;
  --black:    #0a0a0a;
  --paper:    #fffdf9;
  --page-bg:  #f5f2ec;
  --blue:     #0036a3;
  --blue-bg:  #eef4ff;
  --yellow:   #e8c200;
  --yellow-bg:#fff1b0;
  --green:    #15803d;
  --green-bg: #dcfce7;
  --text:     #111;
  --muted:    #555;
}
```

## Common Wrong Patterns (Never Use)

```css
/* WRONG — brown instead of black */
--border: #28231d;
--ink:    #1d1b16;

/* WRONG — warm paper instead of white paper */
--paper: #f8efd9;

/* WRONG — multi-accent mess instead of blue/yellow/green */
--accent1: #9bdc77;
--accent2: #7cc8ff;
--accent3: #ffc45c;
--accent4: #f56a7a;
--accent5: #c084fc;

/* WRONG — filled dark header instead of border-only header */
.header { background: var(--black); border-radius: 0 0 22px 22px; }
```

## Visual Structure Reference (from theme/main.html)

| Component | Style |
|---|---|
| Header | White background; `border-bottom: 2px solid var(--black)` only |
| Stats bar | White/light background; `border: 1.5px solid var(--black)` full surround |
| Section header | Full `var(--black)` fill, white text |
| Section body | White/light `var(--paper)` fill |
| Pills | White base, colored fill variants only |
| Page background | `var(--page-bg)` |
| Main border weight | `1.5px` or `2px solid var(--black)` |
| Red accent usage | Section numbers (`01`), highlight numbers in stats, highlight tags |