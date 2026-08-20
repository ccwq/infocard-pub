# Infocard project skills and global router architecture

Status: ready-for-agent

## Problem Statement

`infocard-pub` is a self-owned project, but its procedural knowledge is split across the global Hermes skill registry and a partial project-local copy. The current state is inconsistent:

- Only 10 strongly coupled infocard skills were moved into the repository.
- Many self-authored infocard skills remain globally available, including publish orchestration, theme selection, preview, mobile verification, visual review, metadata, topic selection, style governance, source routing, and all theme skills.
- Several global skills contain direct `infocard-pub` paths, commands, theme contracts, GitHub Pages rules, `_index.yaml` behavior, or historical project-specific lessons. These are project business rules, not reusable system capabilities.
- Some skills have duplicate or ambiguous names, notably `infocard-metadata-provenance`.
- A global entry point is still needed because users may ask for “创建信息卡”, “查询信息卡”, “查询主题”, “创建主题”, “更新信息卡”, or “发布信息卡” before Hermes has loaded a project-local skill.
- The global entry point must not contain the full project workflow. It should route the request to the correct project-local skill and make the project boundary explicit.

The target architecture is therefore: **project-local infocard skills as the single source of truth; a small global router as the cross-project entry point; no project workflow duplicated in global skills**.

## Solution

### A. Make `infocard-pub` the authoritative home

Move all self-authored, infocard-pub-specific procedural skills into the repository's project-local skill tree under `.agents/skills/`, preserving their support files (`references/`, `scripts/`, `templates/`, and `assets/`) and their category organization.

The project-local tree must include:

1. **Core authoring and release**
   - `infocard-authoring-workflow`
   - `any2card`
   - `infocard-publish-sop`
   - `delegated-infocard-publishing`
   - `infocard-three-stage-pipeline`
   - `infocard-direct-publish`
   - `infocard-pub-publisher`
   - `authorized-infocard-execution`
   - `infocard-publish-closeout`
   - `infocard-publish-parallel-batch-pattern`
   - `infocard-build-and-deploy`

2. **Topic, source, metadata, and update routing**
   - `infocard-topic-selection`
   - `infocard-source-routing-decision-tree`
   - `infocard-x-content-tracing`
   - `social-source-boundary`
   - both `infocard-metadata-provenance` variants must be reconciled into one project-owned canonical skill
   - `infocard-update-vs-new-pattern`
   - `infocard-wiki-coverage`

3. **Preview, visual, mobile, and structural QA**
   - `infocard-creation-preview-standards`
   - `infocard-mobile-verifier`
   - `infocard-mobile-rendering-verification`
   - `infocard-responsive-layout`
   - `infocard-legibility-publishing`
   - `infocard-visual-pass-loop`
   - `infocard-visual-evidence-grounding`
   - `cdp-visual-evidence-verification`
   - `visual-verification-gate`
   - `visual-review-orchestration`
   - `infocard-html-structure-debug`
   - `infocard-css-recovery`
   - `infocard-grid-stripe-collapse`
   - `infocard-poster-shell-rebuild`
   - `infocard-layout-debugging`
   - `infocard-pub-hardening`
   - `infocard-theme-validation`

4. **Theme and style system**
   - every `infocard-*-style` skill that corresponds to a registered or maintained `infocard-pub` theme
   - `infocard-style-man-skill`
   - `infocard-theme-assignment`
   - `infocard-theme-redesign`
   - `infocard-archival-theme-refinement`
   - `infocard-crayon-r5-guard`
   - `infocard-tool-cli-pattern`
   - `infocard-rebuild-template-grill`
   - `infocard-paper-warm-style`

5. **Delivery and project knowledge support**
   - `infocard-preview-delivery`
   - `infocard-creation-preview-standards`
   - project-specific Wiki/index/build references currently embedded in other self-authored infocard skills should be moved into the relevant project-local owner rather than left as global business logic.

The implementation must inventory every global `SKILL.md` whose canonical `name` starts with `infocard-`, plus `any2card`, `social-source-boundary`, `visual-verification-gate`, `visual-review-orchestration`, `authorized-infocard-execution`, and `delegated-infocard-publishing`. Each item must be classified as `move`, `router-only`, `shared-support`, `merge`, or `retire`; no item may be silently omitted.

### B. Keep only thin global routers

Create a global router skill, tentatively named `infocard-router`, as the stable entry point for infocard requests outside a trusted `infocard-pub` checkout.

The router must:

- detect whether the current working directory is inside the `infocard-pub` repository;
- route to project-local skills when inside the repository;
- refuse to pretend that project-local skills are available when outside the repository;
- distinguish at least these request families:
  1. create/write an infocard;
  2. query or audit existing infocards;
  3. select or query a theme;
  4. create, revise, or govern a theme skill;
  5. update an existing card versus create a new card;
  6. preview/mobile/visual verification;
  7. build/publish/Pages release;
  8. Wiki/index/metadata maintenance;
- load the corresponding project-local skill by canonical name rather than duplicating its procedure;
- report a clear `PROJECT_SKILL_UNAVAILABLE` state when the project checkout is not active or the project skill is not discoverable;
- never route a publication or external side effect to a generic global substitute when the project skill is unavailable;
- preserve the user's authorization boundary and distinguish report/query from write/publish.

The router should use a small routing table and decision tree. The full procedures, commands, repository paths, theme tokens, release gates, and historical lessons must remain project-local.

Potential optional thin routers, to be decided during implementation only if the single router becomes ambiguous:

- `infocard-theme-router` for theme query/selection/theme creation;
- `infocard-release-router` for build/publish/Pages/Wiki release.

Do not create these optional routers unless a concrete collision or prompt-size problem is demonstrated. Prefer one global router with explicit subroutes.

### C. Global shared support boundary

Do not automatically move generic Hermes capabilities that merely happen to be usable during infocard work. Examples include generic browser automation, generic GitHub operations, generic research, generic image generation, and generic document tools. They may remain global unless their content contains infocard-pub business rules.

If a global skill contains mixed content:

- move the infocard-pub-specific procedure into the project-local owner;
- leave only the generic mechanism in the global skill;
- add a project-local reference or router mapping when needed;
- do not keep a second complete fork globally.

### D. Provenance and migration manifest

Create a project-local migration manifest that records, for every classified skill:

- canonical name;
- current global source path(s);
- destination project-local path;
- classification (`move`, `router-only`, `shared-support`, `merge`, `retire`);
- upstream/source provenance;
- whether supporting files were moved;
- whether a global copy was removed;
- replacement router target, if any;
- verification status.

The manifest is the audit trail and prevents future partial migrations.

## User Stories

1. As an infocard-pub maintainer, I want all self-authored infocard procedures in the repository, so that the project has one authoritative workflow source.
2. As an infocard-pub maintainer, I want theme skills to live with the theme registry and templates, so that theme behavior evolves with the actual repository.
3. As an infocard-pub maintainer, I want build, index, Pages, Wiki, and metadata rules to be project-local, so that unrelated projects do not inherit infocard-pub assumptions.
4. As an infocard-pub maintainer, I want the global layer to contain only a thin router, so that project business logic is not duplicated globally.
5. As a user, I want to say “创建信息卡” and be routed to the right project workflow, so that I do not need to know internal skill names.
6. As a user, I want to query available themes and receive the project theme registry, so that theme selection is based on the actual repository rather than stale global memory.
7. As a user, I want to create or revise a theme skill through the project governance workflow, so that new themes update the real `_themes.yaml` and preview surface consistently.
8. As a user, I want “查询信息卡” to remain read-only, so that a query does not silently create, modify, publish, or send anything.
9. As a user, I want “发布信息卡” to route through the project release gates, so that build, visual, index, commit, push, and public verification are not skipped.
10. As a maintainer, I want an explicit update-versus-new-card route, so that repeated subjects do not create duplicate cards by accident.
11. As a maintainer, I want duplicate skill names reconciled, so that Hermes never loads an ambiguous metadata skill.
12. As a maintainer, I want supporting references and scripts moved with their owning skill, so that project-local skills are executable and not hollow copies.
13. As a maintainer, I want global copies removed after verification, so that the project has a real single source of truth rather than two competing forks.
14. As a maintainer, I want rollback provenance recorded, so that a failed migration can be reverted without guessing the source.
15. As an operator, I want sessions outside the project to receive a clear unavailable-project response, so that Hermes does not fabricate project capabilities.
16. As an operator, I want the router to preserve authorization boundaries, so that a query/report request cannot become a publish action.
17. As a maintainer, I want the project-local skill set classified completely, so that no infocard skill remains globally by accident.
18. As a maintainer, I want generic browser, GitHub, research, and image capabilities to remain reusable, so that the migration does not overfit all shared tooling into one repository.
19. As a maintainer, I want a verification command or deterministic audit report, so that future updates can detect global/project duplication.
20. As a maintainer, I want the migration to be committed as a focused change, so that unrelated dirty worktrees and historical artifacts are excluded.

## Implementation Decisions

- The project root is `/home/ccwq/qbox/opendir/project/infocard-pub`.
- `.agents/skills/` is the project-local source of truth. Skills should retain category directories and supporting files.
- The existing 10 project-local skills are retained and expanded; they are not recreated under new names.
- A complete inventory is required before deleting any more global skills.
- Canonical names must be unique within the project-local tree. Duplicate `infocard-metadata-provenance` sources must be merged into one canonical project skill with provenance notes.
- Global deletion happens only after: destination content check, supporting-file check, router mapping check, project discovery check, and a clean inventory showing no unintended loss.
- The global router is not allowed to embed the full infocard-pub SOP. It may contain trigger phrases, route selection, project-root detection, failure states, and loading instructions only.
- The router must route by task family, not by superficial keywords alone. “主题” can mean theme query, theme assignment, theme implementation, theme redesign, or theme governance; these are different routes.
- The project-local route table must map at least:
  - create card → `infocard-publish-sop` / `infocard-authoring-workflow` / `any2card`;
  - query/select topic → `infocard-topic-selection`;
  - query/assign theme → `infocard-theme-assignment` plus the selected `infocard-*-style`;
  - create/revise theme → `infocard-style-man-skill` / `infocard-theme-redesign`;
  - preview/mobile/visual → `infocard-creation-preview-standards` / `infocard-mobile-verifier` / `infocard-mobile-rendering-verification` / visual gate skills;
  - build/publish → `infocard-pub-publisher` / `infocard-build-and-deploy`;
  - update existing card → `infocard-update-vs-new-pattern` plus the publish SOP;
  - metadata/index/Wiki → the canonical metadata/Wiki/index project skills.
- Generic support skills remain global only when they do not encode infocard-pub-specific paths, commands, or release contracts.
- Do not change the global Hermes project-discovery configuration in this spec implementation unless required by verification; configuration changes must be separately recorded and verified.
- Do not delete unrelated global skills or unrelated project files.

## Testing Decisions

Tests must verify external behavior and migration integrity rather than only directory names.

1. **Inventory completeness test**
   - Enumerate all global `SKILL.md` files by canonical name.
   - Confirm every infocard-related candidate has exactly one classification in the manifest.
   - Confirm no `move` item remains as an untracked global source after migration.

2. **Project tree integrity test**
   - Every moved skill has `SKILL.md`.
   - Every referenced support file exists under the destination.
   - Frontmatter names are unique.
   - References do not point to deleted global skill directories without a project-local replacement.

3. **Router mapping test**
   - For each route family, verify the router names the expected project-local target.
   - Verify query-only inputs route to read-only procedures.
   - Verify create/publish inputs preserve the explicit authorization boundary.
   - Verify outside-project execution returns `PROJECT_SKILL_UNAVAILABLE` rather than silently using a stale global procedure.

4. **Hermes discovery test**
   - Start Hermes from the project root and from a nested project directory.
   - Confirm project skills are discovered only when the project discovery configuration and trust state permit them.
   - Confirm project-local provenance and precedence are visible where supported by the installed Hermes version.
   - Test a fresh session after migration; do not rely on a pre-migration session cache.

5. **Global cleanup test**
   - `skills_list`/filesystem audit confirms the moved names are not present as global canonical skills.
   - Remaining global infocard-related skills are either approved routers or explicitly classified shared support.
   - No duplicate canonical name remains across project-local and global layers except approved router aliases.

6. **Repository regression test**
   - Run the repository's existing targeted tests and static checks required by the changed skill files.
   - Do not run a broad publish/build pipeline merely because skills moved; document any skipped card-site build and why.
   - Verify `git status --short` and stage only the migration manifest, project-local skills, router skill(s), and required configuration/documentation changes.

7. **Prior art**
   - Reuse the repository's existing `AGENTS.md`, `.scratch` issue conventions, and existing project-local skill governance patterns from other self-owned projects.
   - Reuse Hermes' project-local skill discovery and precedence behavior as the runtime contract.

## Out of Scope

- Rewriting the infocard-pub application, theme templates, build scripts, or published cards solely because skills moved.
- Deleting generic browser, GitHub, research, image, or document skills that remain useful across projects.
- Publishing the project-local skills to an external registry.
- Creating cron jobs or other long-lived automation.
- Changing Hermes core code.
- Adding a second full global infocard implementation fork.
- Performing a card publication as part of the skill migration.

## Further Notes

- The previous migration spec was a partial implementation plan and is superseded by this architecture spec.
- The current project-local set contains 10 skills; the global inventory contains substantially more infocard-specific skills, including theme and publishing families. The implementer must use the manifest rather than relying on a hand-written shortlist.
- The global router should remain useful when the user starts Hermes outside `infocard-pub`, but it must state that project-local execution requires entering the repository or setting the session working directory to it.
- If Hermes' installed CLI lacks a documented `trust` subcommand, verification must use the actual installed configuration and fresh-session behavior; do not invent CLI commands.
- The final implementation should report three separate states: project migration, global cleanup, and router/discovery verification. A successful local copy is not evidence that Hermes loaded the project skill.

## Comments

- 2026-08-20: Supersedes `.scratch/infocard-repo-local-skills/spec.md`. User clarified that `infocard-pub` is a self-owned project and that the goal is full project ownership with global routing, not a minimal partial copy.
- 2026-08-20: Initial investigation found approximately 50 globally named infocard skills, 10 already project-local skills, and two ambiguous `infocard-metadata-provenance` definitions. Exact classification is an implementation deliverable.

## Verification Checklist

- [ ] Full global infocard-related inventory completed
- [ ] Every candidate classified in migration manifest
- [ ] Project-local skills copied with support files
- [ ] Duplicate metadata skill merged
- [ ] Global moved copies removed after verification
- [ ] Global router created and kept thin
- [ ] Router maps create/query/theme/theme-create/update/publish routes
- [ ] Fresh Hermes project discovery verified
- [ ] No unrelated skills or repository artifacts changed
- [ ] Focused commit/push completed only after all gates pass
- [ ] Final report separates migration, cleanup, and discovery states
