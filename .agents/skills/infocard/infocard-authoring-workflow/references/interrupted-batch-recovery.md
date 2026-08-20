# Interrupted batch recovery and visual-gate disagreement

Use when a previous infocard batch was interrupted, session context is lost, or artifacts remain on disk without a public release.

## Recovery inventory

Classify candidates before editing:

| Evidence | Meaning |
|---|---|
| Runtime bundle only | planned or partially initialized run |
| HTML + sidecar in author worktree | authored artifact; not necessarily integrated or published |
| Named branch with content commit | committed candidate; still not public |
| Integration worktree with staged cards | pending batch integration |
| Remote branch/commit | remotely available candidate; still verify Pages |
| Public HTML + index identity | published candidate; audit may still be pending |

A local commit or HTTP 200 alone is never sufficient to call a card published. Check the declared path, remote content, public index, and identity text.

## Safe takeover

1. Preserve the primary repository's dirty state as ambient residue. Do not reset or stage unrelated files.
2. Check free disk before adding a worktree.
3. Fetch `origin/main` and create one fresh publisher-owned integration worktree from it.
4. Copy only each bundle's declared HTML/sidecar/asset allowlist. Do not cherry-pick child generated indexes.
5. If a bundle is stale or incompatible, keep the original and create a recovery bundle with canonical fields: lowercase kebab `slug`, dated `html_path`, matching `meta_path`, `asset_dir`, `manifest_path`, valid `source_url`, allowed `style`, `keywords`, relative Wiki paths, and absolute `repository.root`.
6. Build and regenerate `_index.yaml`/`index.html` once for the batch.
7. Run local gates per card and distinguish baseline warnings from target errors.

## Visual gate

For cards with tables, multi-column regions, code blocks, or fixed controls:

- capture desktop and 390px mobile screenshots;
- run visual analysis with explicit `critical / major / minor` output;
- run mechanical DOM checks separately: page `scrollWidth <= clientWidth`, table wrapper `scrollWidth > clientWidth` when horizontal scrolling is intentional, and card bounds inside the viewport;
- treat DOM checks as necessary but not sufficient;
- add a visible mobile affordance for dense tables, such as a short “横向滑动查看完整对比” cue, gradient edge hint, or partial next-column reveal;
- verify multi-column cards have visible right-side padding and borders;
- re-screenshot after every repair.

If screenshot analysis still reports clipping or inaccessible content while DOM checks pass, record the disagreement as `VISUAL_PENDING` and block push. Do not convert static, HTTP, or DOM evidence into visual pass.

## User-facing completion language

When the user says “继续 / go / 直到完成”, continue until a terminal state. If blocked by a hard gate, state the exact evidence and preserve recovery paths. Never report “全部完成” while a visual, Pages, audit, or Wiki gate remains open.
