# Claude Sub-Agents Golden System

This reference captures the strongest layout pattern observed in the benchmark page `claude-subagents` and the derived rules for technical-manual-style info cards.

## What makes the benchmark strong
- Strong hero with a dominant title block.
- Immediate stats/metadata strip in the first viewport.
- Mixed module grammar: diagram / table / code / callout / checklist / FAQ.
- Clear numbered section rhythm.
- High information density without relying on a single text format.
- Red-black-white palette with sharp contrast and frequent visual anchors.

## Canonical technical-manual skeleton
Use this order as the default for Agent/API/CLI/workflow docs:
1. Header / hero
2. Stats / quick facts
3. Warning or important note
4. Numbered sections
5. Evidence blocks (table, code, flow, compare cards)
6. Safety / pitfalls / FAQ
7. Footer / source / verification note

## Component expectations
Prefer these components when the subject is technical or procedural:
- `lead`
- `grid2` / `grid3`
- `kv`
- `badge`
- `arch`
- `code`
- `table`
- `list`
- `flow`
- warning/callout blocks

## Hard checks
- Must read as a designed page, not a Markdown export.
- Must preserve strong mobile readability at 390px and 780px.
- If the page lacks the skeleton above, treat it as a rebuild candidate rather than a minor polish task.
- Keep the hero/stats/warning trio visible early; it establishes the whole page identity.

## Notes from this session
- `free-claude-code` was structurally fine but flatter than the benchmark: fewer component types, weaker visual tension, and less dramatic spacing rhythm.
- `voxcpm-investigation` was logically sound but too report-like: fewer tables/diagrams/metric cards, so it felt less rich than the benchmark.
- For technical-manual cards, stronger visual hierarchy usually comes from component variety, not just more text.
