# Technical Manual Golden Checklist

Use this when generating or reviewing technical-manual-style info cards: Agent docs, CLI/API references, workflows, architecture explainers, troubleshooting guides, and model/tool comparison cards.

## One-vote-fail items
If any of these fail, prefer rebuild over minor polish:
- No strong hero/title block
- No early stats/metadata strip
- No visible warning/pitfall/callout
- No numbered section rhythm
- No evidence blocks beyond plain text
- No source/verification note in the footer
- Obvious mobile overflow at 390px or 780px
- The page reads like a Markdown dump rather than a designed card

## Required rhythm
Aim for:
1. Hero / header
2. Stats / quick facts
3. Warning / key note
4. Sections with numbers or named anchors
5. Evidence blocks (table, code, flow, compare cards)
6. Safety / FAQ / pitfalls
7. Footer / sources / verification

## Component coverage target
A strong card usually uses at least several of:
- lead paragraph
- metric cards or kv blocks
- badge/tag chips
- tables
- code blocks
- flow/sequence blocks
- side-by-side compare cards
- warning or note blocks
- footer source block

## Visual DNA target
- Red / black / white palette with sharp contrast
- Dense but readable spacing
- Typography hierarchy that is obvious at a glance
- Enough component variety to avoid a flat text wall
- Mobile layout that collapses cleanly into one column when needed

## Review notes from this session
- `free-claude-code`: the structure is clean, but the module variety and spacing drama are too low versus the benchmark. It needs a stronger center module and more contrast in the section rhythm.
- `voxcpm-investigation`: logically strong, but too report-like. Add matrix/compare/table/metric surfaces so the page feels designed rather than merely formatted.
