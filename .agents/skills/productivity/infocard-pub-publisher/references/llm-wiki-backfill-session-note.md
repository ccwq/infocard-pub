# LLM Wiki Backfill Session Note

Session-derived note from 2026-06-15: backfilling infocard-pub into the wiki.

## Wiki path resolution (2026-06-28)

**Do NOT search for `llmwiki` as a directory name** — the user may type "llmwiki" (shorthand) but the actual paths are:
- **LLM Wiki**: `~/hehome/hermes-data/home/wiki` (canonical path; `WIKI_PATH` in `~/.hermes/.env`)
- **infocard-pub collaborator wiki**: `docs/20260529-llm-wiki-hermes/` (within infocard-pub repo)

Naming mismatch causes wasted filesystem exploration. Correct resolution sequence:
1. Check `WIKI_PATH` env var first
2. If user asks "llmwiki 可用吗", check `~/hehome/hermes-data/home/wiki/` directly
3. Subdirectories: `concepts/`, `entities/`, `queries/`, `comparisons/`, `raw/`, `index.md`, `log.md`

## Practical pattern
- Choose the wiki page type by the card's reusable knowledge:
  - `concepts/` for workflow, methodology, tool-selection, or architecture cards
  - `queries/` for one-off investigation syntheses
  - `entities/` for people/orgs/products
  - `comparisons/` for side-by-side evaluations
- Write a `raw/articles/*.md` record first, then add the curated knowledge page.
- Include both URLs in the knowledge page: the public infocard URL and the source URL.
- Keep the knowledge page concise and reusable; do not mirror the HTML structure.
- Ensure at least 2 `[[wikilinks]]` in the knowledge page body.

## Hash verification pitfall
- For raw records with `sha256:` frontmatter, hash the **exact body after the closing `---`**.
- After writing the file, re-read the file and verify the stored hash matches the written body.
- If the body changed during generation/formatting, patch the `sha256` frontmatter to the actual written body hash.

## Navigation sync
- Update `index.md` and `log.md` in the same backfill pass.
- If adding multiple cards, prefer a single log entry that names the batch and lists all created/updated files.
- Re-check the index `Total pages:` count after the batch lands.
