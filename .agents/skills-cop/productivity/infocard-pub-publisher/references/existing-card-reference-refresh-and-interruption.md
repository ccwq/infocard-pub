# Existing-card refresh with reference images + interruption re-anchor

Use this when a user switches from an active/new card task to updating a specific existing infocard URL and provides reference text or images.

## Trigger

- User gives an existing `https://ccwq.github.io/infocard-pub/docs/<slug>.html` URL and asks to update / refine / republish it.
- The session already has an active card publish TODO for another URL or repo.
- User-provided images are described as information to include, not merely visual style references.

## Workflow

1. **Re-anchor immediately to the latest user message.**
   - Cancel or mark the previous card task as superseded before any further write/push.
   - Lock the exact target path from the public URL: `docs/<slug>.html` and `docs/<slug>.html.meta.yaml`.
   - Do not continue collecting/publishing the prior repo even if its TODO list was preserved across compaction.

2. **Treat reference images as content evidence when the user says to include them.**
   - OCR / visually extract the list titles, item names, descriptions, and grouping facts.
   - Integrate those facts into the card body as a section, board, appendix, or evidence block.
   - Do not label them as only "style reference" unless the user explicitly says they are just style references.

3. **Existing card metadata rules.**
   - Preserve the existing `slug`, `path`, `date`, and public URL unless the user explicitly asks to rename.
   - Update `updated` to the current Asia/Shanghai publish timestamp.
   - Keep or add `style:` if the card theme is known; rebuild index afterward.

4. **Publish and verify like a normal release.**
   - `npm run build && npm run verify`.
   - Commit HTML + meta + `_index.yaml` + `index.html` together.
   - Push and wait for Pages propagation.
   - Verify detail page, `_index.yaml`, homepage, and 390px CDP/mobile checks.

5. **Wiki sync for modifications.**
   - Add a new raw version file dated by the update day, e.g. `raw/articles/YYYY-MM-DD-infocard-<slug>.md`.
   - Create or update the concept page to reflect the latest card content.
   - Update `index.md` and `log.md` and commit/push the wiki repo.

## Pitfalls

- A preserved TODO list is not an instruction to keep going when the latest user message changed target.
- For existing pages, do not create a new slug just because the update date changed.
- Public `HTTP 200` can initially serve stale old HTML; loop until the new title/keywords appear in detail page, `_index.yaml`, and homepage.
- GitHub HTTPS push may appear to fail repeatedly; the useful durable pattern is to retry with HTTP/1.1 and, if needed, one verbose push to expose auth/transport progress rather than treating local commit as published.