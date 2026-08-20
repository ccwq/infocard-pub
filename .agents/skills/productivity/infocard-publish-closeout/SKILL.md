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

Use this after an infocard has been built, verified, pushed, and checked on Pages. The Publisher handles promotion, build, push, and public verification; this skill handles evidence, retained authoring material, and the final report.

## When to Use

Use this skill when:

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

- npm run build
- npm run verify
- npm run fix-taxonomy
- npm run verify-taxonomy
- npm run check-leak

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

## Common Pitfalls

1. Calling publish done on HTTP 200 without release-specific identity/content evidence.
2. Treating .docs authoring files as formal publication artifacts without a manifest entry.
3. Deleting assets before proving they are not referenced by the formal card.
4. Forgetting regenerated indexes after an audit-sidecar change.
5. Treating mechanical DOM checks as visual PASS.
6. Mixing retained authoring material with the formal deliverable in the final report.

## Verification Checklist

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
