# any2card single-source path for infocard regeneration

## Session lesson
When an infocard visual task is inside the `infocard-pub` publishing lane, do **not** maintain a separate infocard-only generation path.

## Rule
- Treat `any2card` as the single source of truth for visual generation.
- `infocard-pub-publisher` should delegate to `any2card` first, then handle packaging, metadata, rebuild, push, and public verification.
- If an output still looks like `.wrap / .banner / .section / .footer` with a bottom footer save button, treat it as a legacy-template regression.

## Verification pattern
- Rebuild `_index.yaml` from sidecars after any publish or republish.
- Verify the public Pages URL returns 200.
- Verify the rendered public page in a browser, not only via curl.
- On mobile, check for readable text, no horizontal overflow, no clipping, and a visible export/save action.

## Why this matters
The user explicitly asked to avoid split visual systems. Future infocard work should preserve a single visual source of truth and avoid parallel legacy generation chains.
