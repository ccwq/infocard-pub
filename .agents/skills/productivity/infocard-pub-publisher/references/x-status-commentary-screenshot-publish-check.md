# X status commentary + screenshot publish check

## Scope
This note covers a recurring release pattern for X status cards that need:
- the post's claim extracted from text/DOM
- public engagement counts
- a screenshot as evidence
- a section describing whether replies are visible or login-gated

## Required release bundle
- `report.md`
- `index.html`
- `index.html.meta.yaml`
- a local screenshot asset under `docs/assets/images/...`

## Publish rules
1. Treat the screenshot as evidence, not as the sole source of truth.
2. If the reply thread is gated behind login, do not present hidden replies as if they were extracted.
3. Use language such as “commentary state”, “reply entry visible”, or “login gate present”.
4. Verify the screenshot section and the save PNG button on the public page after deploy.
5. Ensure `_index.yaml` contains the new card and the public Pages URL returns 200.

## Common pitfall
A screenshot may clearly show the post body and engagement counts while hiding the author or replies behind a login prompt. That is still a valid evidence image, but the card must describe its limits explicitly.
