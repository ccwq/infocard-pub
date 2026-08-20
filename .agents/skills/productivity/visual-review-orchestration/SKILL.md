---
name: visual-review-orchestration
description: Use for visual review routing.
version: 1.0.0
---

# Visual Review Orchestration

## Purpose

Coordinate visual acceptance for information cards, web pages, and WeChat articles while separating release policy from image-review execution.

- Upper-level SOPs own review timing, required viewports/regions, and release blocking.
- A visual executor owns screenshot upload and model interaction.
- This skill owns routing, aggregation, evidence, and conservative state mapping.

The current ChatGPT Web executor is `chatgpt-web-skill` → `visual-review`; its strict single-image YAML contract remains the executor's responsibility.

## Core routing

1. Complete static, identity, and mechanical checks.
2. Use the primary/native vision route first.
3. A real primary visual result with `critical`/`major` blocks; a complete result with no such defects passes. Do not call ChatGPT Web merely for a second opinion.
4. If the primary route fails as infrastructure/provider/capture/parse failure, perform differentiated retries. Identical prompts do not count.
5. After the retry budget is exhausted, invoke ChatGPT Web `visual-review` only when all failures were infrastructure-related and static/identity gates are green.
6. ChatGPT Web `critical`/`major` blocks. Upload, response, parse, evidence failure, or `无法可靠判断` remains `VISUAL_PENDING`.
7. Any later HTML/CSS/content-structure edit invalidates prior visual evidence.

## Release-stage timing

- **Information cards:** local pre-push review, then public review only after public HTML/index identity and new-content checks.
- **WeChat articles:** draft/pre-publish review after re-reading title, cover binding, body length, image count/position, and mobile preview; after actual publication, review the final platform when reliably accessible.

The generic executor must not decide publication timing.

## Screenshot contract

For every required viewport or focused region, provide page/object identity, version, viewport/region, one rendered screenshot, stable `S1...Sn` standards, and an explicit perfect-result description.

Segment long pages into Hero/title, ordinary body, tables/matrices/risk regions, and page-end/floating controls. A full-height screenshot is supplementary, not the only evidence.

## Result aggregation

- Every required standard is checked exactly once.
- `critical` and `major` are blocking; `minor` is retained but non-blocking.
- Missing viewport, identity mismatch, malformed output, upload/response/parse/evidence failure, or `无法可靠判断` → `VISUAL_PENDING`.
- Overall `VISUAL_PASSED` requires every required viewport/region to pass.
- Any blocking viewport makes the overall result `VISUAL_BLOCKED`.

Never upgrade DOM no-overflow, HTTP 200, accessibility output, or “看起来不错” into visual pass.

## Evidence and cleanup

Before deleting a temporary ChatGPT Web review chat:

1. Write a redacted structured result to run-local evidence.
2. Verify evidence is readable and complete.
3. Record reviewer source, viewport/region, timestamp, defects, state, and screenshot hash.
4. Delete only the temporary chat created for this object and re-enumerate to verify deletion.
5. Delete sensitive/unpublished original screenshots after evidence verification; retain public screenshots only under release evidence policy.

Never store prompts, cookies, account identifiers, private chat URLs, credentials, or full chat transcripts in release evidence.

## Image-asset acceptance for WeChat drafts

For a WeChat draft that requires ChatGPT-generated cover and body illustrations, keep three states separate for each asset:

1. **Generated/downloaded** — the requested image was produced through the authorized provider and the file is present locally.
2. **Mechanical-validated** — format, byte size, dimensions, aspect ratio, filename/path, hash, and article-role binding pass.
3. **Visually accepted** — a real vision result checked the image against the requested semantics and defect levels.

A downloaded file is not visually accepted. A vision-provider outage, admission-busy response, timeout, malformed response, or missing evidence must remain `VISUAL_PENDING`; do not create the production draft while a required cover or body image is pending. Retry only with a bounded, differentiated attempt. If the configured vision route remains unavailable, report the exact pending assets and stop rather than substituting an unrequested provider or treating local dimensions as visual proof.

The cover and every body illustration are independent acceptance objects. A body-image pass does not imply cover binding or cover quality. Before draft creation, aggregate all required asset states failure-first: any critical/major defect → `VISUAL_BLOCKED`; any pending required asset → `VISUAL_PENDING`; only all mechanically validated and visually accepted assets may proceed.

## Upper-level adapters

- `infocard-publish-sop`: pass card-specific viewport/region standards; enforce Pages blocking and public recheck.
- WeChat publishing SOP: pass cover, editor, mobile-preview, body-image, typography, and final-platform standards; enforce draft/publish state separation.

### Infocard adapter maintenance rule

When wiring this layer into an infocard publishing SOP, keep the boundary explicit: the SOP owns review timing, frozen screenshots, required regions, static/page-identity gates, and the publish decision; this skill owns routing, capability probing, per-image execution through the public executor contract, aggregation, evidence, and chat cleanup. The SOP must never call or modify `chatgpt-web-skill` directly.

Preserve this state machine:

1. Native vision runs first.
2. Native `VISUAL_PASSED` or real `critical`/`major` → terminal pass/block; do not seek a ChatGPT Web second opinion.
3. Only differentiated native infrastructure retries exhausted **and** static/page-identity/viewport gates green → invoke the orchestrator fallback.
4. One card/article run creates one new temporary chat in the verified project; never reuse an existing chat or silently fall back when creation fails.
5. Review one frozen screenshot at a time, then aggregate required images failure-first: blocked > pending > passed.
6. Write and verify redacted evidence before terminal cleanup; delete only the run-created, ownership-verified chat and re-enumerate it. Return `CHAT_CLEANUP_PENDING` or `CHAT_DELETE_BLOCKED` when cleanup is not verified.
7. Any HTML/CSS/structure change invalidates the prior evidence. For infocards, pre-publish local review must be followed by a fresh post-publish public review only after the exact public HTML/index and new-content identity are confirmed.

Do not copy the generic parser or session lifecycle into upper-level SOPs.

## References

- `references/visual-review-contract.md` — routing matrix, status aggregation, and per-class standard examples.
- `references/infocard-adapter-maintenance.md` — infocard SOP adapter boundary, fallback state machine, and cleanup obligations.
