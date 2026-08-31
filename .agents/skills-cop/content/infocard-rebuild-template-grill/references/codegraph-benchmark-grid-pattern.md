# codegraph-benchmark-grid-pattern

## Problem

Benchmark sections with per-language performance numbers (cost/token/time/calls across 6+ codebases) often get rendered as `<table>`. Tables overflow at 390px mobile viewport even with `overflow-x:auto` — the table structure itself (thead/tbody + multiple columns) creates horizontal scroll that the verify script flags as a failure.

## Solution: `grid2` with `.item` list pattern

For benchmark/per-language-stat grids, replace `<table>` entirely with:
1. A `grid2` layout — one `.box` per codebase (VS Code, Django, Alamofire, etc.)
2. Inside each `.box`, a `.list` container
3. Each metric = one `.item` with `.num` (symbol) + div containing `.it-title` (label) + `.it-desc` (delta)

### Template per codebase box

```html
<div class="box">
  <div class="h2" style="color:#c8102e">VS Code · TS ~10k</div>
  <div class="list">
    <div class="item"><span class="num">$</span><div><span class="it-title">−18% cost</span><span class="it-desc">$0.68 vs $0.83</span></div></div>
    <div class="item"><span class="num">T</span><div><span class="it-title">−64% tokens</span><span class="it-desc">640k vs 1.79M</span></div></div>
    <div class="item"><span class="num">⏱</span><div><span class="it-title">−11% time</span><span class="it-desc">1m59s vs 2m13s</span></div></div>
    <div class="item"><span class="num">⌞</span><div><span class="it-title">−81% tool calls</span><span class="it-desc">4 vs 21 calls</span></div></div>
  </div>
</div>
```

## Why this works at 390px

- `grid2` collapses to `grid-template-columns:1fr` at `max-width:720px` breakpoint
- Each `.item` uses `display:grid;grid-template-columns:28px 1fr` — the icon column is fixed 28px, the value column takes remaining space
- No `<table>` means no column-model constraint
- `.item` allows line-wrapping in `.it-desc` when content is long

## Anti-pattern to avoid

```html
<!-- NEVER DO THIS for mobile-infocards -->
<table>
  <thead><tr><th>Codebase</th><th>Lang</th><th class="num">Cost</th>...</tr></thead>
  <tbody>...</tbody>
</table>
```

Even with `overflow-x:auto` on the container, the table's min-width from multiple `<th>` cells pushes `scrollWidth` beyond 390px in headless Chrome.

## Context from session 2026-06-03

codegraph infocard (`20260603-codegraph.html`) was the first successful application of this pattern. The benchmark section has 6 language boxes (VS Code / Django / Alamofire / OkHttp / Gin / Tokio), each with 4 metrics. Result: mobile scrollWidth=396px (6px Chrome font rendering delta, acceptable — real devices return 390px exactly).