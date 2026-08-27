# graph-paper-style session note

## Why this theme was created

The user asked for a style inspired by `https://colbymchenry.github.io/codegraph/` — specifically a paper-like research manual with the graph itself as the main visual.

## Final naming decision

- **Skill name:** `infocard-graph-paper-style`
- **Theme slug:** `graph-paper-style`
- **Theme file:** `theme/graph-paper.html`

The user briefly considered naming it `codegraph-style`, but chose the more general `graph-paper-style` so the theme can be reused for other code graph / knowledge network cards.

## Visual DNA agreed with the user

- Off-white paper background
- Thin gray rules / borders
- Graph nodes and connecting lines as the hero visual
- Mono labels for paths, versions, node names, and commands
- A restrained blue accent for emphasis only
- Long-form manual layout, not a poster

## When to use

Use this theme for:

- codebase structure maps
- knowledge graphs
- dependency graphs
- agent / workflow relationship maps
- repository cards where the core story is "turn repo into a graph, then query the graph"

## Session-specific implementation note

The published CodeGraph card used a localized README hero asset downloaded from GitHub user-attachments and referenced it locally in the card body. For similar cards, prefer local assets over hotlinking when the source image is part of the content being summarized.
