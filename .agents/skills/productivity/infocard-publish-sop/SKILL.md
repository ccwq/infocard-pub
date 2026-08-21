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

## STOP GATE — Pre-push visual evidence is mandatory

Before `npm run build`, commit, or push for any changed card HTML/CSS/structure/content:

1. Render the exact local candidate from the current worktree.
2. Capture desktop and mobile screenshots/regions.
3. Produce explicit `critical / major / minor` findings.
4. Persist a visual evidence manifest bound to the current HTML sha256.
5. Run `npm run verify:visual-gate -- docs/<slug>.html`.
6. Block release unless every required viewport is `0 critical / 0 major`.

`HTTP 200`, build success, DOM checks, CSS token presence, and previous screenshots are preconditions only; none authorize push. Any HTML/CSS/structure/content edit invalidates prior evidence. After push, verify public HTML identity and run a fresh public visual review; report local and public visual states separately.


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
**⚠️ Authoring subagent timeout vs. detached HEAD (2026-07-23)**: There are TWO failure shapes after subagent `status=timeout`. Distinguish before recovery:

1. **Detached HEAD commit exists**: `git log --all --oneline` shows a new commit on a detached HEAD. Recovery: `git checkout -b publish/<slug>-YYYYMMDD` → continue.
2. **No commit, worktree empty**: subagent spent API calls on planning/reading, never wrote HTML. Recovery: main thread writes HTML + meta.yaml directly in the worktree. See `references/pitfalls-20260723.md` P1.

**⚠️ meta.yaml required-field checklist (2026-07-23)**: Build fails if any of these is missing or wrong order: `desc` (MUST be before `title`), `title`, `slug`, `path` (full relative path to HTML), `category`, `tags` (separate from `taxonomy`), `taxonomy` (≥1 item). Add a `templates/meta-yaml-minimal.yaml` reference or include the checklist inline in the Authoring subagent prompt. Full field list: `references/pitfalls-20260723.md` P1.

**⚠️ Two-commit audit invalidates `_index.yaml` (2026-07-23)**: After content commit, adding `release_audit` block to sidecar YAML requires running `npm run build` again to regenerate `_index.yaml` and `index.html`. Otherwise `npm run verify` blocks with `_index.yaml is out of date`. The audit commit must contain only sidecar + regenerated indexes, never HTML. Plan two commits up front: commit 1 = HTML + sidecar + indexes; commit 2 = sidecar (with audit) + regenerated indexes. Full sequence in `references/pitfalls-20260723.md` P1.

**⚠️ Subagent timeout ≠ no output (2026-07-19, updated 2026-07-22)**: When a subagent reports `status=timeout` with 42+ API calls completed, it often has already committed the work. Always check `git log --oneline` and `git worktree list` immediately after timeout. If no commit is visible in `git log --oneline`, use `git branch -a` — the subagent may have committed to detached HEAD, which is invisible to plain `git log`. See `references/detached-head-commit-recovery.md`. Only generate from scratch if no commit is found in `git log --all --oneline`.

**⏱ Subagent timeout → worktree recovery (2026-07-20)**: Full recovery flow when subagent times out mid-publish: worktree inspection → merge or cherry-pick → conflict resolution with `--theirs` for index files → push. See `references/subagent-timeout-worktree-recovery.md`.

**⚠️ Detached HEAD commit blind spot (2026-07-22)**: When subagent commits to detached HEAD, `git log --oneline` in the worktree shows only the main repo's history — the subagent's new commit is invisible. Use `git branch -a` or `git log --all --oneline` to find it. Full recovery flow: `references/detached-head-commit-recovery.md`. Prevention: always tell subagent "commit to a named branch, not detached HEAD" in the context.

## Conditional visual gate: Before selecting a release route, the main thread must inspect the intended card structure and write `visual_review` into the frozen publish bundle. Set `visual_review.required=true` and list `visual_review.triggers` when the card contains any of: multi-column layout, table, code block, `fixed`/`sticky` control, or image/chart gallery. The Author cannot downgrade this field. When required, load `infocard-mobile-rendering-verification` before push; its local 390px evidence gate is release-blocking. When not required, record `required=false` and the no-trigger rationale; static checks may proceed without visual capture.

**Visual-review-orchestrator integration (spec v0.1):** This SOP owns the business timing, frozen screenshot manifest, viewport/region standards, required-image list, and release gate; it must call the local `visual-review-orchestrator` rather than directly depending on or invoking third-party `automation/chatgpt-web-skill` internals. Keep the existing native-vision-first, differentiated-retry, and `VISUAL_PENDING` / `VISUAL_PASSED` / `VISUAL_BLOCKED` rules:

1. Run native visual review first. A clear pass is `VISUAL_PASSED` and **must not** call ChatGPT Web; a real `critical`/`major` defect is `VISUAL_BLOCKED`, stop and repair, and **must not** call ChatGPT Web.
2. Only when the native visual infrastructure failure is differentiated-retried to exhaustion, the failure is confirmed as infrastructure (provider/model/auth, capacity/structure, capture/browser startup, timeout, empty/unreliable structured result), and all static gates plus page identity/version/viewport checks pass, may the SOP invoke `visual-review-orchestrator`. Never use it for a second opinion or to bypass a real defect or unfinished retry budget.
3. Freeze each screenshot with a unique `review_id`, local path, SHA-256 when retained, viewport, region, required flag, `S1...Sn` standards, and `perfect_result`. Default viewports are desktop `1440x900` and mobile `390x844`; cover the actual card areas: `hero`, ordinary `body`, `table`/`matrix`, `risk`, `footer`, `fixed`/floating controls, plus `full` where needed. Check no global horizontal overflow; wide tables must be an isolated scroll container or have a mobile cardized alternative. Any HTML/CSS/structure change invalidates prior visual evidence.
4. For an orchestrator fallback, pass a `review_task` with `project_type: infocard`, `project_id`, `phase: pre_publish` or `post_publish`, frozen screenshots, standards, and `session.create_new: true`, `delete_on_terminal: true`. One card gets one new temporary session in the verified `agents-op` Project; never reuse an existing session or silently fall back when creation fails. The orchestrator probes the public `visual-review` contract before use and fails closed as `VISUAL_PENDING` if incompatible/unavailable.
5. The orchestrator reviews one image at a time, aggregates results failure-first: any required image `VISUAL_BLOCKED` → project `VISUAL_BLOCKED`; otherwise any required `VISUAL_PENDING` or missing/identity-mismatched required image → `VISUAL_PENDING`; only all required images `VISUAL_PASSED` → `VISUAL_PASSED`. Keep non-required failures and all `minor` findings in evidence. Record visual status separately from Pages status.
6. Pre-publish review is against the local rendered card before build/commit/push. After push, first confirm the exact public HTML and index contain the new card/content; only then run the `post_publish` public re-review using fresh screenshots. Do not reuse pre-publish evidence for changed HTML/CSS/structure.
7. The orchestrator must write and verify redacted evidence before terminal cleanup, then complete the business terminal state and delete only the run-created, ownership-verified temporary session via the visible UI, re-enumerate to confirm disappearance, and close its dedicated tab. Cleanup status is explicit: `NOT_CREATED`, `CREATED`, `REVIEWING`, `EVIDENCE_VERIFIED`, `CHAT_DELETED`, `CHAT_CLEANUP_PENDING`, or `CHAT_DELETE_BLOCKED`; a failed cleanup never invalidates the visual result but must never be reported as complete.
8. The bundle/closeout must preserve the orchestrator adapter, `chatgpt-web-skill` dependency, `visual-review` capability, compatibility state, per-image critical/major/minor findings, evidence path, and cleanup state. Do not modify the third-party skill, call ChatGPT Web directly, upload screenshots outside the orchestrator, or inherit evidence across a new run or content change.

**⚠️ Table trigger is release-blocking for mobile**: When `visual_review.triggers` includes `table`, the gate MUST verify that 5+ column tables have mobile `.case-card-list` alternatives — not just that a screenshot was taken. A screenshot of a 7-column table at 390px that shows squeezed single-character-per-line text is a FAIL, not a pass. See `references/css-table-anti-patterns.md` for the correct table-to-card responsive pattern and detection rules.

**⚠️ Worktree detached HEAD push trap (2026-07-19)**: A worktree created with `--detach` is in detached HEAD state. Running `git push origin main` from inside it checks whether `origin/main` is up-to-date locally — **it does not push the new commit**. It returns "Everything up-to-date" even when the commit exists locally. Correct: write to the main repo directly for batches, or use a named branch (`git checkout -b <slug>-push`) for single-card worktree publishing.

**⚠️ GitHub merge API requires PUT, not POST** — see `references/github-merge-api-method-pitfall.md` (2026-07-22 verified). Using POST returns HTTP 404 even with correct token and PR number. This is a bundled-skill documentation error.

**⚠️ Worktree location and cleanup contract (2026-08-20)**: New publish worktrees must be created under the cross-platform fixed root reported by the infocard-worktree root CLI: os.tmpdir()/infocard-worktree (`/tmp/infocard-worktree` on typical Linux, `%TEMP%\infocard-worktree` on Windows). Do not create repo-local `wt-*`, `/tmp/infocard-*`, clones, or copied repos for new publish runs. Use the infocard-worktree resolve CLI with run-id and slug to get the exact path. When an infocard reaches its terminal business state, keep the worktree, run the infocard-worktree list CLI for the repo, report historical WT entries, and prompt exactly: `如需清理可安全删除的历史 worktree，请回复：del-rm`. Only after the user replies exactly `del-rm` may the agent run `npm run worktree:cleanup -- --confirm del-rm`; it must re-scan, remove only clean registered worktrees inside the fixed root, never use `--force`, and report removed/skipped/remaining entries. Orphan directories are reported unless ownership is proven. Historical references mentioning `/tmp/infocard-*`, repo-local `wt-*`, or automatic removal are incident records, not the current creation/cleanup contract.

**⚠️ Large-card authoring and generated-artifact recovery (2026-07-22)**:
- Do not send one oversized `write_file` payload for a dense HTML card. Split authoring into bounded writes/patches: scaffold/CSS+Hero, then sections, then footer/closing tags. If a stream timeout occurs, do not retry the same payload; inspect the file and append/patch smaller chunks.
- A new sidecar must satisfy the live schema before build: at minimum `slug`, `title`, `desc`, `date`, `updated`, `author`, `category`, `style`, `tags`, `source_url`, and `path`. `path` must equal the actual public HTML path. A missing `category` or stale path causes index build failure or a misleading release.
- Build-generated `_index.yaml` and `index.html` must be regenerated after renaming a dated card path. After a remote race, fetch and rebase once; resolve generated-file conflicts by regenerating/validating from the rebased worktree, then stage generated artifacts before `verify-index.js`.
- Run the leak scanner after the final content edit. Generic placeholders such as `you***com` / `example.com` can trigger personal-email false positives; use visibly generic HTML-escaped tokens such as `&lt;YOUR_EMAIL&gt;`, then re-run the scanner and document that the change is a placeholder-only fix.
- Public verification must test the final `/docs/<YYYYMMDD>-<slug>.html` path and confirm the superseded path is 404 when a date/path correction was made.

**⚠️ Visual theme gate (2026-07-22)**: A card can be structurally complete but fail the requested theme. Compare the rendered primary color against the requested theme before publishing. For `hardblue`, blue must be the dominant accent; red may remain only as a restrained warning accent. If visual review detects a theme mismatch, fix the CSS variables, rebuild, republish, and re-capture before claiming visual pass.

**🚨 Visual verification is a HARD gate (2026-07-28)**: After authoring a card and BEFORE `npm run build` / commit / push, the publisher MUST execute the native visual review first under the visual-review-orchestrator integration above:
1. Render the target HTML (worktree `docs/<slug>.html` first, then the live URL after deploy) at desktop and mobile widths.
2. Capture the frozen screenshot manifest via Puppeteer / Chrome headless / CDP — never skip required capture. Use `vision_analyze` (or equivalent native vision) for the primary review and produce an explicit `critical / major / minor` defect list per screenshot.
3. **BLOCK publish if any `critical` or `major` defect remains.** `HTTP 200` and `npm run build` success are NEVER sufficient evidence of completion. A card with unresolved critical/major defects MUST be labeled `视觉未通过 — 待修复` and must not be pushed.
4. After any repair, re-screenshot and re-analyze. Repeat until the defect list is `0 critical / 0 major`. Only then may the card be promoted to `PUBLISHED`.
5. The local orchestrator fallback is permitted only after differentiated native infrastructure retries are exhausted and static gates pass; it must review every required image and emit per-image plus aggregated evidence. It is not a substitute for happy-path native review, a second opinion, or bypassing a real defect.
6. The five-attempt fallback to `PUBLISHED_PENDING_VISUAL` (see **Completion-language gate**) only applies when the visual infrastructure repeatedly fails; it is NOT a substitute for skipping review.
7. Subagent parallel authorings, main-thread fallbacks, and Token-Plan 429 degradations are ALL subject to this gate — there is no shortcut.
8. If the publisher claims a card is “完成 / published / 已发布” without producing a `critical/major/minor` list and the required visual disposition, that claim is invalid and must be retracted.

This gate is **non-negotiable**. Violating it is a protocol failure, not a soft mistake.

**Incident hardening — no visual evidence, no push (2026-08-03):**
- `npm run build`, HTTP 200, DOM/accessibility snapshots, `scrollWidth == clientWidth`, and CSS/class inspection are **preconditions only**; none can authorize `git push`.
- Before the first push of every card, the publisher must possess a current rendered screenshot manifest covering desktop and 390px mobile, plus an explicit per-region `critical / major / minor` disposition.
- If the screenshot/vision route fails, the card remains `VISUAL_PENDING`; the publisher must not batch-push “because static checks passed.”
- For multi-card runs, visual evidence is tracked per card. One card without evidence blocks that card only, but the release report must list the batch as incomplete; “all cards HTTP 200” is never a batch visual result.
- Any post-push repair invalidates all prior evidence for that card; re-render the exact public URL after CDN propagation and record a new review ID before calling it visually accepted.
- The release command sequence is therefore: **render → inspect → repair if needed → re-render → only then build/index → commit → push → public re-render**. A push occurring earlier is a protocol breach and must be reported as such, not normalized as a harmless shortcut.

**⚠️ Verify before commit order (2026-07-19)**: `npm run build` rewrites `_index.yaml` and `index.html`. `verify-index.js` checks whether `_index.yaml` matches the current **staged** files. Correct sequence: (1) `npm run build` (2) `git add _index.yaml index.html` (3) `node scripts/verify-index.js` (4) `git add docs/20260719-<slug>.*` (5) `git commit && git push`. Skipping step 2 causes "not in HEAD" errors; committing before staging causes wrong `_index.yaml` content.

**⚠️ Subagent parallel budget (2026-07-19)**: `max_concurrent_children=3` is a hard limit. For batches of 5+, split into rounds of ≤3 and wait for each round to complete before dispatching the next.

**Completion-language gate**: Final delivery must report evidence by layer: `build/static`, `public HTTP/index`, and `mobile visual`. Do not call a card or batch “全部完成” merely because build and HTTP checks passed. If required visual evidence has not passed, report `视觉待验` (or `PUBLISHED_PENDING_VISUAL` after the approved five-attempt fallback) and name the remaining gate explicitly.

**⚠️ Mid-run user steering / “go” discipline (2026-07-21)**: When the user says “go/继续” during an authorized publish, continue execution silently. Do **not** send progress narration such as “Step N/M” unless the user asked for status; avoid interpreting a confirmation as permission to explain the workflow again. If a large edit times out, split it into small, independently verifiable patches, then proceed directly to build → verify → commit → push → CDN recheck. A short acknowledgement is appropriate only when correcting a visible deviation; follow it immediately with the corrective action, not another plan.

**Disk maintenance**: Before any `git worktree add`, check `df -B1 /`. If < 1 GB free, load `references/infocard-disk-maintenance.md` and clean up before proceeding.

## Publication authorization and handoff boundary

When the user explicitly asks to create/publish information cards, or the active project convention defines card creation as a publish pipeline, publication is already authorized. Do not stop after authoring and ask for a second release confirmation unless the user explicitly requested drafts-only, preview-only, or a report.

**Scope fidelity is a hard gate:** “创作并发布信息卡” means authoring and releasing the requested card, not installing, initializing, or configuring the subject tool. Commands, setup snippets, API-key examples, and configuration files included *inside the card* are explanatory content, not host-action authorization. Do not run `npm install`, `npx <tool> init`, modify local agent configuration, or connect/use the subject tool unless separately authorized. A related or older card never satisfies a new request: match the exact user-provided topic/source and verify the new card’s own slug, source URL, public URL, index entry, and requested claims before reporting completion. For X-origin cards, the X post is a first-class source: preserve the status ID, display name, handle, visible timestamp, body, media, engagement snapshot, and every expanded link; do not replace it with a generic project summary.

## Progress communication and interrupted-run recovery

### Progress communication

默认不要把“子任务已启动”“正在等待”“计划下一步”当作用户交付。用户已授权发布时，安静推进；只在以下情况主动报告：

1. 最终完成（附产物、验收与链接）；
2. 出现真实阻塞，需要用户决策；
3. 用户明确要求固定频率或实时进度。

若用户明确要求“每 N 分钟报告”，可以创建临时、可关闭的进度任务；**先完成当前阻塞的修复，再创建报告任务**，不得以进度报告替代推进。发布完成、取消或用户要求停止时，立即关闭该临时任务。

### Interrupted-run recovery: explicit delivery constraints override normal release breadth

When asked to finish a previously timed-out or interrupted single-card run, first inspect the named worktree, baseline branch/HEAD, existing artifacts, and the user-provided local research checkout. Treat the named local source set as the evidence boundary unless the user authorizes further research.

If the user explicitly forbids network browsing, dependency installation, or push, do not expand the workflow to perform those actions. Create the requested HTML, sidecar metadata, and companion Markdown directly in the designated worktree; run lightweight deterministic checks (required claims, self-contained asset/CSS policy, artifact structure, and `git diff --check`) before staging and committing. If a build is optional and dependencies are unavailable or the user prioritizes committed artifacts, skip it and report that it was not run rather than blocking delivery. Always report the resulting commit SHA, branch status, checks performed, and skipped verification scope.

### Author timeout with no artifact: bounded re-author, then resume release

A timed-out delegated Author is not a completion signal. At the next recovery step, inspect the named worktree for the expected HTML, sidecar, Markdown, commit, and `git status`.

- If artifacts exist, validate and continue from them.
- If no usable artifacts exist, explicitly record `NO_ARTIFACTS`; do not let a later unrelated task make the card silently disappear.
- Re-dispatch one constrained recovery Author with the already downloaded fact pack. It must avoid broad browsing and dependency installation, write only the three declared files, run deterministic local checks, and create a local commit.
- The original user authorization remains valid: when the recovery commit arrives, the main thread must immediately own build/index, publish, CDN/public verification, and final reporting. Do not ask the user for a redundant release confirmation.


## Batch preflight: isolate ambient state before delegation

For an explicitly authorized multi-card batch, complete this **read-only preflight** before creating author tasks or a release worktree:

1. Record the primary repository branch, remote `main` SHA, and `git status --porcelain`.
2. Treat pre-existing tracked changes, untracked process directories, and unrelated card edits as **ambient state**. Do not reset, stash, add, or publish them without separate authorization. Preserve a status record or patch outside the repository so the candidate diff remains attributable.
3. Enumerate registered Git worktrees and free disk capacity. A batch needs a fresh isolated worktree plus build output and visual artifacts. Treat less than **1 GB** free space as `BLOCKED_AT_CAPACITY`: do not create more worktrees, install dependencies, or generate visual artifacts; request cleanup authorization. Do not delete stale worktrees merely to make room without authorization.
4. Fetch `origin/main` and use that exact fresh remote SHA as the batch base. Never create the publisher worktree from a dirty primary workspace.
5. Declare shared invariants in every v3 bundle: language, visible-source policy, prohibited terms/platform mentions, timezone/date policy, per-card depth/style mapping, `risk_class`, and required safety/claim boundaries. Parallel authors must not infer these from partial context.
6. Generate the canonical Protocol v3 bundle and run the repository bundle validator **before** dispatching an Author. The author receives only a validated, frozen bundle plus the corresponding Research A/B handoffs.
7. Allocate a unique `agent-browser --session <run-id>-<slug>` for each card before visual work. Record it in run-local evidence; do not reuse a session across cards or other tasks. When the user requests sequential publication, do not dispatch the next Author until the current card has reached terminal local, release, and public-verification state.
8. Before the first card-level content gate, create or validate the run-local facts fixture required by the live validator (for example `.tmp/infocard/<slug>/facts.json`). It must contain the exact hero identity, required semantic section labels, and claim-coverage inputs for that card. Do not weaken the validator by lowering coverage merely to pass; repair the card or the fixture to match the frozen research handoff.

**Pitfall:** clean commit history does not prove a clean release candidate. Ambient modifications and stale worktrees are independent batch risks; exclude them from the candidate scope and report them separately.

In delegated runs, distinguish responsibilities precisely: Author/agent2 may be prohibited from Git, index, Wiki, and external release operations, but that restriction does not constrain the main publisher. Once author artifacts arrive, the main thread must continue through the standard release chain: isolated worktree → metadata/structure normalization → build/index → local gates → visual disposition → commit/push → public verification → Wiki/closeout where required.

A batch of cards is one publication run, not a reason to pause. Preserve per-card artifact identity and sidecars, and do not reinterpret an author handoff as a new user-authorization boundary.

For performance, route batch work into two phases: parallelize independent research/authoring and non-mutating per-card checks; then use one publisher-owned worktree, one metadata normalization pass, one build/index pass, one consolidated diff audit, one commit, and one Pages polling loop. Do not run a full build, install dependencies, create a worktree, or poll Pages separately for each card.

### Stable batch authoring: `content.json` is the single authority

For multi-card batches, stability and predictable recovery take priority over maximizing concurrent HTML writers.

1. Each Author receives the frozen bundle plus a compact facts handoff, but **does not read the full theme HTML**.
2. Each Author writes exactly one run-local `content.json`; it does not write HTML, Markdown, sidecar metadata, generated indexes, or Git state.
3. The Author first persists a minimal schema-valid file, then enriches sections. A timeout therefore leaves an inspectable handoff instead of an all-or-nothing artifact.
4. The main thread is the only renderer. It deterministically combines `content.json + frozen bundle + registered theme` to create HTML, Markdown, sidecar metadata, and any declared manifest in the unique integration/publish worktree.
5. Final publication timestamps are generated only during the single integration build. Authors must not guess or hard-code release time.
6. On Author timeout, inspect `content.json`, schema validity, size, and mtime before taking over. Continue a valid file, minimally complete a partial valid file, and generate from scratch only when no usable file exists. Never let a timeout cause a second writer to recreate content already present.

Load `references/batch-content-json-authoring.md` for the schema, ownership table, recovery tree, and renderer contract.

If a subagent reports files in a temporary directory, the publisher owns the handoff: copy/normalize them into the isolated worktree, repair repository-required metadata (including `slug` and `<slug>.html.meta.yaml` naming), and continue. Report a blocker only when a real gate or external integration prevents release.

## Progress reporting is opt-in

Do not send routine progress updates during an authorized infocard run. Report only at a meaningful boundary, on a blocker requiring user input, or at final delivery.

If the user explicitly requests periodic updates mid-run:

1. **Do not drop the critical path to build reporting infrastructure.** The card authoring and publishing is the deliverable; a status reporter is not.
2. **Challenge first.** Offer a better trigger: "When should I report? On build success, on push, or on public URL confirmation?" Most progress-reporting requests are resolved by agreeing on one specific completion checkpoint.
3. **If the user insists on cadence**, set up a minimal script-only cron or background process — delivered to the current chat only — and cancel it the moment the run completes. Never let the reporting setup become a parallel task track.
4. **Never report process, only report outcomes.** "Subagent dispatched" and "build running" are not deliverables. "Card published at [URL]" is.

## 1. Open the run

1. Confirm the requested scope and whether Pages publication, push, and Wiki sync are authorized. Pages publication requires explicit authorization; Wiki is requested only when the task says so.
2. Create `/tmp/infocard-runs/<run-id>/<slug>/publish-bundle.json` with `schema_version: 3`.
3. Inspect the live target repository: root, branch, worktree status, `AGENTS.md`, package scripts, active validators, and registered styles. Record commands and compatibility requirements in the bundle.
4. Classify the route using the protocol before dispatching a child or writing card files.

Completion criterion: the bundle names the card, repository, requested delivery targets, and exactly one route.

## Social-source research boundary

When a card is based on social platforms such as Xiaohongshu, Reddit, X, or login-gated communities, treat the social page as a discovery surface unless the post body is directly readable and captured.

For complex implementation or configuration-guide cards, complete a bounded primary-source research phase before grill-me: collect the version baseline, configuration surfaces, parameter semantics, trade-offs, and unresolved evidence gaps first; then run at most three focused alignment rounds covering reader, depth, scope, and artifact shape. Do not author or publish before this alignment is complete.

For complex implementation or configuration-guide cards, complete a bounded primary-source research phase before grill-me: collect the version baseline, configuration surfaces, parameter semantics, trade-offs, and unresolved evidence gaps first; then run at most three focused alignment rounds covering reader, depth, scope, and artifact shape. Do not author or publish before this alignment is complete.

- Public search titles, snippets, counts, and recommendation labels are **discovery evidence**, not proof of the post's implementation details.
- Separate claims into: first-party/source-code facts, directly readable social-post facts, and community leads requiring corroboration.
- For implementation cards, promote the narrative center to the repository, README, official docs, package metadata, or source code; keep social discussion as context and provenance.
- Record the access boundary in the bundle and card copy when login, anti-bot, or partial rendering prevents full inspection. Never silently fill missing post content from the title.
- If a social platform is unavailable, continue with corroborating first-party sources when the user's goal is an implementation guide; do not fabricate platform-specific evidence or claim exhaustive coverage.

### User-requested source redaction

When the user explicitly says that a social platform is only a discovery/source surface and must not appear in the result, treat that as an artifact-level acceptance requirement, not merely a citation preference:

1. Keep the platform out of the HTML, Markdown report, metadata description, visible source labels, image captions, and generated index text unless the user explicitly authorizes an exception.
2. Replace discovery-only references with the underlying first-party source (official repository, documentation, paper, package registry, institutional notice, or directly readable original material).
3. Run a literal-name scan over all declared artifacts before build and again over the staged diff; scan common variants and translated names, not only URLs.
4. If a claim cannot survive without the platform post, downgrade or remove the claim rather than hiding the missing evidence.
5. Report the platform only in internal process notes or the run bundle when necessary for provenance; never leak it into the public card or report.

This boundary is distinct from ordinary social-source evidence handling: ordinary handling permits attributed discovery context, while explicit source-redaction requests prohibit it in public artifacts. See `references/source-redaction-acceptance.md` for the artifact scan and acceptance checklist.

Use `references/social-source-evidence-boundary.md` for the evidence matrix and wording patterns.

## 2. Build the bundle

### Light route

The main thread collects only the facts needed for one low-risk card, writes the `facts` section, then uses `any2card` to create the declared artifacts.

**HTTP 404 after push → debug path:**
1. Query `GET /repos/ccwq/infocard-pub/actions/workflows/pages.yml/runs?per_page=3` — if latest run is `failure`, inspect `jobs[].steps[]` for the failing step
2. Most common cause: `.meta.yaml` format error (see any2card's Meta YAML Format Gate) or local `npm run build` fails
3. Local fast diagnostic: `cd $PUB && npm run build` — read `verify-meta-timestamps.js` and `index-build-lib.js` output
4. After fixing meta.yaml: `git push --force origin HEAD:main`, wait 60s, recheck HTTP

### Full route

Use `delegated-infocard-publishing` for research-driven multi-card batches or complex fact-verification workflows. See `references/infocard-publish-protocol-v3.md` for the full routing rules and bundle schema.

### Light route: orchestrator writes directly

**Light route subagent budget = 0 unless explicitly justified.** Launch subagents only when: (a) multi-source cross-verification is required, (b) content needs domain-expert interpretation beyond orchestrator's context, or (c) user explicitly requested subagent pipeline.

Anti-pattern: orchestrator launches subagent Author → user gets impatient → orchestrator rewrites card anyway. When content is self-contained (user-provided text, single URL, single research result), orchestrator writes the card directly. Production evidence: 2026-07-26 LTX-2.3 card (subagent launched, user said "Go", orchestrator rewrote same turn subagent completed); immediately after, uTools vs ZTools card was published in one pass with no subagent delegation.

- Research A supplies first-party facts and the sole dynamic-data snapshot.
- Start Research B only when the protocol's risk trigger applies; it audits narrative boundaries without duplicating Research A.
- The main thread resolves evidence conflicts by source quality, completes the bundle, and calls `any2card`.

A Markdown note may explain the research to a human, but `publish-bundle.json` is the only handoff authority.

Completion criterion: facts, author requirements, artifact allowlist, requested gates, and expected public identity are complete and coherent in the bundle.

## Theme assignment: single decision rule and release gate

### Scope and precedence

This section is the **single source of truth** for selecting a registered infocard theme. `infocard-authoring-workflow` may carry only a short lookup that links here; other style notes must not introduce a competing default.

Selection order is mandatory:

1. classify the **content form**;
2. test the likely reader scenario and evidence/information density against the adjacent-theme exclusions;
3. choose the registered theme; user-specified theme overrides the automatic choice only when its HTML can meet that theme's implementation contract.

Do not select a theme merely because a title contains words such as “tool”, “AI”, or “technical”. `meta.yaml.style` is a declaration, never visual proof.

### Content-form decision table

| Content form | Primary theme | Adjacent-theme boundary |
|---|---|---|
| One technical tool, CLI, implementation/deployment manual, structured technical teardown | `hardblue` | Use `darkblue` when the center is system architecture or paradigm; use `redswiss` for a multi-tool comparison/catalog. |
| Multi-tool comparison, tool catalog, CLI ecosystem, resource collection | `redswiss` | Use `hardblue` when a single subject needs an executable manual. |
| AI architecture, Agent system, paradigm shift, developer workbench, methodological narrative | `darkblue` | Use `graph-paper` when nodes/dependencies/relations are the core object; use `hardblue` when step-by-step implementation is the core. |
| Code graph, knowledge network, dependency structure, relationship reasoning | `graph-paper` | Use `darkblue` for ordinary architecture explanation without a graph-first relationship model. |
| Security monitoring, server hardening, zero-trust operations | `darkgreen` | Use `hardblue` for an audit-method manual rather than a monitoring/operations context. |
| Technical tutorial, prompt engineering, knowledge note | `blue-technical-manual` or `white-purple` | Use `paper-warm` or `bigwhite` for reading-first long-form interpretation. |
| Investigation, controversy, conclusion-first risk argument | `black-head` | Use `hardblue` only when dense evidence and operational checklists dominate. |
| Hand-drawn reasoning, collaboration process, parallel scheduling | `handline` | — |
| Pixel/retro/game-like expression | `pixelstack` | — |
| No clear fit after the above test | `main` | Never fall back to `hardblue` solely because content is technical. |

### Required assignment record (new cards)

Before authoring HTML, persist this record in the frozen bundle or equivalent run-local authoring record. The final closeout must reproduce it:

```text
Content form:
Primary theme:
Alternative theme:
Rejection rationale:
Theme implementation check:
- meta.style:
- HTML data-theme:
- CSS token signature:
- structural signatures (at least two):
```

This is a **hard gate for new cards**. If the record is absent, or if the declared and implemented themes disagree, do not push and do not call the card complete.

### Batch concentration gate

For a batch of three or more cards, all cards using the same theme is blocked by default. A same-theme batch is permitted only when every card has the same content form, reader scenario, and evidence/information-density profile. Record the three-part basis and the exemption rationale in the bundle and closeout.

### Minimum mechanical checks; human boundary

The publisher must mechanically check: assignment-record completeness; canonical style naming; normalized agreement between `meta.yaml.style` and HTML `data-theme`; and presence of the target theme's token signature plus at least two structural signatures. New cards must set HTML `data-theme` to the registered bare slug (for example `hardblue`), while the sidecar uses canonical `infocard-hardblue-style`; comparison normalizes both to the same registered slug. The content-form classification and visual suitability remain human/Agent judgments; do not pretend an automated matcher can decide them. Script automation may be added later, but these checks are mandatory now.

## Pre-publish LLM Wiki duplicate gate

Before authoring or releasing a new card, query the current LLM Wiki read-only:

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
Before final delivery, perform a residue pass: stop temporary HTTP servers, remove only verified scratch files, run `node scripts/infocard-worktree.js list --repo <repo>` to report historical publish worktrees, and re-run `git status -sb` in both target repositories. Preserve intentional `.tmp` artifacts and all publish worktrees by default. Do not remove worktrees during ordinary closeout; prompt the user to reply exactly `del-rm` if they want the safe cleanup pass.

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
