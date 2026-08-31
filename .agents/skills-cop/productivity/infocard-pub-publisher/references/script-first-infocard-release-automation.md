# Script-first infocard release automation

Session-derived rules for `infocard-pub` publishing tasks.

## What became deterministic enough to script

### Meta shape normalization
Use a dedicated prebuild step to normalize mechanical metadata before strict index validation:
- quote bare wall-clock `date` / `updated`
- rename `description` → `desc` when `desc` is absent
- fix obvious `path` variants when the sibling HTML exists
- keep `slug` mismatch as report-only unless the caller explicitly requests a rewrite

### Safe boundaries
- Do **not** auto-fill or rewrite semantic fields like title, tags, or source URLs.
- Do **not** make slug/path inference broader than the sidecar’s own HTML sibling.
- Prefer warnings over writes when the repo contains legacy sidecars that do not map cleanly to a current HTML sibling.

## Verification ladder that worked

1. `node --check` for every new script
2. `npm run build && npm run verify`
3. `post-publish-verify.js <slug>` for the three public gates:
   - detail page HTTP 200
   - live `_index.yaml` contains the slug
   - homepage HTML/search contains the slug or title
4. `verify-card-images.js <slug>` for rendered `<img>` / `<source>` assets only
5. `verify-mobile-card.js <slug>` for static mobile checks; keep browser smoke as an explicit optional flag rather than a hard dependency

## Image verification scope

Only rendered image elements belong in the image gate:
- `<img src>`
- `<source src>`
- `<source srcset>`

Do **not** treat CSS `url(...)` values as image failures in the image gate; those often point to fonts or decorative assets and need a separate asset audit if required.

## Wiki coverage audit

A useful read-only audit compares `docs/**/*.meta.yaml` to wiki raw articles by URL/source URL and de-duplicates duplicate URLs per raw file. This is best kept as a diagnostic script, not an auto-write path.

## Theme registration scaffold

A theme registration helper is worth keeping as a scaffold:
- generate a draft `_themes.yaml` entry
- refuse duplicate slug/title
- allow missing preview only when explicitly requested for a draft
- leave semantic descriptions/note/keywords for human review
