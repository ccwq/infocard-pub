# Infocard → Wiki Synchronization Contract

Session-derived policy for connecting `infocard-pub` releases to the user's LLM Wiki.

## Agreed defaults

- Historical backfill scope: **high-value cards only** — investigations, technical deep dives, methods/workflows, people/org profiles. Do not bulk-ingest pure visual/showcase cards by default.
- Per-card ingest depth: **raw summary + one wiki knowledge page**.
  - `raw/articles/<slug>.md` stores the card/source summary, card URL, source URL, key facts, and extracted conclusions.
  - A knowledge page stores reusable synthesis under `entities/`, `concepts/`, or `queries/`.
  - Only unusually large investigations should fan out into multiple entity/concept pages.
- New-card timing: write to wiki **after public publish verification passes**, so the wiki captures the final verified version, not a draft or failed release.
- Sync is a **release hard gate** for high-value cards: if wiki write fails, do not report the overall task as fully complete; report the card as published but wiki sync blocked.
- Historical rollout: first ingest a **10-card sample set**, inspect format/classification, then batch the rest.

## Update/delete synchronization

- Use a dual-track model:
  - `raw/` keeps version evidence. For material card revisions, create a new raw snapshot or append an immutable revision note rather than silently overwriting provenance.
  - The wiki knowledge page keeps the latest readable synthesis.
- When an infocard is modified:
  1. Re-verify the public card.
  2. Update the existing wiki page, bump `updated`, and add a short change note.
  3. Add/update raw provenance for the revised final version.
  4. Update `index.md` only if title/category/summary changed.
  5. Append `log.md`.
- When an infocard is deleted or unpublished:
  1. Do not physically delete wiki knowledge by default.
  2. Mark the wiki page archived/superseded or move it under `_archive/` according to wiki schema.
  3. Preserve raw sources.
  4. Replace broken public-card links with an archive note.
  5. Append `log.md`.

## Classification rule

Auto-classify by content:

- People / organizations / products as durable subjects → `entities/`
- Methods, workflows, reusable concepts → `concepts/`
- One-off investigations, reports, curated lists, source-specific findings → `queries/`

Prefer auto-classification with human correction over asking for every card.

## Release-loop insertion point

For future high-value card releases, the end-to-end loop is:

1. Create/update HTML + `.meta.yaml`.
2. Build and verify `infocard-pub`.
3. Commit and push.
4. Verify public URL, index entry, assets, and mobile rendering when relevant.
5. Write wiki raw summary + knowledge page.
6. Update wiki `index.md` and `log.md`.
7. Report completion with both card URL and wiki file paths.

## Minimum wiki output for a high-value card

- `raw/articles/<slug>.md`
- One of:
  - `entities/<entity>.md`
  - `concepts/<concept>.md`
  - `queries/<topic>.md`
- Updated `index.md`
- Updated `log.md`

## Non-goal

Do not mirror full infocard HTML/CSS into the wiki unless the card itself is about visual design implementation. The wiki stores structured knowledge, not static-site render code.