# Recovery lesson: mobile comparison tables and visual-model disagreement

## Observed failure pattern

A batch passed static checks and even the mechanical `document.documentElement.scrollWidth <= clientWidth` check, but visual review still reported clipped right columns and incomplete card edges. The original repair used only a local horizontal-scroll wrapper; this was technically valid but visually undiscoverable and remained easy for a screenshot reviewer to interpret as clipping.

## Durable repair pattern

For comparison tables with 3+ products/providers:

1. Preserve the semantic desktop table.
2. Generate a mobile card-list representation from the same `<thead>` and `<tbody>` data.
3. At the 640px breakpoint, hide the table and show `.mobile-table-cards`.
4. Each mobile row card must show the dimension label plus every compared column with explicit labels.
5. Constrain cards to the content width and use `overflow-wrap:anywhere`.
6. Re-run DOM checks and capture screenshots after the repair; do not reuse pre-repair screenshots.

## Verification recipe

```js
({
  pageWidth: document.documentElement.scrollWidth,
  viewportWidth: document.documentElement.clientWidth,
  mobileRows: document.querySelectorAll('.mobile-table-cards .mobile-row').length,
  mobileDisplay: getComputedStyle(document.querySelector('.mobile-table-cards')).display,
  tableDisplay: getComputedStyle(document.querySelector('table')).display,
})
```

Expected mobile result:
- page width equals viewport width;
- mobile rows are non-zero and visible;
- desktop table is hidden;
- every mobile card right edge stays inside the viewport.

## Evidence discipline

If a visual model still reports a defect, inspect the specific region by scrolling to it and capture a fresh screenshot. A screenshot of the hero cannot prove a lower table or page-end region. Separate genuine visual defects from incomplete viewport coverage and infrastructure 503s. Do not upgrade a mechanical pass to visual pass without a screenshot covering the trigger-bearing region.
