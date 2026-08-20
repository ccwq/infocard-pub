# Mobile overlap recovery — 2026-08-01

## Reproduction

The affected cards were served locally on port 5588 and inspected at a 390px emulated viewport. Static HTML contained mobile rules, but a later rule in some generated cards still set `.content-grid` / `.verdict-grid` to `display:block`. Computed style therefore differed from the intended source pattern.

A representative failing geometry looked like this:

```text
.content-grid display: block
child 1: top=1695.2 bottom=1856.2
child 2: top=1856.2 bottom=2017.2
child 3: top=2017.2 bottom=2178.2
```

The card boxes touched exactly at their boundaries, producing the user-visible “overlap/double border” impression.

## Repair

Use an explicit mobile grid rule after all theme/template rules:

```css
@media screen and (max-width:640px){
  .content-grid,.verdict-grid,.compare-grid,.arch-body,.timeline-body{
    display:grid !important;
    grid-template-columns:1fr !important;
    gap:12px !important;
  }
  .content-grid > *, .verdict-grid > *, .compare-grid > *,
  .arch-body > *, .timeline-body > * { margin:0 !important; }
}
```

If the page is generated from mixed templates or browser-injected CSS can override the stylesheet, a small runtime guard may set the same three properties with `style.setProperty(..., 'important')` only when `matchMedia('(max-width:640px)')` is true. Verify the result in computed style; do not rely on source inspection.

For the boundary between a major panel and the next section title, use explicit spacing rather than relying on collapsed margins:

```css
.timeline { margin-bottom:24px; }
.section-title { margin-bottom:16px; }
```

For a mobile table card list, add a top gap from the desktop header and use parent `gap` for rows:

```css
.mobile-table-cards { padding-top:12px; gap:8px; }
.mobile-row { margin:0; box-shadow:none; }
```

## Border-direction conversion

When a desktop multi-column component becomes a one-column mobile stack, remove desktop `border-right` rules and use row separators instead:

```css
@media (max-width:640px){
  .timeline-body > *, .arch-body > * { border-right:0; border-bottom:1px solid var(--line); }
  .timeline-body > :last-child, .arch-body > :last-child { border-bottom:0; }
}
```

This prevents a leftover desktop column seam from looking like a clipped edge or doubled border on mobile.

## Verification

At 390px, verify:

- `document.documentElement.scrollWidth <= document.documentElement.clientWidth`;
- each affected container has `display:grid` and `grid-template-columns:351px` or equivalent one-column layout;
- child rectangles have a positive gap rather than `next.top === previous.bottom`;
- stacked timeline/architecture children have `border-right:0` and row separators;
- all card right edges remain inside the viewport with a safe margin;
- full affected region is captured, including the panel bottom;
- screenshot artifacts such as rainbow rails or circular cursor overlays are not treated as page DOM until confirmed.

## Pitfall

A vision model may call normal viewport cropping or a screenshot overlay “page overlap.” Re-check the full region and DOM geometry before changing coordinates or adding negative margins. Conversely, a clean `scrollWidth` check alone does not prove that cards are separated: exact touching child rectangles can still create a visible double seam.
