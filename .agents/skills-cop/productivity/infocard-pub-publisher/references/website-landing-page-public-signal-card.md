# Website landing-page public-signal card

Use this pattern when the source is a public website or product landing page rather than a GitHub repository.

## Scope rule

Only state what the public page actually exposes.

Allowed evidence classes:
- `<title>` and meta description
- visible UI controls and labels
- visible route/category tree or sidebar entries
- multilingual paths and `hreflang`
- SEO / accessibility / structured-data signals
- explicit public tech markers surfaced in HTML (for example `meta generator`, visible runtime shell markers)
- public social signals like `twitter:site` if present in meta

Do **not** infer or narrate:
- hidden backend architecture
- private repository structure
- internal storage or API implementation
- unobserved frameworks beyond explicit public markers
- product capabilities not visible on the current page or clearly linked public paths

## Good framing

For site cards, write the core narrative around:
1. what the interface *is for*
2. what interaction surface is visible right now
3. how information is organized for the user
4. what public technical/product signals imply about product maturity

## Example: algorithm visualizer

For an algorithm-visualization site, prefer:
- sidebar route tree
- playback controls
- language switch
- visible algorithm categories
- stateful learning model (step/play/pause)

Avoid:
- claiming hidden data models or backend services
- describing repo structure unless separately verified from a public repo source

## Reporting note

If some structural conclusion is inferred from the visible route set rather than directly labeled in the page, say so in the co-located report.

## Why this exists

This prevents repo-style over-claiming when the task is really a website card. Public site cards should stay evidence-bounded, especially when no linked source repo was part of the task.