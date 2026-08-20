# Date correction without URL rename

## When this matters
An already published infocard has the wrong date, but the URL/slug is already public and the user did **not** ask to change the address.

## Rule
- Keep the existing `slug` and `path` unless the user explicitly requests a URL change.
- Update the `.meta.yaml` `date` and `updated` fields to the corrected publish time.
- Update any visible date text inside the HTML footer/body so the page, metadata, and homepage list stay aligned.
- Rebuild, verify, commit, and push the change together.

## Why
Renaming the slug/path to chase a date prefix creates unnecessary URL churn and can break external links. The correct fix is metadata + visible date synchronization, not relinking the page.

## Minimal checklist
1. Edit `.meta.yaml` date/updated.
2. Edit visible in-card date text if present.
3. `npm run build`
4. `npm run verify`
5. Commit generated `_index.yaml` / `index.html` with the card files.
6. Verify the live page and homepage list after Pages propagation.
