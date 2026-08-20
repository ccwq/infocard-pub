# Table horizontal scroll CSS pattern for infocard pages

**Date**: 2026-06-21  
**Trigger**: graph-paper style card with 7-column table (`天润科技西安上市公司全景分析`)  
**Symptom**: all columns visible on desktop; on mobile, table overflows viewport but no horizontal scroll gesture works — user sees rightmost columns cut off

## Root cause analysis

Three independent CSS issues combined:

1. **`body { overflow-x: hidden }` — the table scroll killer**  
   Present in many existing card styles. This blocks ALL horizontal scroll on the page, including `.table-wrap { overflow-x: auto }`.

2. **`.table td:first-child { white-space: nowrap }` — widens the table artificially**  
   Forces the first column to a single line regardless of content, expanding the minimum table width and making overflow unavoidable on narrow screens.

3. **Grid children default to `min-width: auto`** — a 760px table forces sibling sections to render at desktop width even on mobile, because grid items absorb the widest child's min-content size.

## Correct CSS pattern

```css
/* === Desktop base === */
.table-wrap {
  overflow-x: auto;
  max-width: 100%;       /* ← critical: keeps table inside card boundary */
  border: 1px solid var(--line);
  background: #fff;
}

/* === DO NOT put overflow-x on body === */
html, body {
  /* no overflow-x:hidden here — it kills .table-wrap scroll */
}

/* === Remove first-column nowrap — let it wrap === */
.table td:first-child {
  /* white-space: nowrap; ← DELETE this if present */
}

/* === Mobile: explicit scroll container === */
@media (max-width: 760px) {
  .table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
  }

  /* Grid children: prevent them from stretching page width */
  .grid-outer > *,
  .hero,
  .section,
  .split2 > * {
    min-width: 0;
  }
}
```

## Verification (terminal check — no browser needed)

```bash
# Should NOT contain body overflow-x:hidden
grep -n "overflow-x:hidden" card.html | grep "body"
# → empty = good

# Should contain table-wrap overflow-x:auto
grep -n "overflow-x:auto" card.html
# → .table-wrap { overflow-x: auto } = good

# Should NOT contain table td:first-child white-space:nowrap
grep -n "white-space:nowrap" card.html | grep "td:first-child"
# → empty = good
```

## Pass condition

On 390px viewport:
```js
document.querySelector('.table-wrap').scrollWidth > window.innerWidth
// → true: table is wider than viewport, scroll works

document.body.scrollWidth <= window.innerWidth
// → true: page itself does not overflow (grid min-content fixed)
```

## When to apply this pattern

Any card with:
- A `<table>` inside `.table-wrap`
- More than 4 columns
- Columns containing Chinese text or long labels
- Mobile-first layout (720px breakpoint)

## Old anti-pattern (what NOT to do)

```css
/* WRONG — kills table scroll on ALL cards */
body { overflow-x: hidden; }
```

```css
/* WRONG — forces first column single-line, widens table */
.table td:first-child { white-space: nowrap; }
```

The old `mobile-overflow-fixes.md` Step 2 recommended `body { overflow-x: hidden }` as a general mobile fix — this is wrong for cards containing tables. This file supersedes that recommendation for table-containing cards.
