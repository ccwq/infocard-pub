# Directory-style infocard republish + rebase recovery

This note captures the durable workflow used when publishing investigation-style cards to `infocard-pub`.

## Canonical layout
For investigation deliverables, keep the report and card sidecar together under a dated directory:

- `docs/{YYYYMMDD}-{slug}/report.md`
- `docs/{YYYYMMDD}-{slug}/index.html`
- `docs/{YYYYMMDD}-{slug}/index.html.meta.yaml`

This keeps the narrative report, visual card, and index metadata in one place.

## Recovery rule for `_index.yaml`
When a push is blocked by concurrent publishes and the rebase conflicts in `_index.yaml`:

1. Do **not** hand-edit conflict markers in `_index.yaml`.
2. Regenerate `_index.yaml` from all sidecars using `scripts/rebuild_index.py`.
3. Re-stage `_index.yaml` and continue the rebase.
4. Verify the rebuilt index with `scripts/verify_index.py`.

## Verification sequence
- Confirm the detail page returns 200 on Pages.
- Confirm the public `/_index.yaml` contains the slug.
- Confirm the homepage renders the new entry if the repo uses a client-rendered list.

## Why this matters
Generated index files are derived artifacts. Rebuilding them is safer than trying to merge conflict hunks by hand, especially when other publishes land while the current card is in flight.
