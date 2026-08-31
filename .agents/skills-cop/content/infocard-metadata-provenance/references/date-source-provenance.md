# Date source provenance for infocard sidecars

## What this captures

This note records the separation between:
- **sidecar generation**: where `docs/**/*.meta.yaml` is written
- **index rebuilding**: where `_index.yaml` is rebuilt from existing sidecars

## Session-derived finding

The `date` field in `docs/**/*.meta.yaml` is **not** written by `scripts/rebuild_index.py`.

That script:
- scans `docs/**/*.meta.yaml`
- validates required fields
- normalizes `date` for the index view
- writes `_index.yaml`
- derives `_sort_ts` and `_modified_date`

It does **not** generate or backfill the sidecar’s `date` field.

## Practical rule

If `date` is wrong in the sidecar, fix the upstream card-generation workflow:
- `any2card`
- `info-card-generator`
- other HTML/sidecar generation path

If `_index.yaml` shows a different formatted value, check the index normalization logic, not the sidecar write path.

## Nested-path reminder

For nested cards, the sidecar must live next to the actual HTML basename:
- `docs/<slug>/index.html`
- `docs/<slug>/index.html.meta.yaml`

A root-level `.meta.yaml` beside a nested `index.html` will be ignored by the index scanner.
