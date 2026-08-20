# table-border-radius-collapse-pitfall

**Date:** 2026-07-14  
**Session:** mattpocock/skills v12 CSS styling beautification  
**Status:** Root cause identified, workaround documented

---

## The Problem

When a `<td>` has `colspan="2"` inside a table using `border-collapse: separate` + `border-spacing`, applying `border-radius` to that `<td>` has **no visible effect** on the corners. The radius is silently ignored.

This caused the scene-row corner-radius (`border-radius: 0 4px 4px 0`) to fail on the mattpocock/skills infocard — the yellow scene rows remained sharp-cornered despite correct CSS.

## Why It Happens

`border-collapse: separate` creates a separate rendering box for each cell. The `border-spacing` property adds transparent gutter between cells. A `<td>` with `colspan` spans multiple column boxes, but the cell's background and border are clipped to the individual column boxes by the separate rendering model.

`border-radius` on a `<td>` works only when the cell's own border box matches the visual extent of its content. With `colspan` spanning multiple column gutters, the `<td>` background cannot extend into the border-spacing gutters — and therefore `border-radius` has no corner geometry to round.

## Affected Pattern

```html
<table class="skill-table" style="border-collapse:separate; border-spacing:0 6px">
  <tbody>
    <tr>
      <td class="skill-name">/ask-matt</td>
      <td class="skill-desc">路由器</td>
    </tr>
    <tr>
      <td class="scene-row" colspan="2"><!-- border-radius HERE silently ignored --></td>
    </tr>
  </tbody>
</table>
```

## Workarounds (in order of preference)

### Option A — `border-collapse: collapse` (simplest structural fix)
Switch the table to `border-collapse: collapse` and use `border` on rows/cells for spacing instead of `border-spacing`. This removes the separate rendering model and `border-radius` on `<td>` works.

```css
.skill-table {
  border-collapse: collapse; /* instead of separate */
  border-spacing: 0;
}
.skill-table tbody tr {
  border-bottom: 6px solid transparent; /* spacing via border instead */
}
```

Tradeoff: loses `border-spacing` vertical rhythm; must recalculate all padding.

### Option B — Wrap scene-row in a div inside the `<td>` (DOM restructuring)
Move the `border-radius` to an inner `<div>` that is not constrained by table cell rendering:

```html
<tr>
  <td colspan="2">
    <div class="scene-row"><!-- border-radius here works --></div>
  </td>
</tr>
```

```css
.skill-table td[colspan="2"] {
  padding: 0; /* remove cell padding, let inner div own it */
}
.scene-row {
  border-radius: 0 4px 4px 0; /* works because div is not a table cell */
}
```

Tradeoff: requires HTML restructuring; if the `<td>` already exists with `colspan="2"` in many cards, a rebuild is needed.

### Option C — Accept reduced corner treatment (no structural change)
If neither A nor B is feasible, use a softer visual treatment that doesn't depend on `border-radius`:

```css
.scene-row {
  /* Instead of border-radius: 0 4px 4px 0 */
  border-left: 4px solid #c8102e; /* already present */
  box-shadow: inset 2px 0 0 rgba(200, 16, 46, 0.15); /* subtle left-edge glow instead of corner rounding */
  /* or: */
  background: linear-gradient(to right, rgba(200,16,46,0.08) 0%, #fffde0 8px);
}
```

### Option D — Remove `border-collapse: separate` from the table entirely
If the table does not need `border-spacing` for its primary data rows, remove `border-collapse: separate` and use standard `border-collapse: collapse` with row-based borders only. This is the cleanest long-term fix if the table layout can be redesigned.

## General Rule for Infocard Table Styling

For any infocard table where a `colspan="2"` cell needs visual differentiation (colored background, rounded corners, or box-shadow):

1. **Prefer Option B** (inner div wrapper) for scene-row style highlights — it is the most semantically correct and does not break the table model.
2. **Avoid `border-collapse: separate` + `border-spacing`** for tables that have `colspan` cells with decorative styling — the separate rendering model fundamentally limits what can be done with `border-radius` and `box-shadow` on spanning cells.
3. **Design the table structure before choosing `border-collapse`** — if the table needs `border-spacing` rhythm, plan for inner-div wrappers on spanning cells from the start.

## Verification

```bash
# Check if a card has this pattern
grep -l "border-collapse:separate" docs/*.html | xargs grep "colspan.*2"
```

If both appear in the same card, the card may have hidden corner-radius failures on spanning cells.
