# CodeGraph → graph-paper-style session note

## What changed in this session

This session corrected the gap between a `graph-paper` card implementation and the theme preview page.

### Main lessons

- **Graph-first, not report-first**: the card should read like a research manual with a graph-centered hero, not a benchmark/report page.
- **Different graph roles**: the hero graph and the section graph should not repeat the same structure. The hero should act as a broad index map; the section graph should expand query/path relationships.
- **Paper needs texture**: a very faint grid or dot texture is a core signal for this theme. Pure paper color is too generic.
- **Technical annotations help**: small UI details like scale, version, coordinate-like markings, or annotation labels make the shell feel like an engineering drawing rather than a static illustration.
- **Color should stay quiet**: blue is the main accent; other colors must stay secondary and functional.
- **Report modules must not dominate**: installation, benchmark, and result blocks can exist, but they should support the graph narrative instead of becoming the visual center.

## Practical rewrite rules

- Keep the first screen asymmetric and graph-led.
- Reserve the hero for a broad map; reserve later sections for narrower flows.
- Use grid texture + thin rules + monospace labels to keep the paper/manual feeling.
- If a card starts to feel like a product release page, reduce content density and lower color saturation before adding more decoration.

## Related files

- `SKILL.md`
- `theme/graph-paper.html`
- `docs/20260603-codegraph.html`
