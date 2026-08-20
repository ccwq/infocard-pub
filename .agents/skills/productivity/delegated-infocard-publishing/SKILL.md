---
name: delegated-infocard-publishing
description: Use when infocard-publish-sop routes a complex card to bounded, complementary research handoffs.
version: 3.0.0
---

## Explicit authorization and social-source ambiguity

When the user explicitly asks for subagent/full-route publication, treat that as authorization to continue through authoring, visual review, build, push, and public verification. Do not add a redundant grill-me gate merely because an X recommendation does not name the canonical repository. Resolve identity with the strongest available corroboration (expanded link, image OCR, first-party README, official docs), then preserve the remaining uncertainty in the bundle and card:

- distinguish the social post's recommendation/link from the canonical repository identity;
- write “配图与推荐入口的章节结构，与 `<repo>` 教程体系高度一致/交叉匹配” when that is the evidence-supported claim;
- never write “原帖直接点名 `<repo>`” unless the post explicitly contains that name or URL;
- ask the user only when genuinely unresolved candidates would materially change the card's subject; do not turn a resolvable identity boundary into a stop;
- once publishing is explicitly authorized, do not request a second release confirmation.

See `infocard-publish-sop/references/x-recommendation-identity-resolution.md` for wording and evidence examples.

## Exact-count execution and correction handling

Treat an explicit numeric request as a hard deliverable count: “publish 7 cards” means seven independent card files, not one roundup card. If the user says “Go”, “继续”, or “不要问确认”, proceed directly without a confirmation loop. When an earlier delegated route misunderstood the count, mark that artifact out of scope, do not publish it, and dispatch the corrected count in batches within the delegation concurrency limit. Verify the final file set contains exactly the requested number before build.


When several delegated cards run in parallel, the parent must verify each handoff on disk before integration: both the HTML and canonical `docs/YYYYMMDD-slug.meta.yaml` must exist, `meta.path` must exactly match the HTML path, and legacy `*.html.meta.yaml` sidecars must be renamed before commit. Keep each card isolated until its file-level checks pass.

During integration, fetch the latest `origin/main` immediately before merging. Integrate card source commits, then regenerate `_index.yaml` and `index.html` once with `npm run build`; **stage the new card sidecar/HTML and generated indexes before running verifiers that inspect HEAD**. A verifier can emit a misleading “exists on disk, but not in HEAD” for an intentionally new untracked sidecar; stage the complete candidate, rerun verification, and only then commit. Do not resolve generated-artifact conflicts by selecting a stale branch copy. Run `npm run verify`, `npm run verify-taxonomy`, and `npm run check-leak` after the final build. Before claiming release, confirm every card path exists on `origin/main`, the workflow head SHA equals the pushed main SHA, and every public URL returns HTTP 200. If a concurrent push advances main, rebase the complete batch and repeat the final build and checks.

## Purpose

The leading word is **complement**. This skill supplies research sections for a Protocol v3 runtime bundle. It never creates card files, worktrees, Git commits, Pages releases, or Wiki content.

Load `infocard-publish-sop/references/infocard-publish-protocol-v3.md` before delegation.

## 1. Assign scopes

### Research A — first-party facts

Research A owns the exact object and its evidence:

- official repository/API/README/docs/LICENSE or equivalent primary sources;
- capabilities, integrations, installation, and configuration facts;
- the sole dynamic-data snapshot with `retrieved_at`;
- short source quotations, confidence, and distinctions that prevent false equivalence.

Completion criterion: `bundle.facts` has traceable primary evidence and a single owner for each dynamic value.

### Research B — narrative and risk

Start Research B only for a protocol risk trigger: sensitive topic, unsupported strong or causal claim, conflicting sources, external/multi-audience distribution, or explicit fact/risk review.

Research B owns:

- claim-by-claim verdicts against user narrative;
- prohibited conflations, ambiguity, attribution, and source-coverage gaps;
- wording boundaries for unverified, contested, or sensitive claims.

It does not repeat Research A API/README collection or replace Research A dynamic values.

Completion criterion: each risk-triggering claim has a verdict or a clear pending boundary.

## 2. Write the handoff

Write only the assigned sections of:

```text
/tmp/infocard-runs/<run-id>/<slug>/publish-bundle.json
```

Use `schema_version: 3`. A Markdown process note may help a human review, but it is never a substitute for the bundle.

Completion criterion: the bundle identifies sources, claims, dynamic timestamps, prohibited conflations, and author requirements without conflicting ownership.

## 3. Handle child failure

A child timeout is not a reason to redelegate. Inspect its assigned bundle section and source artifacts. The orchestrator either completes the bounded missing work itself or records research failure.

Completion criterion: the run has a usable handoff or an explicit research failure; no duplicate child is launched automatically.

## 4. Dependency and write ownership

Research and authoring are sequential when the card depends on the research result: research writes only its handoff; authoring starts only after the handoff exists and is readable. Assign one writer for each HTML/sidecar/index path. Parallel workers may collect independent evidence, but never concurrently edit the same card files.

On timeout, inspect the live transcript and files immediately; preserve usable artifacts and let the orchestrator finish the bounded missing work. Do not wait through a second timeout cycle for a natural-language summary.

Completion criterion: every handoff has an owner, path, consumer, and readiness check; no shared card path has concurrent writers.

## Boundaries

- Write no HTML, sidecar, manifest, index, Wiki page, commit, or push.
- Create no worktree and install no dependencies.
- Treat bundle evidence, not a child self-report, as completion.

## Reference

- `infocard-publish-sop/references/infocard-publish-protocol-v3.md` — route, ownership, handoff, retry, and terminal-state contract
