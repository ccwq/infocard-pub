# infocard meta.yaml Schema (build-script compatible)

> Canonical schema for `.html.meta.yaml` files in infocard-pub. Must match what `scripts/index-build-lib.js` reads. Updated 2026-07-18.

## Required fields (index build reads these)

| Field | Type | Notes |
|-------|------|-------|
| `slug` | string | Lowercase kebab, no `YYYYMMDD-` prefix |
| `path` | string | Full relative path: `docs/<slug>.html` or `docs/YYYYMMDD-<slug>.html` |
| `category` | string | Non-empty; e.g. `knowledge`, `developer-tool`, `product` |
| `title` | string | Top-level (not inside `identity:`) |
| `date` | string | `YYYY-MM-DD HH:MM:SS`, quoted |
| `updated` | string | Same format as `date` |
| `desc` | string | Non-empty one-sentence description; shown in index |
| `tags` | array | Non-empty list of strings |
| `style` | string | One of: `darkblue`, `redswiss`, `hardblue`, `main-style`, `darkgreen`, `graph-paper`, `handline`, `wood`, `black-head`, `pixelstack`, `q-style`, `paper-warm`, `white-purple`, `color-material` |

## Optional fields (index build ignores, safe to include)

| Field | Type | Notes |
|-------|------|-------|
| `source` | string | Single type: `x-post`, `official-docs`, etc. |
| `source_url` | string | Primary source URL |
| `author` | string | Author display name |
| `x_author` | string | X author display name |
| `x_handle` | string | X handle e.g. `@GitHub_Daily` |
| `x_status_id` | string | X status/tweet ID |
| `x_post_url` | string | Full X post URL |
| `taxonomy` | object | `tool_types` and `topics` arrays |
| `schema_version` | number | Always `1` |

## Extended fields (safe to include, index build ignores)

These can live at top-level or under any key — index build only reads the flat mechanical fields above:

- `sources` — detailed source list with engagement stats
- `verification_status` — boundary claims and caveats
- `asset_references` — image asset declarations
- `hero` — hero section spec
- `identity` — subagent-written wrapper (strip before copying to worktree)

## Common mistake: subagent `identity:` wrapper

Subagents write nested `identity:` blocks. These must be flattened:

```yaml
# Subagent WRITES this:
identity:
  title: "Card Title"
  tags: [Tag1, Tag2]

# Main thread NORMALIZES to this:
title: "Card Title"
tags:
  - Tag1
  - Tag2
# (remove identity: wrapper entirely)
```

## Minimal valid meta.yaml

```yaml
slug: my-card
path: docs/20260718-my-card.html
category: knowledge
title: "My Card Title"
date: "2026-07-18 18:32:15"
updated: "2026-07-18 18:32:15"
desc: "One-sentence description."
tags:
  - Tag1
  - Tag2
style: hardblue
```

## YAML quoting rules

- Clock values (`date`, `updated`) must be quoted: `"2026-07-18 18:32:15"`
- Fields containing `:`, `#`, or leading/trailing spaces should be quoted
- Multi-line strings: use `|` or `>` block scalar, or double-quote with `\n`
- Inline lists/objects with special chars: quote the whole value
