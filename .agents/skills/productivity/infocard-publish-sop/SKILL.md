---
name: infocard-publish-sop
description: Use when creating or publishing an infocard through the mandatory .docs-to-promotion workflow.
version: 4.0.0
---

# Infocard Publish SOP: `.docs` → Promotion → Main Checkout

## Non-negotiable workspace boundary

All information-card work uses the primary `infocard-pub` checkout. The only valid lifecycle is:

```text
Read-only research
→ .docs/<run-id>/<slug>/ authoring candidate, facts, evidence, assets, promotion-manifest.json
→ Publisher validates and promotes declared files into docs/ and assets/
→ local visual gate
→ build / verify / taxonomy / leak checks in primary checkout
→ narrow stage / commit / non-force push from primary checkout
→ cache-busted public HTTP, index, and visual recheck
```

Forbidden for every infocard run:

- `git worktree add/remove/prune`, any worktree reuse, detached HEAD, branch handoff, or temporary clone;
- any temporary information-card repository root;
- force-pushing main;
- Author writes to `docs/`, `assets/`, generated indexes, or Git state;
- ordinary publishing triggering inventory, removal, cleanup, reset, stash, or clean of historical worktrees.

Existing worktrees and `/tmp` artifacts are a separate inventory/cleanup concern and require separate explicit authorization. A dirty primary checkout is ambient state to record and exclude, not a reason to create an alternate checkout.

## Route

Use the light route only when there is one card, one complete primary source/user brief, no sensitive claim/risk trigger, no multi-source reconciliation requirement, and no shared batch. Otherwise use the full route with bounded Research A and, only when needed, Research B.

Creation-and-publication authorization authorizes this whole release chain unless the user explicitly requests draft-only or preview-only work. It does not authorize installing or configuring the subject tool.

## Roles

### Research

Research produces first-party facts, source boundaries, time-sensitive snapshots, claim verdicts, and evidence gaps. It does not write formal card files, create workspaces, build, commit, push, or publish.

### Author

Author writes only under `.docs/<run-id>/<slug>/`:

```text
card.html
card.html.meta.yaml
facts.json or research.md
theme-decision.txt
promotion-manifest.json
visual/
assets/ (only declared assets)
```

The Author must not directly write formal `docs/` or `assets/`, generated indexes, Git state, or `/tmp` files. It does not build, commit, push, or start Wiki sync.

### Publisher

Publisher owns manifest validation, exact promotion, visual gate, build, static gates, narrow Git staging, commit/push, public verification, and closeout. It operates only in the primary checkout.

## Bundle, sidecar, and manifest

Before authoring, create `.docs/<run-id>/<slug>/publish-bundle.json` and `promotion-manifest.json`.

Manifest requirements:

- every source is relative to the authoring directory;
- every target is repository-relative and only under `docs/` or `assets/`;
- reject absolute paths, `..`, duplicate targets, missing sources, undeclared assets, screenshots, bundles, process files, secrets, and generated indexes;
- never promote `_index.yaml` or `index.html` from `.docs`.

Every formal sidecar is one YAML mapping containing at least:

```text
slug, path, category, title, desc, date, updated, tags,
author, source, source_url, style
```

`path` must exactly equal the manifest HTML target. `date` and `updated` use quoted `YYYY-MM-DD HH:MM:SS`; Publisher sets final promotion time. Theme decision evidence must record content shape, primary/fallback theme, and rejection rationale before candidate HTML is written.

## Promotion

1. Record `git status --short` in the primary checkout and preserve all ambient changes.
2. Validate bundle, manifest, source paths, target paths, sidecars, theme agreement, and artifact allowlist.
3. Copy only manifest-declared HTML, sidecars, and assets into formal `docs/` and `assets/` targets.
4. Inspect the exact promotion diff and record source/target hashes in the bundle.
5. Do not promote a whole authoring directory or undeclared files.

For a batch, validate all manifests first, promote all declared artifacts, then build once in the same primary checkout.

## Required visual gate before build / commit / push

After promotion, before build:

1. render exact formal `docs/<slug>.html` locally;
2. capture desktop and 390px mobile evidence, including all relevant hero/body/table/code/risk/footer regions;
3. record explicit `critical / major / minor` findings and bind screenshot manifest to current HTML SHA-256;
4. run `npm run verify:visual-gate -- docs/<slug>.html`;
5. repair and recapture after every HTML/CSS/content/structure change;
6. block commit/push on any critical or major defect.

Infrastructure-only capture failure remains `VISUAL_PENDING`; it is never visual pass and does not permit silent release escalation.

## Main-checkout gates and release

**Terminal output truncation workaround**: each command's stdout is truncated to ~1 line. Use OUT-OF-BAND verification after each step — do NOT rely on the command's own output as the exit condition.

Run, in the primary checkout:

```bash
npm run build
# OUT-OF-BAND: curl -s _index.yaml | python3 -c "import yaml,sys; d=yaml.safe_load(sys.stdin); print('cards:', len(d['cards']))"

npm run verify
# OUT-OF-BAND: echo $? == 0

npm run fix-taxonomy
# OUT-OF-BAND: npm run verify-taxonomy && echo $? == 0

npm run check-leak
# OUT-OF-BAND: echo $? == 0
```

Then inspect every mutation. Stage only promoted artifacts, declared assets, current visual evidence, `_index.yaml`, and `index.html`; never use `git add -A`.

If remote main advances, reconcile once in the same primary checkout, regenerate affected indexes and visual evidence, then retry non-force push. A second integration failure is `BLOCKED_AT_INTEGRATION`.

Public verification requires cache-busted checks for:

```text
https://ccwq.github.io/infocard-pub/docs/<slug>.html
/_index.yaml
/index.html
```

Verify expected identity and release-specific fingerprint, then capture fresh public desktop/mobile evidence. HTTP 200 alone is not release proof.

## Update, rebuild, and timeout recovery

- New card vs update is decided before authoring through `infocard-update-vs-new-pattern`.
- Theme changes rebuild a `.docs` candidate around the selected theme skeleton, preserve required content, then promote through the same gate.
- Author timeout means inspect the declared `.docs/<run-id>/<slug>/` handoff. Continue valid artifacts or complete that directory; never search for or create a worktree.
- Build/sidecar failure gets one targeted repair and full gate rerun. Second failure is `BLOCKED_AT_LOCAL_GATE`.

## Closeout

Retain `.docs/<run-id>/<slug>/`. Report route, authoring path, manifest mappings, local build/static state, local visual state, content commit, public HTTP/index state, public visual state, and only terminal exceptions.

Do not start Wiki automatically. Do not list, prune, remove, or otherwise operate historical worktrees in ordinary closeout.

## Acceptance checklist

- [ ] No worktree, clone, detached HEAD, `/tmp/infocard*`, or force push used
- [ ] Author wrote only `.docs/<run-id>/<slug>/`
- [ ] Manifest validates source-to-target allowlist
- [ ] Promotion diff contains only declared formal artifacts
- [ ] Desktop/mobile visual evidence is current and has 0 critical / 0 major
- [ ] Build, verify, taxonomy, and leak gates pass
- [ ] Staged diff excludes ambient state
- [ ] Public detail/index/home fingerprint and fresh visual evidence pass
- [ ] `.docs` evidence retained; no cleanup side effect occurred

## Historical references

Historical worktree incident notes may be retained only for a separately authorized migration/cleanup investigation. They are not active publication instructions and must never be loaded to create, recover, publish, or clean a new information card.
