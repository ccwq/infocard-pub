# Timeline / Grid Mobile Anti-Pattern

## Core Bug Pattern
The `.timeline` section uses `grid-template-columns: 86px 1fr` for desktop, creating a two-column grid. On mobile, a common mistake is:

```css
/* WRONG - mobile only removes columns, doesn't fix the grid structure */
@media (max-width: 760px) {
  .tl { grid-template-columns: 1fr; }
}
```

This keeps the grid layout but squeezes content into a narrow single column, producing broken horizontal rendering.

## Root Cause
`.tl` is a **grid** (not a table), so the table-responsive pattern (`display:block` on `tr`) doesn't apply. The grid itself must be removed, not just resized.

## Correct Fix

**CSS**: Remove grid from `.tl` entirely:
```css
/* Desktop: no grid on .tl, just a stacked card */
.tl {
  background: #fff;
  border: 1px solid var(--line);
  border-left: 3px solid var(--accent);
  padding: 10px 12px;
}
/* No display:grid on .tl at all */
```

**HTML**: Remove the nested `<div>` wrapper inside each `.tl`. Structure each timeline item as flat stacked elements:
```html
<div class="tl">
  <div class="tl-date">1999.4</div>
  <div class="tl-title">被哈佛全额奖学金录取，公开承诺"毕业后回国报效祖国"。</div>
  <div class="tl-text">同时获得哥伦比亚/威尔斯利/蒙特豪利尤克学院录取通知。</div>
</div>
```

## Related Anti-Patterns to Avoid
- `display:grid` on `.tl` with `grid-template-columns` — always prefer block-level stacking for timeline cards
- Nested `<div>` wrapper inside `.tl` — interferes with stacking; flatten structure
- `table-layout` approach does NOT apply to timeline grids — only to actual `<table>` elements

## Key Distinction
| Layout | Desktop | Mobile Fix |
|--------|---------|-----------|
| `<table>` | multi-column | `overflow-x: auto` with `table-layout: fixed` |
| `.timeline .tl` (grid) | `grid-template-columns: 86px 1fr` | **Remove grid entirely**, use block stacking |
| `.diff-list .diff` | single column | already single column, no change needed |

## Verification
At 390px viewport: each timeline item should render as a full-width card, date badge → title → description stacked vertically, no horizontal squeeze.

## Session Reference
Fixed in session 2026-06-03 on `20260303-harvard-girl-liu-yiting-report` — commit `303c5a8`.