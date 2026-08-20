# Wood-style rewrite preservation note

Session lesson:
- When the user asks to "rewrite/re-generate" an existing info card in wood style, treat it as a **restyling + content extension** task, not a content redesign.
- Preserve the original card's functional behavior: copy buttons, save/export button, JS handlers, anchor structure, and any existing interaction affordances.
- Preserve the original topic framing unless the user explicitly asks to rename/re-scope it.
- Update `updated` to the current Asia/Shanghai time.
- After editing, run build/verify and check `git status` for unrelated generated drift.
- If the build touches unrelated files, revert those files before reporting success.

Practical cue:
- Keep the content model stable, then layer wood tokens/typography/layout over it.
- Prefer adding a new section or extending an existing section rather than deleting or rethinking the card.
