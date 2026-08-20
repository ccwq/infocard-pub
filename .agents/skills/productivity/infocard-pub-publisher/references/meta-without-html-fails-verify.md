# Meta-without-HTML publish failure (2026-06-11)

## Symptom
`npm run verify` / `node scripts/verify-index.js` aborts with:

```text
Error: Index build failed:
- docs/<slug>.html.meta.yaml: target path missing -> docs/<slug>.html
```

## Root cause
A sidecar `.meta.yaml` exists in `docs/`, but the referenced HTML file is missing from the repo tree. This can happen when:
- only the metadata was committed,
- a draft HTML file was never added,
- a rename/move left a stale sidecar behind,
- or a partial rebase/publish restored the metadata but not the page.

## Recovery
1. Confirm the missing path from the error message.
2. Check whether the HTML exists in a prior commit, stash, or branch tip.
3. Either:
   - restore the missing HTML into `docs/`, or
   - delete the stale `.meta.yaml` if the card should not ship.
4. Re-run `npm run build` and `npm run verify` before pushing.

## Preventive rule
For every published card, keep the pair in sync:
- `docs/<slug>.html`
- `docs/<slug>.html.meta.yaml`

A lone sidecar is not a valid publishable artifact.
