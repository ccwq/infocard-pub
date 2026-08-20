---
name: infocard-publish-sop
description: "Use when creating or publishing an infocard: route low-risk single cards directly, coordinate bounded research for complex cards, and close the authorized .docs authoring and promotion release."
version: 3.1.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, publish, orchestration, verification]
    related_skills: [delegated-infocard-publishing, any2card, infocard-pub-publisher, visual-review-orchestrator]
---

# Infocard Publish SOP

## Purpose

The leading word is **route**. This is the sole entry for an infocard run and the medium orchestrator: it directly handles a simple card or coordinates bounded specialist handoffs for a complex card. It owns run state and the authorized release outcome; it does not own theme reconstruction or open-ended visual redesign.

Load `references/infocard-publish-protocol-v3.md` before selecting a route. It is the single source of truth for bundle schema, `.docs/<card>/` authoring, promotion manifests, retry budgets, states, audits, and migration.

For social post extraction (X/Twitter, 小红书), also load `references/social-post-extraction.md`.

## Route

Use the **light route** only when all conditions hold:

- one card;
- one primary source or complete user-provided text;
- not public-figure, public-opinion, political, medical, or financial-decision content;
- no multi-image acquisition, rights check, or material processing;
- no cross-repository, cross-platform, or multi-source verification requirement;
- not part of a shared publication batch.

Otherwise use the **full route**. The full route starts Research A. Add Research B only for sensitive topics, unsupported strong or causal claims, conflicting sources, external or multi-audience distribution, or explicit fact/risk review.

## Open the run

1. Confirm scope and whether Pages publication, push, and Wiki sync are authorized. A request to create and publish a card authorizes that release unless the user explicitly asks for draft-only or preview-only work.
2. Create `.docs/<card>/publish-bundle.json` with `schema_version: 3` and its exact `.docs/<card>/promotion-manifest.json`.
3. Inspect the live repository root, branch, status, `AGENTS.md`, package scripts, active validators, and registered styles. Record commands and compatibility requirements in the bundle.
4. Classify the route before dispatching a child or writing card files.
5. Record free disk capacity. Below 1 GB is `BLOCKED_AT_CAPACITY`; request separately authorized cleanup and do not delete retained `.docs` material.

Completion criterion: the bundle names the card, repository, requested delivery targets, authoring directory, promotion manifest, and exactly one route.

## Research and ownership

Research A owns exact object identity, first-party facts, and dynamic snapshots. Research B owns claim verdicts, ambiguity, attribution, and risk boundaries. A dynamic value has one Research A owner and one `retrieved_at`. Researchers do not write formal card files or promote artifacts.

The Author owns only `.docs/<card>/` HTML, sidecar, declared assets, promotion manifest, and authoring evidence. The Author does not run build/index, Git, Pages, or Wiki operations.

The Publisher owns manifest validation, exact promotion, metadata normalization, build, repository gates, visual/public verification, commits, push, audit, and final release state. Closeout owns evidence reporting and retained-authoring classification.

## Authoring contract

Author only inside the ignored `.docs/<card>/` directory. Keep the directory retained after publication. The authoring directory may contain source HTML, a flat sidecar, declared assets, `publish-bundle.json`, `promotion-manifest.json`, facts/claim evidence, and visual evidence. Bundles, screenshots, process files, secrets, and temporary files are never promoted.

The manifest is the single source of truth for promotion. Every source path is relative to `.docs/<card>/`; every target path is repository-relative and must be under `docs/` or `assets/`. Reject absolute paths, `..`, duplicate targets, missing sources, and undeclared files. Generated `_index.yaml` and `index.html` are produced by the repository build, never copied from authoring output.

The formal sidecar must be one YAML mapping and contain at least `slug`, `path`, `category`, `title`, `desc`, `date`, `updated`, and `tags`. `path` must equal the exact manifest target. Keep `desc` before `title` where the live repository parser requires that ordering. The Author uses write-time UTC; the Publisher overrides `date` and `updated` to promotion-time UTC before `npm run build`.

## Theme and duplicate gates

Before authoring, select one registered theme and read its style skill and matching `theme/*.html` demo. Verify that `meta.yaml.style` equals HTML `data-theme`, the target token signature exists, and at least two structural signatures are present. A metadata-only style change is not implementation. For batches of three or more cards, same-theme reuse requires a recorded content-form, reader-scenario, and information-density exception.

Before authoring or releasing a new card, query the current LLM Wiki read-only for duplicate subject, repository, project, or recurring series. The default is update/improve the canonical existing card. Record `no_match`, update, or new-card reasoning in the bundle. Do not silently overwrite a raw source, merge historical versions, or delete duplicates.

## Visual gate

Set `visual_review.required` and its triggers in the frozen bundle when the card contains a multi-column layout, table, code block, fixed/sticky control, or image/chart gallery. The Author cannot downgrade this field.

Render the `.docs/<card>/` HTML at desktop `1440x900` and mobile `390x844` after verifying page identity. Capture a frozen screenshot manifest with per-region `critical`, `major`, and `minor` findings. A `critical` or `major` result is `VISUAL_BLOCKED`; repair and recapture. A clear result is `VISUAL_PASSED`. Infrastructure-only failure after the configured retry budget is `VISUAL_PENDING`, never a visual pass. When a table has five or more columns, provide a mobile cardized or vertically stacked alternative.

Any HTML, CSS, or structure change invalidates prior visual evidence. After promotion and public verification, run a fresh online-URL review when the state is `PUBLISHED` or online proof was requested. Deliver a real absolute PNG path; a virtual browser screenshot path is not delivery evidence.

## Publish and audit

When authoring is complete, call `infocard-pub-publisher` with the frozen bundle. It validates and promotes only the manifest, then runs the repository gates from the authorized checkout. The canonical gate sequence is:

```bash
npm run build
npm run verify
npm run fix-taxonomy
npm run verify-taxonomy
npm run check-leak
```

The required gates are metadata/bundle structure, manifest validation, build, repository verification, taxonomy verification, leak check, static content/local-assets checks, visual disposition, and cache-busting public checks. A local structure/content failure gets one targeted repair and one complete rerun; a second failure is `BLOCKED_AT_LOCAL_GATE`.

The content commit contains only promoted card artifacts, declared assets, and generated indexes. After public verification, update only the formal sidecar with `release_audit`, run `audit-sidecar-gate.md`, and create the audit-only commit. If audit integration fails after Pages succeeds, preserve Pages and record `AUDIT_PENDING`. Wiki runs only when requested and never rolls back Pages.

## Date and public verification

The final public URL for a card is:

```
https://ccwq.github.io/infocard-pub/docs/<slug>.html
```

Verify the detail page, public `_index.yaml`, homepage/index entry, expected identity, and release-specific content with cache-busting. Expect HTTP 200 for the formal card URL, `_index.yaml`, and `index.html`; the bare-root card URL is a useful 404 cross-check. Use one initial attempt plus `10s → 30s → 60s` retries. HTTP 200 alone is not current-release evidence.

## Closeout

Before final delivery, stop temporary HTTP servers and remove only verified scratch files. Retain `.docs/<card>/` and classify its source, bundle, manifest, evidence, and cleanup candidates. Run the project cleanup dry-run/report command; it may list candidates and reasons but must not delete them. Actual deletion requires a separate explicit cleanup command and separately scoped authorization.

Report result first:

```text
| card | route | Pages | visual | Wiki | content commit | audit commit | public URL |
```

Then report literal verification commands and results, the retained `.docs/<card>/` path, the manifest source-to-target summary, cleanup dry-run candidates, and only the terminal exception. Never call `PUBLISHED_PENDING_VISUAL` a fully verified visual release.

## Completion language

Report evidence by layer: `build/static`, `public HTTP/index`, and `mobile visual`. Do not call a card or batch complete when a required layer is pending. Preserve exact `VISUAL_PENDING`, `BLOCKED_AT_LOCAL_GATE`, `BLOCKED_AT_INTEGRATION`, `PAGES_VERIFICATION_FAILED`, `FAILED`, or `AUDIT_PENDING` states.

## Boundaries

- Never copy outside the promotion manifest.
- Never use unrestricted directory copies or `git add -A` for release scope.
- Never force-push, alter unrelated user changes, or turn `VISUAL_PENDING` into a visual pass.
- Never install or configure the subject tool unless separately authorized; card commands are explanatory content.
- Never delete retained `.docs` authoring material during publish or closeout.
- Never start Wiki automatically; it must be requested.

Historical references to alternate checkout recovery, detached HEAD, or old cleanup commands are legacy incident notes only; they are not active execution guidance.

## References

- `references/infocard-publish-protocol-v3.md` — authoritative lifecycle, manifest, states, gates, retry budgets, and audit schema
- `references/validator-compatibility.md` — use when live validators differ from Protocol v3 fields
- `references/repository-discovery.md` — use before route selection
- `references/visual-infrastructure-failure.md` — use only for capture/runner failures
- `references/visual-screenshot-misdelivery.md` — use when screenshot identity is wrong despite correct DOM evidence
- `references/audit-sidecar-gate.md` — use after Pages verification and before the audit-only commit
- `references/execution-lessons-priority.md` — P1 hard gates, P2 defaults, P3 scenario checks
- `references/batch-content-json-authoring.md` — multi-card content schema, deterministic renderer ownership, timeout recovery, and .docs promotion contract
- Legacy incident references remain available for historical diagnosis; do not follow their alternate-checkout or cleanup instructions in active runs.
