# Homepage filter taxonomy data governance

Session lesson: when the user asks whether homepage filters can count/filter newly added cards, treat it as a **data pipeline / schema governance** question, not a UI/layout question. Do not spend analysis on chip borders, spacing, drawer layout, or visual hierarchy unless the user explicitly asks for UI.

## Correct task framing

Active question shape:

> Given the current homepage filter dimensions, can a newly added or modified infocard be counted by the filter system and filtered out correctly? What data/SOP changes are needed?

Investigate the full data path:

```text
docs/<slug>.html.meta.yaml
  -> scripts/build-site.js
  -> scripts/index-build-lib.js / buildIndexData()
  -> _index.yaml
  -> index.html injected #home-index-data
  -> assets/home/index.js normalizeCard()
  -> homepage facet counters and filtering
```

Core principle: homepage filters are driven by `.meta.yaml` metadata, especially `taxonomy`, not by the HTML body.

## Current filter dimensions to treat as baseline

Use the current homepage filter model and `_taxonomy.yaml` as the source of truth before proposing new dimensions:

- `domains`
- `tool_types`
- `stages`
- `interaction`
- `content_type`
- `source`
- `style`
- `risk`

Do not propose a UI redesign first. First decide whether the existing dimensions can support new/modified card SOP.

## Investigation checklist

1. Read `_taxonomy.yaml` for canonical dimensions, allowed values, aliases, and anti-patterns.
2. Read `assets/home/index.js` to confirm which fields `normalizeCard()` maps into `__facets`.
3. Read `scripts/build-site.js`, `scripts/index-build-lib.js`, and `scripts/verify-index.js` to determine whether taxonomy is merely passed through or validated.
4. Inspect `scripts/migrate-taxonomy.js` and `scripts/audit-taxonomy.js`; they may already contain useful inference/audit logic but should not be assumed to be a publish gate.
5. Quantify coverage across `docs/**/*.meta.yaml`:
   - cards with no `taxonomy`
   - cards with partial/empty dimensions
   - per-dimension coverage
   - value fragmentation such as `graph-paper`, `graph-paper-style`, `infocard-darkblue-style`
6. Separate **schema problem** from **SOP problem**:
   - schema: current dimensions and canonical value lists
   - SOP: how new/modified cards must fill taxonomy
   - gate: whether build/verify blocks or warns on bad taxonomy

## Key implementation direction

Recommended target when user chooses data-governance path:

- Keep current homepage dimensions as baseline unless evidence shows a missing concept.
- Add or refactor a taxonomy validator rather than relying only on human discipline.
- Reuse inference rules from `migrate-taxonomy.js`, but split them into safer commands:
  - audit only
  - infer for selected files
  - strict validate new/modified cards
  - optional historical backfill
- Do not let a global historical cleanup block normal publishing unless the user explicitly chooses that. Preferred default is:
  - new/modified cards: strong validation
  - historical cards: audit + targeted/high-value backfill

## New/modified card SOP additions

When creating or refreshing a card, the SOP should require taxonomy work before build/push:

1. Write/update HTML and `.meta.yaml`.
2. Ensure `.meta.yaml` has `taxonomy` with all 8 current dimensions present.
3. Required non-empty for new/modified cards by default:
   - `domains`
   - `tool_types` when the card is a tool/repo/workflow
   - `content_type`
   - `source`
   - `style`
   - `risk`
4. `stages` and `interaction` may be empty only when genuinely not applicable, but the arrays should still be present.
5. Values must be canonical values from `_taxonomy.yaml`; aliases should be normalized before commit.
6. `source` should be inferred from `source_url` / `source` if missing.
7. `style` should be inferred from top-level `style` if missing.
8. `tags` remain search keywords only; do not use ordinary `tags` as the primary filter model.
9. Run taxonomy validation before `npm run build && npm run verify`.
10. After build, verify the generated `_index.yaml` includes the taxonomy and that homepage facet counters can see the new values.

## Grill-me alignment pattern

If the user asks to align first, use `grill-me` before writing the plan. Ask at most 3 rounds and focus on governance choices, not visuals:

1. Scope: validate only new/modified cards vs include historical backfill.
2. Historical policy: targeted backfill vs all-history blocking cleanup.
3. Gate strength: manual SOP vs warning audit vs strict validation + inference.

Do not ask about visual filter appearance unless the user redirects to UI.
