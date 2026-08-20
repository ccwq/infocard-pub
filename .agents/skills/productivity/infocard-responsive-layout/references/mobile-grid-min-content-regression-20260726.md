# Mobile grid min-content regression (Qwable card, 2026-07-26)

## Symptom

On a 390px screenshot, the first card can show normal URL text while a later card suddenly turns Chinese into one-character-per-line pseudo-vertical text. A partially visible right-edge decoration may appear at the same time.

## Root cause

This is usually a CSS grid min-content squeeze, not `writing-mode`. A fixed number column plus a flexible text column can be destabilized by long URLs, tables, or code tokens when the flexible track is not explicitly allowed to shrink. The result is a narrow `card-body`, text glyph stacking, or decorative content pushed beyond the viewport.

## Fix pattern

Use `minmax(0,1fr)` for the flexible track and `min-width:0` on every relevant grid/flex child. Scope wrapping to URLs/code/table/card content; do not apply `word-break:break-all` to all prose.

```css
code,pre,table{max-width:100%;overflow:auto}
html,body{max-width:100%;overflow-x:hidden}
.poster-shell,.poster-shell main,.poster-shell .cards-grid,
.poster-shell .skill-card,.poster-shell .card-body{max-width:100%;min-width:0}
.poster-shell .card-title,.poster-shell .card-desc,
.poster-shell code,.poster-shell pre,.poster-shell table{
  overflow-wrap:anywhere;word-break:break-word
}
.poster-shell .card-body table{display:block;width:100%!important;max-width:100%;overflow-x:auto;white-space:normal}
.poster-shell .card-body pre{display:block;white-space:pre-wrap;overflow-x:auto}
@media(max-width:720px){
  .poster-shell .skill-card{grid-template-columns:64px minmax(0,1fr)}
  .poster-shell .card-num{min-width:0;padding-right:16px}
  .poster-shell .card-stripe{left:60px}
  .poster-shell .card-body{min-width:0;overflow:hidden;padding-left:14px;padding-right:6px}
}
```

If the repository static checker requires inline declarations on every code/pre node, retain those declarations on the nodes too; a CSS-only repair may still fail the structural gate.

## Verification

1. Re-read the complete `<style>` tail and check that all nested `@media` blocks close before `</style>`.
2. Run the repository `staticCheck`; satisfy its exact `code/pre/table` coverage rules.
3. Capture a real 390×844 browser screenshot, preferably with a cache-busting query parameter.
4. Use vision review for glyph-per-line squeeze, right-edge clipping, URL/table/code overflow, number/body proportion, and orphaned kicker text. DOM `scrollWidth === clientWidth` is necessary but not sufficient.
5. Run build, verify, card-scoped leak scan, and `git diff --check`.
6. If full taxonomy audit exposes unrelated historical failures, do not repair or stage them for this card; use the card-scoped/changed-only gate and report the baseline separately.

## Cosmetic follow-up

A dense uppercase kicker may orphan a date suffix such as `07`. Fix only the kicker with smaller letter-spacing/font-size or `white-space:nowrap;overflow:hidden`; do not hide substantive card content.
