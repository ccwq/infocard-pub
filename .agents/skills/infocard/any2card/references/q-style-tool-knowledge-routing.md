# Q-style routing: GitHub repo → knowledge/tool sharing card

Use this note when the user gives a GitHub repo URL and wants a `infocard-q-style` card.

## Q-style vs hardblue routing table

When the user names `infocard-q-style` explicitly, that overrides the table. When neither applies, use the table:

| Condition | Prefer Q-style | Prefer hardblue |
|---|---|---|
| README has 6+ knowledge blocks | ✅ | |
| Multiple learning paths (3+) | ✅ | |
| Method framework with theory+use structure | ✅ | |
| Course / learning system | ✅ | |
| Product/tool with 2-4 capability pillars and stats | | ✅ |
| CLI with workflow steps / install commands | | ✅ |
| README maps naturally to `method-card` (theory+use per block) | ✅ | |
| README maps naturally to `intro-card` (feature list + stats) | | ✅ |
| First fold needs workflow flow arrows | | ✅ |

**Key insight**: Q-style's `method-card` structure (theory + use with 3+ specific scenarios per block) fits repositories where the README already has conceptual depth. Hardblue's `stat-grid` + `flow` pattern fits repositories where the README is more feature-list driven.

## Session examples (2026-06-06)

| Repo | Style | Why |
|---|---|---|
| `bryanyzhu/agentic-ai-system-course` | Q-style | 22 chapters, 5 learning paths, 4 reference systems, naturally maps to method-cards with theory+use layers |
| `AppFlowy-IO/AppFlowy` | Q-style | 6 knowledge sections, 3 core values, 5 feature modules, install/platform matrix, suitable/not-suitable comparison — rich multi-block structure despite being a product |
| `curl.md` (see `hardblue-technical-share-routing.md`) | hardblue | Tool with stats, 4 entry paths, CLI workflow steps, fits hardblue's capability-pillar + flow pattern |

## Standard Q-style GitHub repo card sections

For a Q-style GitHub repo knowledge card, use this stable section order:

1. **Hero**: kicker + title (conclusion-oriented, not just repo name) + subtitle + badges + stats + hero-visual
2. **Section 01**: Core positioning — what it is / what problem it solves / why it matters
3. **Section 02**: Capability/knowledge blocks (method-grid, 3-6 blocks, each with theory+use)
4. **Section 03**: Use cases / learning paths / audience fit
5. **Section 04**: Installation / quick start / platform coverage
6. **Section 05**: Boundary / suitable vs not-suitable (case-grid, 2 columns)
7. **Section 06**: Links and community (if applicable)

Each `method-card` in a Q-style repo card should contain:
- Method name (h3) + method number badge
- `theory` label + theory text (what it is / why it works)
- `use` label + use text (3+ specific scenarios)
- `data-accent` color variant cycling through green/blue/purple/orange/yellow/teal

See `q-style-html-generation-guide.md` for the full CSS token system and HTML skeleton.
