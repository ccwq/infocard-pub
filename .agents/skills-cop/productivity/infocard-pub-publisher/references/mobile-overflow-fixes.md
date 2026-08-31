# Mobile overflow / clipping fixes for infocard pages

This note captures the repeatable fixes discovered while publishing `infocard-pub` cards that looked fine on desktop but lost the right edge or border on phones.

## Symptoms
- Right-most content is cut off on mobile.
- The right border/line is invisible even though desktop screenshots look fine.
- Cards feel slightly zoomed or squeezed on small screens.
- Long labels or dense text push the layout wider than the viewport.

## Most likely causes
1. A container relies on `100vw` or fixed width instead of `100%`.
2. Outer padding is too large for narrow screens.
3. Grid children lack `min-width: 0`, so text forces the column wider.
4. Long text lacks `overflow-wrap: anywhere` / `word-break: break-word`.
5. iPhone-style safe areas hide the edge because the layout does not include `env(safe-area-inset-left/right)`.
6. A visible outer border sits on the viewport edge and gets clipped by the browser chrome or the safe area.

## Reliable fix sequence
1. Make the page wrapper fluid:
   ```css
   .page {
     width: 100%;
     max-width: 780px;
     margin: 0 auto;
   }
   ```
2. Add horizontal clipping protection on the page root:
   ```css
   /*
    * ⚠️ WARNING: body { overflow-x: hidden } KILLS table horizontal scroll.
    * DO NOT use this for cards that contain .table-wrap or wide tables.
    * It blocks all horizontal overflow including .table-wrap { overflow-x: auto }.
    * Only apply overflow-x:hidden to body when the card has NO wide tables.
    * See: references/table-mobile-scroll-css-pattern.md
    */
   body { /* no overflow-x:hidden for table cards */ }
   .card { max-width: 100%; }
   ```
3. Use smaller mobile padding, then smaller again for very narrow screens:
   ```css
   @media (max-width: 720px) {
     .banner, .grid, .footer { padding-left: 1rem; padding-right: 1rem; }
   }
   @media (max-width: 400px) {
     .page { padding-left: .35rem; padding-right: .35rem; }
   }
   ```
4. Add safe-area aware padding when the right edge still disappears on phones:
   ```css
   .page {
     padding-left: calc(.7rem + env(safe-area-inset-left));
     padding-right: calc(.7rem + env(safe-area-inset-right));
   }
   .banner {
     padding-left: calc(2.8rem + env(safe-area-inset-left));
     padding-right: calc(2.8rem + env(safe-area-inset-right));
   }
   ```
5. Stop grid children from expanding columns:
   ```css
   .stat, .card-item, .tl-item, .tool-item { min-width: 0; }
   ```
6. Make dense text wrap aggressively:
   ```css
   .stat-lab,
   .card-title,
   .card-body p,
   .tl-title,
   .tl-text,
   .priority-text,
   .issue-desc,
   .sol-body,
   .quote-box p {
     overflow-wrap: anywhere;
     word-break: break-word;
   }
   ```
7. Downshift cramped grids on narrow screens:
   ```css
   .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
   .card-grid,
   .timeline,
   .tool-list,
   .priority-row,
   .solution-grid,
   .issue-list { grid-template-columns: 1fr; }
   ```

## Right edge / border still invisible?
If the layout no longer overflows but the right border still looks missing on a phone screenshot:
- check if the border sits flush with the viewport edge
- increase right padding first
- if needed, move the visual divider inward instead of relying on the outermost border
- prefer an inner red separator line for phone views when the edge is visually fragile

## Table inside a card gets squished on mobile — CORRECT pattern

**User requirement**: only the table content scrolls; card header/title stays fixed.

**Wrong pattern** (rejected by user 2026-06-18): making `.chart-card` or `.wide` the scroll container — this scrolls the card header/title with the table, which is not what the user wants.

**Correct pattern**: dedicated `.table-scroll` wrapper around `<table>` only.

### Step 1 — HTML: wrap only the `<table>` in a scroll div

```html
<article class="chart-card">
  <div class="panel-head">...</div>
  <h2>v1 → v2 逐项变化</h2>
  <div class="table-scroll">           <!-- scroll wrapper: ONLY around table -->
    <table class="diff-table">...</table>
  </div>
</article>
```

The panel-head and h2 stay **outside** the `.table-scroll` wrapper — they never scroll.

### Step 2 — CSS: make only the wrapper scroll

```css
/* Mobile: table-scroll is the scroll container */
@media (max-width: 720px) {
  .table-scroll {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    display: block;
    min-width: max-content;   /* force table to its natural width */
    width: 100%;              /* fill the card */
  }
  /* Remove any overflow-x from .chart-card or .wide — they must NOT scroll */
  .chart-card { overflow-x: visible; }
  .wide       { overflow-x: visible; }
}
```

### Verification checklist

In Chrome DevTools (390px mobile viewport):
```js
// panel-head and h2 are outside the scroll wrapper — they never move
var ph = document.querySelector('.panel-head');
var scroll = document.querySelector('.table-scroll');
console.log('panel-head overflow-x:', window.getComputedStyle(ph).overflowX);
// -> visible (fixed, does not scroll)

// table-scroll is the scroll container
console.log('table-scroll scrollWidth:', scroll.scrollWidth, '> viewport:', window.innerWidth);
// -> PASS if scrollWidth > innerWidth (table is wider than viewport, can scroll)

scroll.scrollLeft = 300;
console.log('scrolled, scrollLeft:', scroll.scrollLeft);
// -> PASS if value is 300 (JS can scroll it)
```

Key confirmations:
- `.panel-head` / `<h2>` → `overflow-x: visible` (fixed)
- `.table-scroll` → `overflow-x: auto`, `scrollWidth > innerWidth` (can scroll)
- `panel-head.scrollLeft` → no such property or 0 (confirmed outside scroll zone)

## Applicable cards
Any card with a `diff-table`, `comparison-table`, or wide table inside a `.card` / `.panel` / `.chart-card` wrapper where the card has a visible header/title that must not scroll.
