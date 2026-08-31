# CodeGraph Cheatsheet Template Bug — Hardcoded 389px Body Lock

## Problem

The `cheatsheet-generate` HTML output template has this CSS:

```css
body {
  ...
  width: 389px;       /* ← hardcoded narrow column */
  min-width: 389px;   /* ← lock */
  max-width: 389px;   /* ← lock */
  ...
}
```

This is designed for **multi-column cheatsheet layouts** (~389px per column). When such an HTML file is used as a standalone infocard, the page renders at exactly 389px wide on ALL viewports — desktop and mobile alike.

## Detection

```bash
curl -s https://ccwq.github.io/infocard-pub/docs/<slug>.html \
  | grep -o 'width:[^;]*389px'
```

If present, the page has cheatsheet template CSS.

## Fix

Replace the entire CSS block. The correct body rule for standalone infocards:

```css
body {
  font-family: 'IBM Plex Sans', Helvetica, Arial, sans-serif;
  background: var(--black);
  color: var(--white);
  width: min(780px, 100vw);  /* PC full-width up to 780px, mobile 100vw */
  margin: 0 auto;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
```

Add mobile breakpoints at `760px` (grid collapse) and `720px` (table/card stacking).

## Prevention

When creating an infocard from cheatsheet source material, ALWAYS write a fresh Swiss CSS block from scratch. Do not copy or patch cheatsheet template CSS — the `389px` lock and cheatsheet wrapper selectors must be fully replaced.

## Related

- CodeGraph card (`20260603-codegraph.html`) was the victim of this bug in session 2026-06-03; fixed by full CSS reconstruction.
