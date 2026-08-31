# Reader-facing narrative and duplicate-card consolidation

Use when a card is being republished as a cleaner, audience-facing final version after multiple drafts or duplicate variants exist in the repo.

## What changed in this session

- The user rejected explicit merge/version provenance in the title and body.
- The final card should read like a finished product page, not a changelog or editorial note.
- Remove wording such as:
  - "合并"
  - "三版"
  - "旧卡"
  - "版本来源"
  - task-history dates when they are only there to explain the production process

## Practical rules

1. Prefer a reader-facing title.
   - Title should name the product/topic, not the editing history.
   - Avoid subtitles that describe how many drafts were combined.

2. Keep the body product-oriented.
   - Lead with what the reader needs to know.
   - Preserve capabilities, workflow, benchmark, and usage paths.
   - Remove editorial provenance from hero copy, footer, and side notes.

3. Keep metadata neutral.
   - `title`, `desc`, and `note` should describe the published card itself.
   - Do not leave merge notes in `note` or `desc`.

4. Replace duplicates decisively.
   - If a newer card is meant to replace older copies, delete the superseded HTML/meta pairs and rebuild.
   - Do not rely on archive-style flags to hide superseded cards from the homepage index.

## Verification

- Search the final HTML/meta for editorial provenance terms before build.
- Confirm the public page title, description, footer, and visible text all read as a standalone publication.
- If the repo still contains superseded versions under `docs/`, verify whether they will still be indexed before assuming they are hidden.
