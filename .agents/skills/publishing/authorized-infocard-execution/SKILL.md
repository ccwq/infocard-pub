---
name: authorized-infocard-execution
description: Use for authorized infocard runs after tool failures.
version: 2.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, publishing, execution, recovery]
    related_skills: [infocard-publish-sop, infocard-mobile-verifier, visual-verification-gate]
---

# Authorized Infocard Execution

Execution companion for an explicitly authorized infocard creation-and-publish run. The publishing SOP owns route selection, bundle schema, content gates, and release semantics; this skill owns execution discipline, resource fallback, evidence diagnosis, and closeout behavior.

## Authorization persists

When the user says “创建并发布信息卡”, “开始”, or “继续” during the same run, treat authoring, promotion, build, visual verification, commit, push, and public verification as one authorized critical path. Do not ask for phase-by-phase confirmation.

Pause only if the target changes, another platform is added, unrelated work would be deleted/reset, a secret would be exposed, or an unresolved editorial choice changes the requested artifact.

## Workspace and ownership boundary

Use only the primary repository checkout:

```text
Author: .docs/<run-id>/<slug>/ candidate artifacts + facts + manifest + evidence
Publisher: validate manifest → promote declared files to docs/assets → gates → Git → Pages
```

Record the primary checkout's ambient `git status --short`, preserve it, and exclude it from staging. Do not create or use Git worktrees, detached HEAD, temporary clones, `/tmp/infocard*`, force-push, reset, stash, or clean to isolate an infocard run.

Authors do not write formal `docs/`/`assets/`, generated indexes, or Git state. Publishers alone promote, build, commit, and push from the primary checkout.

## Execution sequence

1. Record ambient state and validate the `.docs` bundle, sidecars, theme decision, and promotion manifest.
2. Promote only declared HTML, sidecar, and assets into `docs/`/`assets/`.
3. Run card-scoped static checks and desktop/390px visual gate.
4. Repair only verified critical/major defects; each formal HTML/CSS edit invalidates visual evidence.
5. Run build/index/taxonomy/leak gates in the primary checkout.
6. Inspect the staged allowlist, commit, and non-force push from primary `main`.
7. Verify Git delivery, Pages workflow, exact public URL, release fingerprint, and fresh public visual evidence separately.
8. Retain `.docs` authoring material; do not perform any worktree cleanup.

## Resource recovery ladder

When one automation path fails, use the next available path without a new user decision:

1. Existing Chrome CDP 9222 and browser-native evaluation.
2. Existing local HTTP preview server and browser navigation.
3. System Chrome headless screenshot using a unique non-repository temporary profile.
4. Direct terminal checks: HTTP status, DOM dimensions, raw GitHub content, workflow status, and Git state.
5. An approved differentiated visual fallback.

Reduce scope to one card, one viewport, and one evidence artifact; do not repeat blocked batch commands.

## Screenshot diagnosis

Before treating a visual report as a CSS defect, inspect page `scrollHeight`, `scrollWidth`, `clientWidth`, relevant element geometry, and actual capture region. Distinguish a viewport crop, artificial canvas padding, and genuine clipping. If vision and DOM conflict, recapture the exact region once before editing.

## Visual evidence record

For each card retain desktop and 390px evidence with:

```text
card: <slug>
desktop: critical=0 major=0 minor=<n>
mobile: critical=0 major=0 minor=<n>
page_scroll_width: <number>
viewport_width: <number>
visual_status: VISUAL_PASSED | VISUAL_PENDING | VISUAL_BLOCKED
html_sha256: <sha256>
```

DOM checks are necessary but insufficient for visual PASS. Screenshot-provider failure remains `VISUAL_PENDING` unless an approved fallback produces structured findings.

## Build and push order

```text
promotion → local visual gate → npm run build → stage generated indexes
→ npm run verify / taxonomy / leak → stage declared HTML/sidecars/assets/evidence
→ inspect staged diff → commit → git push origin main
```

If remote advances, fetch/reconcile once in the primary checkout, regenerate affected outputs and evidence, and retry without force. Do not substitute raw GitHub 200 for Pages evidence.

## Communication discipline

During an authorized run, do not narrate routine steps. Report only a real blocker, a corrected deviation, or final deliverables with evidence and exceptions.

## Validated pitfalls

- Build scripts can refresh timestamps and generated indexes; inspect exact diffs and re-read sidecars after fixers.
- Run leak checks on the exact promoted HTML; investigate false positives rather than bypassing high-risk findings.
- First-viewport screenshots do not prove lower-page content exists or is clipped; inspect source/DOM and relevant regions.
- Pages deployment is asynchronous. Verify exact public card URL and critical assets after propagation.
- Author timeout is recovered from `.docs/<run-id>/<slug>/`, not from detached commits or worktrees.
- Existing worktree inventory/cleanup remains a separately authorized maintenance task, never a publishing fallback.

See `references/authorized-run-resource-recovery-20260809.md` for compact diagnostics; interpret any historical worktree wording there as incident context, not an active instruction.
