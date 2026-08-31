# Agent-First IDE cards: theme selection and publish checks

Session note (2026-06-12):
- Repo: `https://github.com/hanshuaikang/nezha`
- README positioning: **Agent-First IDE for Vibe Coding**
- Core capabilities highlighted in README: Claude Code + Codex, Git, editing, task management, multi-project workspaces, parallel tasks, terminal, session discovery, native Git integration, lightweight editor, usage stats, small install size.

## Theme selection lesson
- For repos framed as an agentic desktop workbench / developer IDE / technical productivity tool, `hardblue` was the best fit.
- Do **not** default to `color-material` just because the source has colorful product imagery or polished UI marketing.
- Choose theme from the product’s semantic framing:
  - workbench / IDE / manual / systems tool → `hardblue`
  - tool catalog / CLI ecosystem / open-source roundup → `redswiss`
  - lightweight single-tool tutorial → `q-style`

## Publish verification additions
Use the standard `infocard-pub` publish flow, then add these two checks when the card is a repo card:
1. Confirm the live `_index.yaml` includes the new card and the expected `style` value.
2. Search the homepage by a title keyword and confirm exactly one result.

## Evidence notes
- Live Pages verification succeeded only after waiting for GitHub Pages propagation.
- 390px viewport screenshot showed no horizontal overflow and readable first viewport.
