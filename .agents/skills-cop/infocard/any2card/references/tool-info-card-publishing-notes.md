# Tool-info-card publishing notes

Session-specific notes for building and publishing cards about real Hermes tools.

## What users expect
- They want a card that is **usable**, not just attractive.
- They expect a tool card to answer: **what it is, when to use it, how to start, how to verify it, and when not to use it**.
- For memory-related tools, the card should clearly separate:
  - built-in memory (`MEMORY.md` / `USER.md`)
  - external provider tools (`fact_store` in this session)
  - historical search (`session_search`)

## Minimum content blocks for tool cards
1. **What it is / where it lives**
2. **Common workflows** (start-to-finish usage)
3. **Capability map** (one line per action/tool with concrete meaning)
4. **Usage tips** (entities, trust, boundaries, naming)
5. **When not to use it**
6. **Verification / troubleshooting**
7. **Short examples** (copyable prompt or command snippets)

## Quality bar for fact_store-type cards
- Do not describe actions only in abstract terms.
- Each action should have a practical “use this when…” explanation.
- Always include the operational boundary with `memory` and `session_search`.
- Always include a quick success check such as `hermes memory status` or a minimal add/search workflow.
- Prefer plain, concrete language over “smart/strong/powerful” marketing wording.

## Publishing workflow
1. Draft the card content with practical sections above.
2. Review for omissions and over-generic wording.
3. Publish the HTML to the infocard-pub repo.
4. Add/update the `_index.yaml` entry.
5. Verify raw URL first, then Pages.

## Common pitfalls
- A tool card that reads like a feature brochure is not enough.
- If the card doesn’t tell the user how to start, it is incomplete.
- If the card doesn’t say when *not* to use the tool, it will be misused.
- If the capability map lacks inputs/outputs or usage conditions, it is too vague.
- If the card claims a tool is a full replacement for memory/session search, it is misleading.

## Support files
- `references/fact_store-card-outline.md` — structured content outline for the fact_store card.
- `references/fact_store-card-notes.md` — review notes and high-risk omissions found during this session.
