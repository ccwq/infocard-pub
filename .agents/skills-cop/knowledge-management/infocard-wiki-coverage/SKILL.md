---
name: infocard-wiki-coverage
description: Use for infocard-pub LLM Wiki coverage audits and backfills.
category: knowledge-management
version: 1.0.0
---

# Infocard Wiki Coverage

## Purpose

Maintain the infocard-pub → LLM Wiki raw-source boundary. The target is 100% coverage of the current canonical infocard set without silently rewriting historical Wiki material.

## Canonical coverage rule

1. Recursively scan `infocard-pub/docs/**/*.meta.yaml`; directory cards such as `index.html.meta.yaml` are included.
2. Read the sidecar `slug` as the repository identity.
3. Normalize only date prefixes:
   - `YYYYMMDD-slug` → `slug`
   - `YYYY-MM-DD-slug` → `slug`
4. Scan `wiki/raw/articles/*.md` recursively.
5. Prefer raw frontmatter `infocard_slug`; otherwise derive the slug from `YYYY-MM-DD-infocard-<slug>.md`.
6. Coverage is `repo_canonical ∩ wiki_canonical / repo_canonical`.
7. Title, public URL, and source URL matching are diagnostics only; they cannot override canonical slug coverage.

Run:

```bash
npm run audit:wiki-coverage -- --json
```

The report must separate:

- canonical raw coverage;
- legacy URL/source diagnostics;
- `sources/` synchronization;
- compiled `concepts/` and `entities/` state.

A legacy URL warning does not reduce canonical coverage.

## Backfill rule

When canonical coverage is below 100%:

1. Run a dry-run inventory first.
2. Generate only missing raw articles from sidecar metadata and HTML text.
3. Never overwrite an existing raw file by default.
4. Preserve historical duplicate raw files, old dates, and old slugs.
5. Do not append a machine-generated full-card list to `index.md`.
6. Update `index.md` only with human-curated knowledge entries; append the operation to `log.md`.
7. Re-run the canonical audit and inspect the diff before commit.

## Wiki layers are separate

- `raw/articles/`: immutable source capture;
- `sources/`: compiler input synchronized from raw;
- `concepts/` / `entities/`: compiled or curated knowledge pages.

Raw coverage does not prove compiler completion. `rsync` success is `SYNCED_ONLY`, not `COMPILED`.

## Historical duplicate governance (P2)

Historical raw duplicates are not a P0 coverage failure. Do not delete, merge, rename, or overwrite them during backfill. A later cleanup must:

1. group candidates by canonical slug, source URL, and content hash;
2. choose a primary only after checking dates and content provenance;
3. preserve superseded files or add an explicit redirect/alias record;
4. update affected knowledge-page provenance and links;
5. run a full diff and obtain explicit approval before deletion or merge;
6. verify raw/source/concept/entity/index/log consistency afterward.

## Knowledge-page mapping boundary (P2)

A raw article does not automatically require a new entity page. Create or update a knowledge page when the topic is central, recurring, or already represented in the Wiki. Otherwise record that no separate page was required. Never claim `entities/` or `concepts/` coverage from raw-file counts alone.

## Compile verification boundary (P2)

For compile runs, report:

- actual source count before and after sync;
- number extracted in the current run;
- whether the run ended with `Compile finished` or `Runtime limit`;
- non-zero compiled output counts;
- unresolved source-to-page mapping when the compiler lacks machine-readable provenance.

A time-limited process exiting 0 is not full compile success.

## Closeout

Do not report Wiki complete until the requested scope has verified the relevant raw article, any required knowledge page or explicit no-page decision, `index.md`, `log.md`, remote commit, and remote file presence. Keep target deliverable status separate from unrelated dirty worktree residue.
