# 2026-06-03 Infocard new-spec notes

Session learnings for rebuild-style info cards:

## Rebuild means rebuild
- When the user says “重建 / rebuild / build skill”, treat it as a full structural + CSS rewrite, not an expansion pass.
- Do not preserve old bugs by only adding content.

## Global typography pass
- If the user says the “minimum text is too small”, treat it as a global typography change.
- Raise the whole card's minimum readable size together: meta, labels, captions, code, table text, section headers, file lists, route lists, and footer.
- A practical target used in this session was an approximately 1.4× uplift for the smallest readable text.

## Structure chapters
- Avoid mixing `filename + explanation` inline in one narrow row on mobile.
- Prefer `file-grid` cards for file lists.
- Prefer `route-list` rows with name/description split for route directories.
- For dense summary sections, use stacked summary cards instead of a single compressed list.

## Mobile-safe controls
- Sticky / floating save buttons that overlap正文 are a failure.
- If overlap risk exists, demote the button to normal flow at the bottom before calling the page PASS.

## New breakpoints
- Add an explicit `@media (max-width: 720px)` block for narrow-phone cleanup.
- Use it to stack tables, reduce padding, and collapse multi-column gallery or grid areas.

## Verification pattern
- Run a visible-text check to confirm the card did not accidentally shrink.
- Run the mobile verifier after editing and before publishing.
- If the repo has a stale meta reference that blocks index generation, remove or fix the stale meta before republishing.
