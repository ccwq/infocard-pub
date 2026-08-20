---
name: infocard-publish-closeout
description: Use when finishing an infocard publish to verify public delivery, retain the .docs authoring record, and report cleanup candidates without deleting them.
version: 2.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [devops, publishing, infocard, cleanup, verification, workflow]
    related_skills: [infocard-pub-publisher, delegated-infocard-publishing, infocard-mobile-verifier]
---

# Infocard Publish Closeout

## Overview

This skill closes the Protocol v3 business lifecycle after promotion, build, public verification, and audit. It keeps the authoring record at .docs/<card>/, separates deliverables from residue, and reports cleanup candidates as a dry-run. It does not delete authoring material or operate alternate checkouts.

<<<<<<< HEAD
Use this after an infocard has been built, verified, pushed, and checked on Pages. The Publisher handles promotion, build, push, and public verification; this skill handles evidence, retained authoring material, and the final report.
=======
Use this after an infocard has been built, verified, pushed, and checked on Pages, when you need to report leftover files, historical worktrees, stale branches, or other ambient debris. By default it reports publish worktrees and asks for the exact `del-rm` cleanup phrase; it does not delete them automatically.

It is intentionally narrower than the main publishing skill:
- `infocard-pub-publisher` handles build / push / verify.
- `infocard-publish-closeout` handles what remains after publication.
>>>>>>> c23d4d1f2ee3dd05cbbbeb57333bc2f5479e6fdf

## When to Use

Use this skill when:
<<<<<<< HEAD
=======
- A publish is complete but `git status` is not clean.
- Temporary worktrees or publishing directories still exist.
- Untracked asset directories were left behind by a subagent or rescue pass.
- You want to make sure “done” reports retained worktrees and the cleanup option clearly.
- You want a final pass before reporting completion to the user.
>>>>>>> c23d4d1f2ee3dd05cbbbeb57333bc2f5479e6fdf

- A publish has reached a terminal Pages state and needs a final report.
- A retained .docs/<card>/ authoring directory needs classification.
- Untracked assets, scratch files, or stale generated files need a read-only residue review.
- You need to verify that “done” includes public evidence and required gates.

Do not use this skill for initial research, card drafting, promotion, the first build/verify/push sequence, or unrelated Wiki editing.

## Closeout Procedure

### 1) Separate deliverable from retained material

Write down two buckets:

- **Target deliverable**: formal card artifacts, declared assets, generated indexes, Wiki pages when requested, and their commit IDs.
- **Retained authoring record**: .docs/<card>/ source files, publish bundle, promotion manifest, authoring evidence, and any explicitly classified cleanup candidate.

The retained authoring record is not part of the formal release unless a manifest entry explicitly promotes one of its files.

### 2) Verify the publish is truly complete

<<<<<<< HEAD
Confirm the card is present locally and publicly:

- formal public URL returns HTTP 200;
- expected identity and release-specific content appear on the public page;
- public _index.yaml contains the slug and exact formal path;
- homepage/index entry contains the card identity;
- local generated index and public HTML agree;
- 390px mobile layout has no page-level horizontal overflow when mobile review is required;
- save-button behavior exports a real PNG when the card exposes that control;
- Wiki raw/concept/entity/index/log are written and pushed when the request requires Wiki.

HTTP 200 alone is insufficient. Record the command, timestamp, status code, identity fingerprint, and visual disposition. If online screenshot delivery is required, report the real absolute PNG path.

### 3) Re-run release gates as applicable

If final content or metadata changed during audit, rerun:
=======
### 3) Check the workspace and retained worktree inventory
Run:
```bash
git status -sb
npm run worktree:list -- --repo <repo>
```
Look for:
- untracked `docs/assets/...` directories
- unexpected modified files
- fixed-root historical worktrees that are clean cleanup candidates
- external, repo-local, dirty, active, or ownership-uncertain worktrees that must be retained

**Capacity guard:** enumerate every temporary worktree before a new publish run. A released card can leave a full repository copy plus `dist/`, so repeated worktrees multiply storage quickly. New publish worktrees belong under the cross-platform fixed root reported by `node scripts/infocard-worktree.js root`. After public verification, retain the worktree and report the historical WT list. If the user replies exactly `del-rm`, re-scan and remove only clean registered worktrees inside that fixed root. Never use `--force`; dirty or unregistered former-worktree directories are classified and reported unless ownership is proven.

### 4) Report by default; clean only after del-rm
Safely delete or archive leftover non-worktree artifacts that are not part of the publish bundle. Publish worktrees are retained by default.

Typical removals:
- scratch files in the run temp area
- untracked asset subdirectories created during a failed or partial publish
- fixed-root clean registered publish worktrees only after exact `del-rm` confirmation

Never delete a file that has not already been verified as residue. The phrase `del-rm` only authorizes cleanup of fixed-root infocard worktrees; it does not authorize deleting the primary repository, external worktrees, screenshots, bundle evidence, or ordinary temp files.
>>>>>>> c23d4d1f2ee3dd05cbbbeb57333bc2f5479e6fdf

- npm run build
- npm run verify
- npm run fix-taxonomy
- npm run verify-taxonomy
- npm run check-leak

<<<<<<< HEAD
Inspect the final diff and ensure generated artifacts are current. A changed formal card without regenerated indexes is not closed.

### 4) Retain .docs and run a cleanup dry-run

Retain the complete .docs/<card>/ directory and report:

- path and card slug;
- retained source, bundle, manifest, and evidence files;
- manifest source-to-target mapping and hashes;
- untracked or scratch paths classified as cleanup candidates;
- paths that are intentionally retained or ownership-uncertain.

Run the repository/project cleanup dry-run or equivalent read-only inventory command. The dry-run may list candidates and reasons, but it must not remove files. If no dry-run command exists, report “cleanup dry-run unavailable” and continue with the explicit inventory.

Actual deletion requires a separate explicit cleanup command with separately scoped authorization. Do not infer deletion permission from publication completion.

### 5) Final report

Report in this order:

1. card, route, Pages state, visual state, Wiki state, content commit, audit commit, and public URL;
2. literal verification commands and their result (exit code/status);
3. retained .docs path and manifest summary;
4. cleanup dry-run candidates, retained paths, and ownership-uncertain paths;
5. only the terminal exception, if any: blocked local gate, blocked integration, failed Pages verification, pending visual evidence, failed Wiki sync, or AUDIT_PENDING.

Never report PUBLISHED_PENDING_VISUAL as a fully verified visual release. Never claim cleanup occurred when only a dry-run ran.
=======
### 6) Report with separation of concerns
When you answer the user, separate:
- what was published
- historical worktrees and their cleanup status
- what was cleaned only if a `del-rm` pass actually ran
- what remains intentionally open, dirty, external, active, or ownership-uncertain
>>>>>>> c23d4d1f2ee3dd05cbbbeb57333bc2f5479e6fdf

## Common Pitfalls

1. Calling publish done on HTTP 200 without release-specific identity/content evidence.
2. Treating .docs authoring files as formal publication artifacts without a manifest entry.
3. Deleting assets before proving they are not referenced by the formal card.
4. Forgetting regenerated indexes after an audit-sidecar change.
5. Treating mechanical DOM checks as visual PASS.
6. Mixing retained authoring material with the formal deliverable in the final report.

## Verification Checklist

<<<<<<< HEAD
- [ ] Formal published page returns HTTP 200
- [ ] Expected identity and release-specific content are visible
- [ ] Public _index.yaml contains the slug and exact path
- [ ] Homepage/index entry is current
- [ ] Mobile overflow and save-button checks pass when required
- [ ] Wiki raw/concept/entity/index/log are synced when required
- [ ] Metadata, taxonomy, leak, visual, and public gates are recorded
- [ ] Literal verification commands and results are reported
- [ ] .docs/<card>/ is retained and classified
- [ ] Cleanup dry-run candidates are reported without deletion
- [ ] No alternate checkout inventory or del-rm prompt is part of closeout
=======
- [ ] Published page returns HTTP 200
- [ ] Required keywords are visible
- [ ] `_index.yaml` contains the slug
- [ ] 390px mobile layout has no horizontal overflow
- [ ] Save button exports a real PNG
- [ ] Wiki raw / concept / index / log are synced if required
- [ ] `git status -sb` is clean or intentionally scoped
- [ ] Historical worktrees are reported from `npm run worktree:list -- --repo <repo>`
- [ ] If cleanup ran, it used exact `del-rm`, removed only clean fixed-root registered worktrees, and reported skipped entries
- [ ] Final report clearly separates deliverable vs retained/cleaned worktrees
>>>>>>> c23d4d1f2ee3dd05cbbbeb57333bc2f5479e6fdf
