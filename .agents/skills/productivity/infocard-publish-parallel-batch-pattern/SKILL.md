---
name: infocard-publish-parallel-batch-pattern
description: "Use for coordinating 2–3 independent infocard Authors in parallel through the canonical .docs promotion workflow."
version: 3.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, publish, batch, parallel, authoring]
    related_skills: [infocard-publish-sop, infocard-theme-assignment, visual-verification-gate]
---

# Parallel Infocard Authoring and Release

## Purpose

This skill coordinates a small batch of independent cards. It does not define a second publishing route. Workspace boundaries, theme assignment, visual evidence, promotion, static gates, and Git safety are owned by the canonical project rules:

- `AGENTS.md` — primary checkout and `.docs` boundary
- `infocard-theme-assignment` — one content-to-theme decision owner
- `visual-verification-gate` — screenshot and visual disposition contract
- `infocard-publish-sop` — release lifecycle and closeout

This skill adds only batch cardinality, parallel Author coordination, and one shared Publisher release.

## When to use

Use when all conditions hold:

- 2–3 independent cards;
- each card has a complete source brief or facts handoff;
- each card gets its own frozen `theme-decision.json` before Author starts;
- all cards belong to one user-facing release.

Use the full three-stage pipeline for shared/heavy research, complex fact reconciliation, or more than three cards. Do not create a parallel publishing route for convenience.

## Batch invariants

- Expected card count is a release invariant: requested cards = Author candidates = promoted HTML/sidecar pairs = public index entries.
- Author outputs live only under `.docs/<run-id>/<slug>/`.
- Publisher promotes only manifest-declared files into `docs/` and `assets/`.
- Never write formal outputs directly from an Author or orchestrator into `docs/`.
- A subagent summary is not evidence; verify files, bytes, hashes, manifest, and final index entries on disk.

## Workflow

### 1. Preflight

1. Record `git status --short` in the primary checkout.
2. For every card, determine `content_type`, `content_shape`, required modules/capabilities, source URL, and evidence boundary.
3. Run `infocard-theme-assignment` once per card and freeze:

```text
.docs/<run-id>/<slug>/theme-decision.json
```

4. Review recent theme distribution for the batch. If diversity review is required, record the explicit exception and reason in the decision evidence; do not silently force a theme.

### 2. Parallel Author dispatch

Each Author receives only its card's source/facts and frozen decision path. The context must say:

```text
Read and consume theme-decision.json.selected_theme exactly.
If missing or invalid, return THEME_BLOCKED.
Write only under .docs/<run-id>/<slug>/.
Create card.html, sidecar, promotion-manifest.json, and required facts/evidence.
Do not write docs/, assets/, indexes, or Git state.
Do not select, override, or invent a theme.
```

The delegation context must not contain `Theme: <specific-theme>`, `Create a <specific-theme> card`, or equivalent preselection.

Each Author must report:

- authoring directory;
- candidate files and byte sizes;
- selected theme read from the decision file;
- manifest validation result;
- status `COMPLETE` or `PARTIAL`.

### 3. Publisher release

After every Author candidate is independently re-read and validated:

```bash
node scripts/promote-infocard.js --manifest .docs/<run-id>/<slug>/promotion-manifest.json
npm run verify:visual-gate -- docs/<slug>.html
npm run build
npm run verify
npm run fix-taxonomy
npm run verify-taxonomy
npm run check-leak
```

For a batch, validate all manifests before promotion, promote all declared artifacts, then build once. Capture fresh desktop/mobile evidence for every card. Stage only promoted artifacts, declared assets, current visual evidence, and generated indexes. Never use `git add -A`.

### 4. Cardinality and public verification

Before closeout, verify:

1. expected slugs = actual `.docs` candidates = promoted HTML/sidecar pairs;
2. each sidecar `path` equals its manifest HTML target;
3. generated `_index.yaml` and `index.html` contain every expected card;
4. public detail pages, public indexes, titles, themes, and release fingerprints match the batch;
5. each public card has fresh desktop/mobile visual evidence.

Use cache-busting and retry Pages propagation at 10s, 30s, and 60s. HTTP 200 alone is not release proof.

## Failure handling

- Author timeout: inspect that Author's `.docs` directory and retain valid artifacts; do not search for or create a worktree.
- Missing/invalid theme decision: `THEME_BLOCKED`; stop that card before authoring.
- Manifest or theme-contract failure: repair the candidate, regenerate hashes, and rerun promotion validation.
- Visual failure: follow `visual-verification-gate`; any critical/major defect blocks release.
- Build/index failure: inspect generated artifacts and ambient changes, then rerun the affected gate; do not stage unrelated metadata churn.
- Non-fast-forward: reconcile once in the primary checkout, regenerate affected indexes/evidence, and rerun required gates. Never force-push.

## Pitfalls

- Do not confuse a different accent color with a different theme.
- Do not treat `theme/<slug>.html` as a stylesheet; consume it as a template skeleton and emit self-contained card HTML.
- Do not append a second YAML document to a sidecar.
- Do not trust a child-agent summary, build output, or HTTP status without on-disk identity and hash checks.
- Any HTML/CSS/content change invalidates prior visual evidence.

## Verification checklist

- [ ] Every card has a frozen, valid `theme-decision.json` before Author dispatch.
- [ ] Every Author wrote only inside its `.docs/<run-id>/<slug>/` directory.
- [ ] Every manifest validates source/target containment and hashes.
- [ ] Promotion happened before formal build/release.
- [ ] Every card has fresh desktop/mobile visual dispositions with 0 critical/major.
- [ ] Build, verify, taxonomy, and leak gates passed.
- [ ] Staged diff contains only the batch release scope and generated indexes.
- [ ] Public detail/index/home fingerprints and visual evidence passed.
- [ ] No worktree, clone, detached HEAD, force-push, cleanup, or automatic Wiki sync occurred.

## Ownership rule

If a rule here conflicts with `AGENTS.md`, `infocard-publish-sop`, `infocard-theme-assignment`, or `visual-verification-gate`, those canonical sources win. This file remains a batch coordination recipe, not a duplicate SOP. The former direct-`docs/` authoring path was invalid and has been removed.

---
