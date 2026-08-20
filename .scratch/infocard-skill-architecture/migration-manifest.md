# Infocard skill architecture migration manifest

Status: implemented and verified (no commit/push performed).

## Scope and architecture

- Project source of truth: `.agents/skills/` in `infocard-pub`.
- Global entry point: `/home/ccwq/hehome/hermes-data/skills/infocard-router/SKILL.md`.
- Global router contains routing/failure/authorization logic only; project procedures and theme tokens remain local.
- Existing project discovery configuration was verified and not changed.

## Deterministic inventory summary

- Enumerated canonical global candidates: 52 unique names across 54 source directories.
- Existing project-local skills retained: 10.
- Final project-local skills: 63 unique canonical names (10 retained + 52 migrated names + existing `infocard-authoring-workflow` overlap accounted for by source inventory absence).
- Duplicate canonical sources merged: `infocard-metadata-provenance`, `infocard-q-style`.
- Verified moved global source directories removed: 54.
- Remaining global infocard canonical skill: `infocard-router` only.

## Classification table

| Canonical name | Global source(s) | Project destination | Classification | Support files | Global deletion | Router target | Verification |
|---|---|---|---|---|---|---|---|
| `any2card` | `/home/ccwq/hehome/hermes-data/skills/any2card` | `.agents/skills/infocard/any2card` | `move` | 123 retained | removed | create support | PASS |
| `authorized-infocard-execution` | `/home/ccwq/hehome/hermes-data/skills/publishing/authorized-infocard-execution` | `.agents/skills/publishing/authorized-infocard-execution` | `move` | 1 retained | removed | composed project support | PASS |
| `delegated-infocard-publishing` | `/home/ccwq/hehome/hermes-data/skills/productivity/delegated-infocard-publishing` | `.agents/skills/productivity/delegated-infocard-publishing` | `move` | 1 retained | removed | composed project support | PASS |
| `infocard-archival-theme-refinement` | `/home/ccwq/hehome/hermes-data/skills/design/infocard-archival-theme-refinement` | `.agents/skills/design/infocard-archival-theme-refinement` | `move` | 3 retained | removed | composed project support | PASS |
| `infocard-bigwhite-style` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-bigwhite-style` | `.agents/skills/content/infocard-bigwhite-style` | `move` | 2 retained | removed | composed project support | PASS |
| `infocard-black-head-style` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-black-head-style` | `.agents/skills/content/infocard-black-head-style` | `move` | 2 retained | removed | composed project support | PASS |
| `infocard-blue-technical-manual-style` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-blue-technical-manual-style` | `.agents/skills/content/infocard-blue-technical-manual-style` | `move` | 6 retained | removed | composed project support | PASS |
| `infocard-color-material-style` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-color-material-style` | `.agents/skills/content/infocard-color-material-style` | `move` | 4 retained | removed | composed project support | PASS |
| `infocard-crayon-r5-guard` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-crayon-r5-guard` | `.agents/skills/content/infocard-crayon-r5-guard` | `move` | 2 retained | removed | composed project support | PASS |
| `infocard-crayon-style` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-crayon-style` | `.agents/skills/content/infocard-crayon-style` | `move` | 3 retained | removed | composed project support | PASS |
| `infocard-creation-preview-standards` | `/home/ccwq/hehome/hermes-data/skills/productivity/infocard-creation-preview-standards` | `.agents/skills/productivity/infocard-creation-preview-standards` | `move` | 3 retained | removed | direct project target | PASS |
| `infocard-darkblue-style` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-darkblue-style` | `.agents/skills/content/infocard-darkblue-style` | `move` | 9 retained | removed | composed project support | PASS |
| `infocard-darkgreen-style` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-darkgreen-style` | `.agents/skills/content/infocard-darkgreen-style` | `move` | 1 retained | removed | composed project support | PASS |
| `infocard-direct-publish` | `/home/ccwq/hehome/hermes-data/skills/productivity/infocard-direct-publish` | `.agents/skills/productivity/infocard-direct-publish` | `move` | 7 retained | removed | composed project support | PASS |
| `infocard-graph-paper-style` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-graph-paper-style` | `.agents/skills/content/infocard-graph-paper-style` | `move` | 3 retained | removed | composed project support | PASS |
| `infocard-green-style` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-green-style` | `.agents/skills/content/infocard-green-style` | `move` | 0 retained | removed | composed project support | PASS |
| `infocard-handline-style` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-handline-style` | `.agents/skills/content/infocard-handline-style` | `move` | 14 retained | removed | composed project support | PASS |
| `infocard-hardblue-style` | `/home/ccwq/hehome/hermes-data/skills/infocard-styles/infocard-hardblue-style` | `.agents/skills/infocard-styles/infocard-hardblue-style` | `move` | 6 retained | removed | composed project support | PASS |
| `infocard-layout-debugging` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-layout-debugging` | `.agents/skills/content/infocard-layout-debugging` | `move` | 0 retained | removed | composed project support | PASS |
| `infocard-legibility-publishing` | `/home/ccwq/hehome/hermes-data/skills/productivity/infocard-legibility-publishing` | `.agents/skills/productivity/infocard-legibility-publishing` | `move` | 14 retained | removed | composed project support | PASS |
| `infocard-main-style` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-main-style` | `.agents/skills/content/infocard-main-style` | `move` | 4 retained | removed | composed project support | PASS |
| `infocard-metadata-provenance` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-metadata-provenance`<br>`/home/ccwq/hehome/hermes-data/skills/productivity/infocard-metadata-provenance` | `.agents/skills/content/infocard-metadata-provenance` | `merge` | 7 retained | removed | direct project target | PASS |
| `infocard-mobile-rendering-verification` | `/home/ccwq/hehome/hermes-data/skills/productivity/infocard-mobile-rendering-verification` | `.agents/skills/productivity/infocard-mobile-rendering-verification` | `move` | 8 retained | removed | direct project target | PASS |
| `infocard-paper-warm-style` | `/home/ccwq/hehome/hermes-data/skills/infocard-paper-warm-style` | `.agents/skills/infocard/infocard-paper-warm-style` | `move` | 0 retained | removed | composed project support | PASS |
| `infocard-pixelstack-style` | `/home/ccwq/hehome/hermes-data/skills/infocard-styles/infocard-pixelstack-style` | `.agents/skills/infocard-styles/infocard-pixelstack-style` | `move` | 5 retained | removed | composed project support | PASS |
| `infocard-preview-delivery` | `/home/ccwq/hehome/hermes-data/skills/productivity/infocard-preview-delivery` | `.agents/skills/productivity/infocard-preview-delivery` | `move` | 0 retained | removed | composed project support | PASS |
| `infocard-pub-hardening` | `/home/ccwq/hehome/hermes-data/skills/infocard-pub-hardening` | `.agents/skills/infocard/infocard-pub-hardening` | `move` | 0 retained | removed | composed project support | PASS |
| `infocard-publish-closeout` | `/home/ccwq/hehome/hermes-data/skills/productivity/infocard-publish-closeout` | `.agents/skills/productivity/infocard-publish-closeout` | `move` | 1 retained | removed | composed project support | PASS |
| `infocard-publish-parallel-batch-pattern` | `/home/ccwq/hehome/hermes-data/skills/productivity/infocard-publish-parallel-batch-pattern` | `.agents/skills/productivity/infocard-publish-parallel-batch-pattern` | `move` | 2 retained | removed | composed project support | PASS |
| `infocard-publish-sop` | `/home/ccwq/hehome/hermes-data/skills/productivity/infocard-publish-sop` | `.agents/skills/productivity/infocard-publish-sop` | `move` | 102 retained | removed | direct project target | PASS |
| `infocard-q-style` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-q-style`<br>`/home/ccwq/hehome/hermes-data/skills/infocard-q-style` | `.agents/skills/content/infocard-q-style` | `merge` | 7 retained | removed | composed project support | PASS |
| `infocard-rebuild-template-grill` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-rebuild-template-grill` | `.agents/skills/content/infocard-rebuild-template-grill` | `move` | 20 retained | removed | composed project support | PASS |
| `infocard-redswiss-style` | `/home/ccwq/hehome/hermes-data/skills/infocard-styles/infocard-redswiss-style` | `.agents/skills/infocard-styles/infocard-redswiss-style` | `move` | 4 retained | removed | composed project support | PASS |
| `infocard-responsive-layout` | `/home/ccwq/hehome/hermes-data/skills/productivity/infocard-responsive-layout` | `.agents/skills/productivity/infocard-responsive-layout` | `move` | 1 retained | removed | composed project support | PASS |
| `infocard-scrapbook-style` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-scrapbook-style` | `.agents/skills/content/infocard-scrapbook-style` | `move` | 0 retained | removed | composed project support | PASS |
| `infocard-source-routing-decision-tree` | `/home/ccwq/hehome/hermes-data/skills/infocard-source-routing-decision-tree` | `.agents/skills/infocard/infocard-source-routing-decision-tree` | `move` | 1 retained | removed | composed project support | PASS |
| `infocard-style-man-skill` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-style-man-skill` | `.agents/skills/content/infocard-style-man-skill` | `move` | 21 retained | removed | direct project target | PASS |
| `infocard-theme-redesign` | `/home/ccwq/hehome/hermes-data/skills/design/infocard-theme-redesign` | `.agents/skills/design/infocard-theme-redesign` | `move` | 2 retained | removed | direct project target | PASS |
| `infocard-theme-validation` | `/home/ccwq/hehome/hermes-data/skills/productivity/infocard-theme-validation` | `.agents/skills/productivity/infocard-theme-validation` | `move` | 1 retained | removed | composed project support | PASS |
| `infocard-three-stage-pipeline` | `/home/ccwq/hehome/hermes-data/skills/productivity/infocard-three-stage-pipeline` | `.agents/skills/productivity/infocard-three-stage-pipeline` | `move` | 3 retained | removed | composed project support | PASS |
| `infocard-tool-cli-pattern` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-tool-cli-pattern` | `.agents/skills/content/infocard-tool-cli-pattern` | `move` | 1 retained | removed | composed project support | PASS |
| `infocard-topic-selection` | `/home/ccwq/hehome/hermes-data/skills/productivity/infocard-topic-selection` | `.agents/skills/productivity/infocard-topic-selection` | `move` | 0 retained | removed | direct project target | PASS |
| `infocard-update-vs-new-pattern` | `/home/ccwq/hehome/hermes-data/skills/infocard-update-vs-new-pattern` | `.agents/skills/infocard/infocard-update-vs-new-pattern` | `move` | 0 retained | removed | direct project target | PASS |
| `infocard-visual-evidence-grounding` | `/home/ccwq/hehome/hermes-data/skills/infocard-styles/infocard-visual-evidence-grounding` | `.agents/skills/infocard-styles/infocard-visual-evidence-grounding` | `move` | 1 retained | removed | composed project support | PASS |
| `infocard-visual-pass-loop` | `/home/ccwq/hehome/hermes-data/skills/productivity/infocard-visual-pass-loop` | `.agents/skills/productivity/infocard-visual-pass-loop` | `move` | 3 retained | removed | composed project support | PASS |
| `infocard-white-purple-style` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-white-purple-style` | `.agents/skills/content/infocard-white-purple-style` | `move` | 0 retained | removed | composed project support | PASS |
| `infocard-wiki-coverage` | `/home/ccwq/hehome/hermes-data/skills/knowledge-management/infocard-wiki-coverage` | `.agents/skills/knowledge-management/infocard-wiki-coverage` | `move` | 0 retained | removed | direct project target | PASS |
| `infocard-wood-style` | `/home/ccwq/hehome/hermes-data/skills/content/infocard-wood-style` | `.agents/skills/content/infocard-wood-style` | `move` | 2 retained | removed | composed project support | PASS |
| `infocard-x-content-tracing` | `/home/ccwq/hehome/hermes-data/skills/productivity/infocard-x-content-tracing` | `.agents/skills/productivity/infocard-x-content-tracing` | `move` | 0 retained | removed | composed project support | PASS |
| `social-source-boundary` | `/home/ccwq/hehome/hermes-data/skills/content/social-source-boundary` | `.agents/skills/content/social-source-boundary` | `move` | 1 retained | removed | composed project support | PASS |
| `visual-review-orchestration` | `/home/ccwq/hehome/hermes-data/skills/productivity/visual-review-orchestration` | `.agents/skills/productivity/visual-review-orchestration` | `move` | 2 retained | removed | composed project support | PASS |
| `visual-verification-gate` | `/home/ccwq/hehome/hermes-data/skills/productivity/visual-verification-gate` | `.agents/skills/productivity/visual-verification-gate` | `move` | 3 retained | removed | composed project support | PASS |

## Existing project-local skills retained

These 10 directories were already project-local and were not overwritten by a global source migration:

- `any2card-github-hardblue-workflow` — `.agents/skills/infocard/any2card/any2card-github-hardblue-workflow/SKILL.md`
- `cdp-visual-evidence-verification` — `.agents/skills/infocard/cdp-visual-evidence-verification/SKILL.md`
- `infocard-authoring-workflow` — `.agents/skills/infocard/infocard-authoring-workflow/SKILL.md`
- `infocard-build-and-deploy` — `.agents/skills/infocard/infocard-build-and-deploy/SKILL.md`
- `infocard-css-recovery` — `.agents/skills/infocard/infocard-css-recovery/SKILL.md`
- `infocard-grid-stripe-collapse` — `.agents/skills/infocard/infocard-grid-stripe-collapse/SKILL.md`
- `infocard-html-structure-debug` — `.agents/skills/infocard/infocard-html-structure-debug/SKILL.md`
- `infocard-poster-shell-rebuild` — `.agents/skills/infocard/infocard-poster-shell-rebuild/SKILL.md`
- `infocard-theme-assignment` — `.agents/skills/infocard/infocard-theme-assignment/SKILL.md`
- `infocard-mobile-verifier` — `.agents/skills/productivity/infocard-mobile-verifier/SKILL.md`
- `infocard-pub-publisher` — `.agents/skills/productivity/infocard-pub-publisher/SKILL.md`

## Merge details

- `infocard-metadata-provenance`: content-category field/schema rules are the canonical base; productivity-category sidecar/index ownership and release-time semantics were integrated. All distinct references were retained, plus `references/migration-provenance.md`.
- `infocard-q-style`: the richer content-category skill is canonical; the separate root compact variant was retained as `references/legacy-root-q-style-compact.md`, along with all canonical support references.

## Shared support retained globally

Generic cross-project browser automation, GitHub, research, image-generation, document, and general visual-review mechanisms were not included in the explicit candidate allowlist and were not deleted. This migration removed only the spec-required canonical `infocard-*` family plus the six named project-owned companions.

## Router routes

- create/write → `infocard-publish-sop`, `infocard-authoring-workflow`, `any2card`
- query/audit/topic → `infocard-topic-selection`, canonical `infocard-metadata-provenance`
- theme query/assignment → `infocard-theme-assignment` + selected `infocard-*-style`
- theme create/revise/govern → `infocard-style-man-skill`, `infocard-theme-redesign`, optional archival refinement
- update vs new → `infocard-update-vs-new-pattern` + publish SOP
- preview/mobile/visual → preview standards, mobile verifier/rendering verification, visual gate
- build/publish → publisher/build-and-deploy/closeout
- metadata/index/Wiki → canonical metadata provenance + Wiki coverage

## Deletion and blocked items

- Deleted: every source directory listed as `removed` in the table, after destination/support/router/config validation.
- Blocked: none among the explicit 52-canonical candidate inventory.
- Retired without replacement: none. Duplicate definitions were merged rather than discarded.

## Verification evidence

Pre-deletion deterministic validator output:

```json
{"project_skill_count":63,"unique_name_count":63,"migration_records":52,"router_bytes":4027,"errors":[]}
```

Checks performed:

- Every project `SKILL.md` starts with frontmatter, has `name` and `description`, and has a non-empty body.
- Canonical names are unique within the project tree.
- Every migrated source support file exists at the destination or, for a divergent same-path file, under an explicitly preserved alternate filename.
- Router contains all required route targets and `PROJECT_SKILL_UNAVAILABLE`.
- `skills.project_discovery=true` and trusted directory `/home/ccwq/qbox/opendir/project/infocard-pub` were verified in the existing Hermes config; config was not modified.
- No card build, publish, commit, push, or published-card content operation was run.

## Rollback provenance

Each row records the exact former global source directory and its project destination. The repository-local tree now preserves the complete migrated payload; global restoration, if ever required, can copy a recorded destination back to its recorded source path.
