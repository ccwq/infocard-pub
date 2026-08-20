---
name: infocard-pub-publisher
description: Use when an authorized Protocol v3 infocard bundle is ready for exact .docs authoring promotion, build, release, public verification, and audit.
version: 3.1.0
---

# Infocard Pub Publisher

## Purpose

The leading word is **promotion**. This skill turns a frozen Protocol v3 bundle and its .docs/<card>/promotion-manifest.json into a formal release. It does not research, author card content, select themes, or manage subagents.

Load infocard-publish-sop/references/infocard-publish-protocol-v3.md before any promotion, Git write, or public verification.

## 1. Validate the authoring directory and manifest

1. Locate the declared .docs/<card>/ directory from the bundle. Confirm it is inside the authorized repository, ignored by the repository convention, and owned by the current run.
2. Validate publish-bundle.json and promotion-manifest.json as single JSON documents.
3. Resolve every manifest source relative to .docs/<card>/ and every target relative to the repository root. Reject absolute paths, .., duplicate targets, missing sources, undeclared assets, bundle/evidence files, and targets outside docs/ or assets/.
4. Validate each sidecar before promotion. It must be one YAML mapping with slug, path, category, title, desc, date, updated, and tags; path must equal the manifest target.
5. Confirm the authoring directory contains no process artifact, secret, screenshot, or generated index intended for publication.

Completion criterion: the bundle and manifest validate, every declared source exists, every target is safe, and all sidecars match the formal targets.

## 2. Promote exactly the manifest

1. Inspect git status --short and preserve unrelated user changes.
2. Copy each declared source file to its exact target. Create only the target parent directories required by the manifest.
3. Copy declared assets in the same way. Do not copy the whole .docs/<card>/ directory.
4. Record the source/target mapping, hashes, and promotion timestamp in the run bundle. Mark the business state PROMOTED only after the exact diff has been inspected.

For a multi-card batch, validate every card manifest first, then promote all cards before one shared build. Never promote generated _index.yaml or index.html from authoring output; the repository build owns them.

Completion criterion: the promotion diff contains only declared card artifacts and assets, with no unrelated modifications.

## 3. Build and verify

Run the repository gates from the authorized repository checkout:

- npm run build
- npm run verify
- npm run fix-taxonomy
- npm run verify-taxonomy
- npm run check-leak

Run card-specific structure, content, local-assets, and metadata checks from the bundle as applicable. Inspect the full diff after mutating commands and restore unrelated timestamp, sidecar, taxonomy, or historical index spillover. Re-read each changed sidecar after any fixer.

For a local structure/content failure, make one targeted repair and one complete rerun. A second failure is BLOCKED_AT_LOCAL_GATE.

Completion criterion: all required local gates pass, _index.yaml and index.html contain the target slug/path/title/description, and the staged allowlist is exact.

## 4. Visual and public verification

Consume the current visual disposition from the bundle. VISUAL_BLOCKED stops release. VISUAL_PASSED may proceed. VISUAL_PENDING may proceed only as PUBLISHED_PENDING_VISUAL with the exact infrastructure reason, mechanical responsive evidence, and follow-up state recorded.

Stage exactly the promoted card artifacts, declared assets, and generated index files; inspect the staged diff before creating the content commit. Push according to the repository's authorized Git workflow. If the remote advances, reconcile once in the authorized checkout, regenerate indexes, and rerun affected gates. A second integration failure is BLOCKED_AT_INTEGRATION.

For Pages, use the public docs/ path format:

    https://ccwq.github.io/infocard-pub/docs/<slug>.html

Verify the detail page, public _index.yaml, homepage/index entry, expected identity, and release-specific content with cache-busting. Expect HTTP 200 for the formal card URL, _index.yaml, and index.html; the bare-root card URL is a useful 404 cross-check. Use one initial attempt plus 10s -> 30s -> 60s retries. Do not treat HTTP 200 alone as current-release evidence.

When Pages is PUBLISHED, or online proof was explicitly requested, capture a fresh screenshot from the final online URL, including 390x844 when mobile review is required. Deliver a real absolute PNG path in closeout evidence. Screenshot failure, identity mismatch, or missing visual conclusion keeps the release at VISUAL_PENDING.

Completion criterion: the bundle contains public URLs, timestamps, identity/content evidence, the terminal Pages state, and any delivered online screenshot paths.

## 5. Audit commit

After public verification:

1. Update only the formal card sidecar with Protocol v3 release_audit fields.
2. Load audit-sidecar-gate.md and verify YAML, required fields, content-commit SHA, HTML/manifest hashes, visual/Wiki states, and the exact one-file staged set.
3. Create and push the audit-only commit. Record both commit IDs in the bundle.
4. If audit integration fails after Pages is public, preserve the Pages state and record AUDIT_PENDING.
5. If Wiki was requested, report its independent state after Pages; Wiki failure never rolls back Pages.

Completion criterion: the audit sidecar passes and the audit commit is pushed, or the bundle truthfully records AUDIT_PENDING after a successful Pages release.

## 6. Retain authoring material and close out

Retain .docs/<card>/ after the terminal business state. Report its absolute or repository-relative path, retained files, manifest hash, and any cleanup candidates. Run the closeout dry-run/report command defined by the repository or project convention; it may classify candidates but must not delete them.

Do not create, list, remove, or clean alternate checkouts as part of this skill. Do not request or use del-rm. Any deletion requires a separate explicit cleanup command and separately scoped authorization.

## Boundaries

- Never copy files outside the promotion manifest.
- Never promote bundles, screenshots, process files, secrets, or generated indexes from .docs/<card>/.
- Never use unrestricted directory copies or git add -A for release scope.
- Never force-push, alter unrelated user changes, or turn VISUAL_PENDING into a visual pass.
- Never delete retained .docs authoring material during publish or closeout.
- Never start Wiki automatically; it must be requested by the task.
