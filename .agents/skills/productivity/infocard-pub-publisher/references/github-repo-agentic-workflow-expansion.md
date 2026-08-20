# GitHub repo cards: agentic workflow expansion

Use this reference when the source repo is a tool, agent, or workflow library.

## What to extract beyond the README hero

For agent/tool/workflow repos, expand the card around these axes:
- **Decision ladder**: when to use stdlib vs native SDK vs installed dependency vs one-line shell vs minimum viable path.
- **Agent compatibility matrix**: which agents/CLIs are supported, what each one does best, and what boundary conditions matter.
- **Command surface**: slash commands, review commands, audit/debt commands, install/run/bootstrap commands.
- **Operational model**: how state, memory, caches, and collaboration work.
- **Failure modes / caveats**: where the repo’s own docs warn the user.

## Source priority

1. README / docs / examples
2. GitHub metadata (stars, topics, last update)
3. Supporting images or diagrams from the repo itself

## Publishing rule

If the user explicitly asks to **publish** a repo card and the task is high-value, treat wiki sync as part of completion:
- raw page
- concept/entity page
- index.md update
- log.md entry
- verify the wiki repo was committed/pushed if it is under git

## Useful signals from the Ponytail session

The strongest content came from:
- the 6-level decision ladder
- the 13-agent compatibility matrix
- the command palette (`/ponytail`, `/ponytail-review`, `/ponytail-audit`, `/ponytail-debt`)

These are good cues that the repo’s value is *workflow orchestration*, not just a library API.
