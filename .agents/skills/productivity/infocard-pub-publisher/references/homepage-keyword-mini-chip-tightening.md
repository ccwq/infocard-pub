# Homepage keyword mini-chip tightening (2026-06-25)

Use this when the user says the homepage tag area is still too loose, too big, or visually louder than the archive list.

## Problem signal
- User says tag area is "松散", not compact enough, or not "mini"
- User explicitly wants the keyword strip to borrow the existing `全部关键词` visual language instead of introducing a new component family
- Taxonomy rows are acceptable, but the legacy keyword row still feels like a big filter wall

## Recommended decision sequence (grill-me, max 3 rounds)
Ask only one branch per round:

1. Overflow behavior
   - A: single-line mini chips with horizontal scroll
   - B: single-line mini chips with `+N` collapse
   - C: two-line mini chips then expand
   - Recommended default: **B**

2. Label treatment
   - A: keep `全部关键词` as a thin toolbar title
   - B: remove title, chips only
   - C: keep `全部关键词` as the **first mini label** in the same row as the chips
   - Recommended default: **C**

3. Count visibility
   - A: hide counts
   - B: keep a **tiny count badge** on every chip
   - C: show counts only on active chips
   - Recommended default: **B**

## Implementation rules
- Keyword row should visually read as a **single compact tool row**, not a secondary panel.
- Reuse the `全部关键词` chip/button language as the reference style; do not introduce a second visual dialect.
- The first item should be the `全部关键词` label/button, followed by keyword mini chips.
- Chips should use:
  - smaller height than normal facet buttons
  - tighter horizontal padding
  - single-line nowrap
  - very small count badge
- Overflow should collapse to inline `+N`, not a centered floating `+` button detached from the row.
- The keyword strip should stay visually below taxonomy rows in hierarchy.

## Release pitfall
If homepage JS/CSS changed, remember that public verification must include:
1. `index.html` asset query strings updated
2. `docs/version.json` updated
3. public HTML referencing the new `?v=` strings

Otherwise Pages may look unchanged even though `assets/home/index.js` and `index.css` were pushed.
