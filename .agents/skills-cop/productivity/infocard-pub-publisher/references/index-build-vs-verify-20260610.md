# Index build vs verify: 2026-06-10 session note

## Symptom
A new card was written successfully, but local verification initially failed because the index generation path and the verification path were not using the same source of truth.

## What happened
- `scripts/rebuild_index.py` regenerated `_index.yaml` from meta files.
- That script originally emitted an extra `_updated` field.
- `scripts/verify-index.js` expected the committed/generated index shape without that field.
- A later `npm run build` path went through `scripts/build-site.js`, which also handled `fix-meta-date` and injected `index.html` consistently.

## Fix pattern
1. Treat `npm run build` as the authoritative rebuild entrypoint.
2. Follow with `npm run verify` / `node scripts/verify-index.js`.
3. If the Python rebuild script and verify script disagree, patch the rebuild script to match the build-site output shape rather than patching verify to accept drift.
4. Always verify both artifacts:
   - `_index.yaml`
   - `index.html`

## Pages propagation note
A 200 on the detail URL is not enough if the homepage index is stale. Verify:
- detail page returns 200
- homepage search or embedded index data contains the new slug/title
- worktree is clean after the final commit

## Takeaway
For `infocard-pub`, the publish chain must be build-site → verify → commit generated artifacts → push → wait for Pages propagation → verify the live homepage index.
