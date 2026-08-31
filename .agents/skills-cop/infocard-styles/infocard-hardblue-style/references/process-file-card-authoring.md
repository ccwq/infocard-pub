# Process-file-driven infocard drafting

- Source pattern: `/tmp/infocard-process-<slug>.md` (or similar process notes) is the canonical starting point when the user asks for an agent2-style writeup.
- Read the process file first, then extract: repository/project name, key facts, recommended title/slug, and any "style suggestion" section.
- Write outputs directly into `docs/` as:
  - `docs/<slug>.html`
  - `docs/<slug>.html.meta.yaml`
- Prefer a title that keeps the project acronym + audience + use case in one line.
- Use the process file’s recommended slug unless it conflicts with existing repository naming conventions.
- Keep the card’s angle aligned to the process file’s explicit positioning (e.g. tool/workflow vs research overview); do not invent a new narrative theme.
- If the process file contains a "禁止混淆对象" or equivalent boundary list, surface those distinctions in the HTML body so readers can tell related tools apart.
- A concise wiki/raw note can be generated alongside the card when the task is part of a larger research-to-publish flow.
