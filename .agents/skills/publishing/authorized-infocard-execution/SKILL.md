---
name: authorized-infocard-execution
description: "Use for authorized infocard runs after tool failures."
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, publishing, execution, recovery]
    related_skills: [infocard-publish-sop, infocard-mobile-rendering-verification, visual-verification-gate]
---

# Authorized Infocard Execution

Execution companion for an explicitly authorized infocard creation-and-publish run. The main publishing SOP owns route selection, bundle schema, content gates, and release semantics; this skill owns execution discipline, resource fallback, evidence diagnosis, and closeout behavior.

## Authorization persists

When the user says “创建并发布信息卡”, “开始”, or “继续” during the same run, treat authoring, build, visual verification, commit, push, and public verification as one authorized critical path. Do not ask for phase-by-phase confirmation.

Pause only if the next action changes the requested target, sends to another platform, deletes/resets unrelated work, exposes a secret, or requires a substantive editorial choice not inferable from the brief. A failed script, timeout, provider capacity error, stale tab, or missing screenshot is not itself a new decision boundary.

## Execution sequence

1. Preserve ambient state with a fresh worktree from current `origin/main`; never reset or stage unrelated changes.
2. Author only the declared card bundle and sidecars.
3. Run build/index and card-scoped static checks.
4. Run the visual gate per card at desktop and 390px mobile.
5. Repair only observable critical/major defects; after every HTML/CSS edit, invalidate and regenerate visual evidence.
6. Commit and push with the named worktree's explicit ref (`git push origin HEAD:main` when direct main delivery is authorized).
7. Verify repository delivery, Pages workflow, exact public URLs, and content fingerprints separately.
8. Close out only run-created processes/worktrees; do not delete ambient state.

## Resource recovery ladder

When one automation path fails, use the next available path without asking the user to choose:

1. Existing Chrome CDP 9222 and browser-native CDP evaluation.
2. Existing local HTTP preview server and browser navigation.
3. System Chrome headless screenshots, one card and one viewport per command.
4. Direct terminal checks: HTTP status, DOM dimensions, raw GitHub content, workflow status, and Git state.
5. An approved differentiated visual fallback.

Do not retry the exact same blocked one-shot batch command. Reduce scope to one card, one viewport, and one evidence artifact while keeping the authorized critical path moving.

## Screenshot diagnosis: canvas versus page

An oversized viewport screenshot is not reliable full-page evidence. Before treating a visual report as a CSS defect:

- read `document.documentElement.scrollHeight` and `document.body.scrollHeight`;
- record `scrollWidth` and `clientWidth` at 390px;
- compare screenshot content height with DOM height;
- distinguish first-screen viewport cropping, artificial canvas padding, and genuine content clipping.

If vision reports a clipped footer or huge blank region, recapture at the actual page height or by region before editing CSS. Do not patch layout from a screenshot artifact alone.

## Visual evidence record

For each card, retain one desktop and one 390px mobile capture and an explicit disposition:

```text
card: <slug>
desktop: critical=0 major=0 minor=<n>
mobile: critical=0 major=0 minor=<n>
page_scroll_width: <number>
viewport_width: <number>
visual_status: VISUAL_PASSED | VISUAL_PENDING | VISUAL_BLOCKED
```

DOM checks are necessary but insufficient for visual PASS. A screenshot-provider failure remains `VISUAL_PENDING` unless an approved fallback produces structured findings. It must not stop the whole authorized batch; continue static/public work and report per-card status accurately.

When vision disagrees with DOM geometry, perform one diagnostic recapture before changing CSS. If the discrepancy is screenshot geometry, preserve the card and correct the evidence method.

## Build and push order

1. `npm run build`
2. stage generated `_index.yaml` and `index.html`
3. run `node scripts/verify-index.js`
4. stage declared HTML and sidecars
5. run card-scoped leak checks and inspect the staged diff
6. commit
7. push the explicit ref

Do not call a card publicly accessible from raw GitHub 200 alone. Verify the Pages workflow commit SHA, Pages source configuration when available, exact public path, and a release-specific content fingerprint. If an assumed Pages path returns 404, report the mismatch; do not silently substitute another URL.

## Communication discipline

During an authorized run, do not narrate routine steps or ask the user to select fallback A/B/C. Report only a real blocker requiring a new decision, a corrected deviation, or final deliverables with evidence and exceptions. If the run was unnecessarily paused, acknowledge it briefly and resume immediately.

## Validated pitfalls and recovery patterns

- **Verify the actual branch after worktree creation.** `git worktree add` can appear to succeed while the target directory still points at a dirty ambient branch or a reused worktree. Immediately check `git branch --show-current`, `git rev-parse --show-toplevel`, and `git status --short`; if unrelated files are present, abandon that directory and create a clean worktree from `origin/main` rather than checking out over dirty state.
- **Build scripts may mutate generated indexes and refresh timestamps.** Treat `_index.yaml` and `index.html` as declared generated outputs, inspect their diff, and do not mistake a long build timeout for a failed build. Re-run the repository's direct build entrypoint with a bounded tail and verify generated index presence afterward.
- **Run leak checks on the exact new HTML and inspect false positives.** The repository scanner can flag benign resource labels containing `user-` as UUID-like identifiers. Confirm the full line and context before editing; remove or rephrase only the offending benign token, never bypass the high-risk gate blindly.
- **Do not infer missing lower-page content from a first-viewport screenshot.** If a visual reviewer says a later section or image is missing, inspect the DOM/source and asset URLs and recapture at the relevant scroll region. A desktop 1440×900 capture only proves the visible viewport, not the whole long card.
- **For media, verify both DOM presence and public asset delivery.** A black/loading video frame may be normal before playback; check the `<video>` source, local HTTP response, and deployed asset HTTP status separately. Keep the issue as a media-loading note unless the source or public asset is actually missing.
- **Pages deployment is asynchronous.** A successful Actions run or a 200 home page does not prove the new card is live. Poll the exact card URL and each critical local asset after deployment; allow propagation time and report the exact status codes.

See `references/authorized-run-resource-recovery-20260809.md` for the compact incident pattern and diagnostic commands.
