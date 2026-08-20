---
name: infocard-publish-sop
description: "Use when creating or publishing an infocard: route low-risk single cards directly, coordinate bounded research for complex cards, and close the authorized release."
version: 3.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, publish, orchestration, verification]
    related_skills: [delegated-infocard-publishing, any2card, infocard-pub-publisher, visual-review-orchestrator]
---

# Infocard Publish SOP

## Purpose

The leading word is **route**. This is the sole entry for an infocard run and the medium orchestrator: it can directly handle a simple card, or coordinate bounded specialist handoffs for every other card. It owns the run state and the authorized release outcome; it does not own theme reconstruction or open-ended visual redesign.

Load `references/infocard-publish-protocol-v3.md` before selecting a route. It is the single source of truth for routes, bundle schema, retry budgets, worktree isolation, state names, audits, and v2 migration.

For social post extraction (X/Twitter, 小红书), also load `references/social-post-extraction.md`.

## Critical Gate — meta.yaml `date` / `updated` must be publish timestamp (2026-07-28 lesson)

**Subagents must NOT use the source content's original publish date for `date` / `updated`** — those fields drive `_sort_ts` in `_index.yaml`, which determines the homepage order. Wrong date → new cards sink below older same-day cards.

**Rule**:
1. Subagent sets `date` / `updated` to **write-time UTC** (`YYYY-MM-DD HH:MM:SS`).
2. **Orchestrator overrides both to merge-time UTC** before `npm run build` (atomic step, mandatory).
3. Verify by `curl https://ccwq.github.io/infocard-pub/_index.yaml | grep <slug>` → `date` should be within 1 hour of push time.

**Helper (run before `npm run build` in the orchestrator):**
```bash
NOW="$(date -u +"%Y-%m-%d %H:%M:%S")"
for meta in docs/YYYYMMDD-*.meta.yaml; do
  sed -i "s/^date:.*/date: \"$NOW\"/; s/^updated:.*/updated: \"$NOW\"/" "$meta"
done
```

**Also mandatory**: before merging, run `git fetch origin main && git diff --stat origin/main` — local main must equal origin main to avoid silent drift that invalidates the push. If diverged, `git reset --hard origin/main` first.

See `references/meta-date-publish-timestamp.md` for the full pitfall write-up.

## Orchestrator Command Safety Rule

The orchestrator's terminal calls are subject to a **command timeout gate** (~20s wall-clock for long operations). Commands that combine subshell expansions (`$(...)`), heredocs, loops, or piped multi-step logic in one call get blocked with no retry.

**Rule: atomic, single-purpose calls.** Each terminal invocation should do exactly one thing:

| ✅ Good | ❌ Bad |
|---|---|
| `mkdir -p "$WT"` | `mkdir -p "$WT" && cat > bundle.json <<'BUNDLE'...` |
| `python3 - "$OUT" <<'PY'...` | `for u in "${urls[@]}"; do ...; done` in same call |
| `git fetch origin main --quiet` | Combined fetch + branch create + worktree add in one |

**Subagents bypass this gate.** Complex multi-step work belongs in `delegate_task` calls, not orchestrator terminal scripts. If you need 5 steps in sequence, make 5 separate terminal calls.

**node_modules check first.** Many repos' build scripts use only Node.js built-ins (`child_process`, `path`, `fs`). Before creating `node_modules` symlinks in a worktree, verify the scripts actually need external packages. This avoids unnecessary symlink overhead and is project-specific — check per run.

**Light-route shortcut** (single URL, no complex research): load `references/light-route-url-driven-pattern.md` instead — it covers worktree setup, inline fact extraction, parallel Authoring delegation, and batch build→verify→commit→push→public-verification in one pass.

**Update existing card** (add new sections to an already-published card): load `references/infocard-update-existing-card-pattern.md` — covers the two-commit pattern (content commit → audit commit), HTML surgery (section renumbering), release_audit fields for updates, and research requirements for patched content.

**Direct-write to existing integration worktree** (no subagent, no build, no push, no install): load `references/direct-write-integration-pattern.md` — used when user provides an existing worktree path and explicitly says "不要 git/build/push/安装". Main thread writes all three files (HTML + meta + audit) directly without triggering build pipeline.

**Update existing card — mobile CSS pitfall**: When patching an already-published card with new sections, watch for `.scenario-grid` / `.arch-grid` / `.install-grid` / `.lsp-grid` class names that appear in HTML but are missing from the `<style>` block. Load `references/update-mobile-css-grid-pitfall.md` for diagnosis commands and standard 3-step fix before committing.

**Batch Topic-Card Lessons (2026-07-23)**: For X-driven multi-card batches, read `references/batch-topic-card-lessons-20260723.md` before authoring. It covers primary-source thresholds for quantitative/causal/safety claims, claim-class separation, one-worktree batch generation, date/path consistency, screenshot-led hardblue acceptance, leak-scanner-safe placeholders, and late research handoff handling.


**Required reading before any HTML publish**: `references/github-pages-asset-path.md` (prevents `../assets/img/...` 404 on GitHub Pages).

**meta.yaml pitfall (2026-07-22 + 2026-07-25)**:
- `desc` MUST be before `title` in the YAML file. If fields are reordered, build fails with `"missing fields desc"` even though both fields exist.
- index-build-lib 必填字段：`slug/path/category/title/date/tags/desc`，缺一不可。其中 `category` 必须是中文分类名（如"舆情调查"/"调查核查"），`path` 必须是完整相对路径（如 `docs/YYYYMMDD-slug.html`）。
- Build 失败时优先本地运行 `npm run build` 诊断，而非等待 GitHub Actions。完整格式规范见 `references/2026-07-25-meta-yaml-format-guide.md`。

**Theme application gate (2026-07-25 correction)**:
- `meta.yaml.style` is a declaration, not proof that the theme was applied. Before authoring, load the selected `infocard-*-style` skill and read the matching `theme/*.html` demo.
- Do not reuse a recent card's embedded CSS and merely change copy or colors. Rebuild the HTML around the target theme's actual layout skeleton, tokens, and signature components.
- For a single open-source tool / template card, prefer `hardblue` unless the content is genuinely a multi-tool comparison or CLI ecosystem map; `redswiss` is not the default for every tool card.
- Before publish, inspect the generated `:root` tokens and at least two structural signatures (for hardblue: 42px grid background, 3px black borders, red/blue/black `hero-bar`, numbered blocks or equivalent hard-edged modules). If the signature is absent, stop and rebuild.
- Report the selected theme, loaded style skill, and token/component verification in the closeout. See `references/theme-application-correction-20260725.md`.

**Preflight details (2026-07-25)**: Read `references/publish-preflight-20260725.md` before authoring. It covers HTML-tail residue, date-prefixed slug/path matching, build timestamp rewrites, exact public verification, and theme-declaration versus theme-implementation checks.

**Pitfalls**: `references/pitfalls-20260719.md`, `references/pitfalls-20260722.md`, `references/pitfalls-20260723.md`, `references/pitfalls-20260724.md`, `references/pitfalls-20260728.md` (meta.yaml multi-doc 4 触发形态 / 子智能体 429 降级 / theme 模板克隆流程 / write_file 末尾换行 / `git branch -D` approval gate), `references/disk-cleanup-and-github-api-fallback-20260723.md`, and `references/theme-rebuild-pitfalls-20260723.md` (worktree add misleading error + PR merge timing + theme-rebuild requirements).

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

**⚠️ Worktree cleanup requires registered worktree (2026-07-22)**: The SOP's `git worktree remove` step silently skips when the directory was created via `git clone` or `cp -r` instead of `git worktree add`. Six orphaned worktree directories (~1.7 GB) accumulated in `/tmp/infocard` despite cleanup running. **Prevention**: always create worktrees with `git worktree add` so `git worktree remove` finds the entry. **Detection** (at cleanup gate): after `git worktree remove`, run `find /tmp/infocard -maxdepth 2 -name ".git" -o -name "AGENTS.md" -o -name "package.json" | head -10` to detect plain-clone orphans that `git worktree list` missed. If found, `rm -rf <path>` them explicitly and log as "orphan clone cleanup". **Always verify** `du -sh /tmp/infocard` after any cleanup run — empty output ≠ clean; the command must return the post-cleanup byte count.

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
npm run check-wiki-duplicate -- --slug=<slug> --title="<title>" --source-url="<source_url>" --json
```

The script checks canonical slug, public infocard URL, source URL, exact title, and title-overlap candidates. Treat the result as a candidate finder, not an automatic semantic verdict:

- `no_match`: continue authoring.
- `candidate_review`: pause and ask the user whether to publish a new card or update/improve the existing Wiki/card entry.
- `exact_or_duplicate`: pause and ask the user whether to publish a new card or update/improve the existing Wiki/card entry.

This pause is a user-facing decision gate, not a silent default. Use exactly two choices: “发新卡” or “更新/提升旧卡”；do not choose on the user's behalf.

Do not silently create a second card, overwrite a raw source, merge historical versions, or delete duplicates. Record the query result and the user's decision in the run bundle/closeout. If the user chooses “update/improve”, route through the existing-card update workflow; if the user chooses “new card”, keep the new canonical slug and link the relationship explicitly.

This gate is read-only and must run against the current Wiki path before the card is authored. It is separate from Wiki backfill coverage: missing Wiki coverage does not authorize skipping the duplicate query. A published card's Wiki closeout must report the canonical raw match, any required knowledge-page decision, `index.md`, `log.md`, and remote verification separately.

## 3. Gate the card

1. `any2card` creates only the declared HTML, sidecar, and asset manifest.
2. Run the required local gates from the protocol. Use the repository's actual commands and add specialist gates only when the card type triggers them.
3. A local structure or content failure gets one targeted repair and one full rerun. A second failure becomes `BLOCKED_AT_LOCAL_GATE`.
4. Run the native visual review before the publisher begins, following the visual-review-orchestrator integration gate above. Only an exhausted, confirmed native-infrastructure failure with green static gates may enter the local `visual-review-orchestrator`; do not call third-party `chatgpt-web-skill` directly. A valid result containing `critical` or `major` becomes `VISUAL_BLOCKED`.

Completion criterion: the bundle has green required local gates plus one current visual disposition: `VISUAL_PASSED`, `VISUAL_PENDING`, or `VISUAL_BLOCKED`, with per-image evidence and (when fallback was used) explicit chat cleanup state.

## CDP visual-review discipline (user-specific hard rule)

Load `browser-core` before any existing-Chrome/CDP review. Its Tab ownership and lifecycle contract is authoritative: each card review records a run-scoped browser session, browser epoch, owned preview target IDs, and a per-card cleanup result. `tab_cleanup` is separate from `visual_status` and ChatGPT cleanup: `CLEAN` / `CLEAN_NO_OWNED_TABS` permits clean closeout; `PARTIAL_ORPHANED`, `CLEANUP_UNREACHABLE`, `SKIPPED_EPOCH_CHANGED`, `OWNERSHIP_UNCERTAIN`, or `INTERNAL_AUDIT_FAILED` must be reported as cleanup residue and prevents claiming the run is fully closed. A cleanup exception never converts a visual result into a different visual result and must not cause a repeat push.

This SOP does not call ChatGPT Web or the third-party skill directly. Browser/session creation, single-image upload, capability probing, evidence handling, and cleanup belong to `visual-review-orchestrator`. If the orchestrator delegates browser work to `agent-browser`, every invocation **must explicitly include `--cdp 9222`**. Reuse the existing Chrome CDP session and authenticated/browser state; never let `agent-browser` silently start or use an isolated browser session.

Before opening a card preview:

1. Create the run-scoped named session specified by `browser-core`, capture the CDP browser epoch, and record the tab baseline.
2. Create a dedicated preview target; immediately record its exact `(browser_epoch, targetId)` as `OWNED_EXPLICIT`. Do not replace or navigate an unrelated user tab.
3. Before every capture, follow `browser-core`’s Screenshot preflight and recovery gate: confirm HTTP `200` where applicable, then record the exact target’s URL, title, and readyState. A mismatch or title `Error` is `TARGET_INVALID`, not visual evidence.
4. Keep the same `--session`, `--cdp 9222`, and `--pin-tab` flags on every review command, including `set viewport`, `eval`, and `screenshot`. Capture the viewport/required region first; attempt full-page capture only when it is required.
5. For mobile, record `document.documentElement.scrollWidth` and `clientWidth`; equality is mechanical evidence against page-level horizontal overflow, not visual PASS.
6. If `Page.captureScreenshot` times out while page evaluation works, apply the browser-core `SCREENSHOT_TIMEOUT` diagnosis (target identity, dimensions, targets, Chrome resources), then retry one fresh owned target’s viewport capture. Never repeat blind full-page captures or upgrade static evidence to visual PASS.
7. In success, failure, cancellation, or timeout, apply `browser-core` cleanup: close only owned preview targets, then re-enumerate the same browser epoch to confirm their exact target IDs are absent. If identity or ownership is uncertain, preserve the tab and report the resulting `tab_cleanup` residue.

If native visual infrastructure is unavailable after the protocol's differentiated infrastructure-only attempts, retain the screenshots and record `VISUAL_PENDING`; only after the retry budget is exhausted and static gates pass may the SOP ask `visual-review-orchestrator` to run its own fallback. If that fallback is unavailable or incompatible, retain `VISUAL_PENDING`; do not infer visual success from screenshots, DOM checks, or overflow metrics.

## 4. Publish and audit

1. If visual is blocked, stop and report the evidence.
2. If the local pre-publish review passed (native or orchestrator fallback), call `infocard-pub-publisher` with the frozen bundle. After push, confirm the exact public HTML and index content before requesting the orchestrator's fresh `post_publish` public re-review; visual status and Pages status remain separate.
3. The preceding step is the only non-blocked path; if pre-publish visual is `VISUAL_PENDING`, use the explicitly authorized `PUBLISHED_PENDING_VISUAL` fallback below or stop and report pending evidence. Do not publish as visually passed. The publisher creates the isolated worktree, builds, commits, pushes, and verifies public HTML, index, and identity text. If an author worktree already has a committed card plus generated `_index.yaml` / `index.html`, first rebase that author branch onto latest `origin/main`; do not blindly cherry-pick into a stale publisher worktree. If integration still conflicts, create a fresh worktree from current `origin/main`, copy only declared card artifacts, regenerate index through the repository build, then commit.
4. If all five visual attempts failed only because of infrastructure and every other Pages gate is green, publish as `PUBLISHED_PENDING_VISUAL`. This is never visual PASS.
5. After Pages verification, the publisher makes the audit-only sidecar commit required by the protocol. If Wiki was requested, run it as a separate state machine after Pages; Wiki failure never rolls back Pages.

6. **线上地址截图自证与交付（硬门禁）**：当 Pages/public verification 已通过且本次发布状态为 `PUBLISHED`（或用户明确要求交付线上证据）时，必须对**最终线上 URL**重新打开并截图，不能用本地预览、旧截图或仅凭 HTTP 200 代替。截图必须带 cache-busting 参数，并覆盖实际发布页面的首屏；若本卡触发移动端视觉审查，还必须额外截取 390×844 移动端线上截图。截图完成后：
   - 用 DOM/页面身份核对确认截图对应目标 slug、标题和当前版本；
   - 将截图保存为真实可访问的本地 PNG 文件（不要把浏览器 supervisor 的虚拟路径当作交付路径）；
   - 在最终报告中发送 `MEDIA:/absolute/path/to/public-card-screenshot.png`，并注明这是线上 URL 截图；
   - 桌面/移动截图分别记录 viewport、cache-bust、截图路径和 `critical/major/minor` 视觉结论；
   - 任何线上截图失败、页面身份不符或视觉结论未完成，都必须报告 `VISUAL_PENDING`，不得声称“发布并验证完成”。

Completion criterion: the bundle records terminal Pages and Wiki states, relevant commit IDs, public evidence, and the delivered online-URL screenshot path(s).

## Repeat-topic default: update/improve existing card

When a new source overlaps an existing infocard by subject, repository, project, or recurring series, the default route is **update/improve the existing card**, not create a duplicate. Do not pause for a “new card vs update” question unless the user explicitly requests a new card or the overlap is genuinely ambiguous after checking the existing card.

For an update/improvement run:

1. Identify the canonical existing card and preserve its public slug/path unless a path correction is required.
2. Reuse the existing card's evidence boundary and theme where appropriate; do not silently replace the card with an unrelated new artifact.
3. Add only claims supported by the new source and current first-party verification. Preserve prior claims unless they are stale, contradicted, or explicitly revised.
4. At the **end of the updated card**, append a visible section titled `变更说明` or `本次更新`.
5. The change section must state:
   - 更新日期（publish/update timestamp）；
   - 本次新增、修正或删除的内容；
   - 触发更新的来源与链接；
   - 仍未核实、暂不纳入或被降级的内容（如有）；
   - 如适用，旧版本与本次版本的边界。
6. The change section is part of the card's public content and must be included in visual review, mobile review, build/index generation, and post-publish verification.
7. Record the update decision and change-section summary in the publish bundle and closeout. Do not describe an update as a new-card publication.

Example ending:

```html
<section class="change-log" aria-labelledby="change-log-title">
  <p class="eyebrow">CHANGELOG</p>
  <h2 id="change-log-title">变更说明</h2>
  <p><strong>更新日期：</strong>2026-08-18</p>
  <ul>
    <li>新增：……</li>
    <li>修正：……</li>
    <li>来源：<a href="…">……</a></li>
    <li>未核实：……</li>
  </ul>
</section>
```

This rule supersedes the ordinary duplicate-decision pause for future infocard runs unless the user explicitly overrides it.

## 5. Closeout, report, learning closure

Before closing, apply `references/execution-lessons-priority.md`. Its P1 items are hard release gates, P2 items are default execution strategy, and P3 items are scenario-triggered checks. In particular: inspect timed-out worktrees before redelegation; integrate multi-card source artifacts by allowlist into one fresh publish worktree instead of cherry-picking generated indexes; audit build spillover before staging; require new public content rather than HTTP 200 alone; treat mechanical DOM checks as insufficient for visual PASS.

Report result first:

```text
| card | route | Pages | visual | Wiki | content commit | audit commit | public URL |
```

Then state only the terminal exception, if any: blocked local gate, blocked integration, failed Pages verification, pending visual evidence, or failed Wiki sync. Never call `PUBLISHED_PENDING_VISUAL` a fully verified visual release.

For a high-value investigation or public-opinion card, treat Wiki as part of the requested deliverable when the user asks for a report, archive, knowledge-base sync, or “调查报告”. Do not report Wiki completion until all four are verified: `raw/articles/<date>-infocard-<slug>.md`, `entities/<entity>.md`, `index.md` entry, and `log.md` entry; then commit, push, and re-check the Wiki remote. Pages success does not imply Wiki success.

Before final delivery, perform a residue pass: stop temporary HTTP servers, remove only verified scratch files and obsolete publish worktrees, and re-run `git status -sb` in both target repositories. Preserve intentional `.tmp` artifacts; never delete unrelated existing work.

If a build mutates timestamps or index files, inspect the diff before committing. If a repository-wide taxonomy fixer fails or rewrites unrelated legacy metadata, restore unrelated changes and use the smallest card-scoped gate instead of committing the spillover.

When public visual capture is unavailable, record `VISUAL_PENDING` or `PUBLISHED_PENDING_VISUAL` with the exact reason. Do not upgrade static checks or a successful HTTP response into visual PASS.

After closing an information-card run, identify any high-value reusable lesson that can make future cards faster, cheaper, more visually effective, or more factually useful. The user may explicitly request skill-library updates; when they do, patch the governing class skill immediately and put session-specific commands or evidence in a `references/` file. Routine completion logs and transient environment failures are not learning candidates.

## Author-subagent meta.yaml normalization (critical — 2026-07-18)

Subagents in the author stage write meta.yaml with a **nested `identity:` wrapper** and wrong field names (`card_slug` vs `slug`). Build scripts read flat top-level fields only. Without normalization the build fails: `"missing fields category, title, tags, desc"`.

### What subagents write (WRONG)
```yaml
schema_version: 1
card_slug: 20260718-my-card        # ← wrong field name
style: infocard-hardblue-style

identity:                           # ← subagent writes this wrapper
  title: "My Card Title"            # ← nested; build scripts ignore it
  tags: [Tag1, Tag2]
```

### What build scripts require (CORRECT — flat top-level shape)
```yaml
slug: my-card                       # ← lowercase kebab, no YYYYMMDD- prefix
path: docs/20260718-my-card.html    # ← full relative path
category: knowledge                 # ← required, non-empty
title: "My Card Title"              # ← top-level
date: "2026-07-18 18:32:15"        # ← bare clock value, quoted
updated: "2026-07-18 18:32:15"
desc: "One-sentence description."   # ← required, non-empty
tags:
  - Tag1
  - Tag2
style: infocard-hardblue-style
source: x-post
source_url: "https://..."
author: "DisplayName (@handle)"
```

### Normalization checklist (apply before copying into worktree)

1. Extract `slug` from `card_slug` — strip leading `YYYYMMDD-` date prefix, convert to lowercase kebab.
2. Add required top-level fields: `category`, `desc`, `path`.
3. Move `identity.title` → top-level `title`; `identity.tags` → top-level `tags`.
4. Strip the `identity:` wrapper block from the file.
5. Keep extended blocks (`sources`, `verification_status`, `asset_references`) if present — the index build ignores them.

Safe pass-through fields: `schema_version`, `style`, `date`, `updated`, `tags`, `author`, `source`, `source_url`, `x_author`, `x_handle`, `x_status_id`, `taxonomy`.

See `references/infocard-meta-yaml-schema.md` for canonical schema.

## Model recommendation card framework gate（用户确认，2026-07-26）

当信息卡主题属于**大模型推荐 / 本地部署模型 / 模型对比 / 本地 Agent 模型选型**时，不能按普通工具卡压缩成“简介 + 安装命令”。必须在 authoring 前经过一次有限轮次的 grill-me 对齐，并把以下约束写入冻结 bundle；默认产出为**单张高密度主卡**，完整覆盖选型、部署、性能与评价，不能用空泛摘要替代执行细节。

### 已确认的默认受众

三类读者同时覆盖，但内容优先级固定为：

1. 本地 Agent、代码辅助用户：需要可执行的模型选择和 Windows/Linux 部署流程；
2. 已有 LM Studio / 本地推理经验的开发者：需要量化、显存、吞吐量和调优边界；
3. 从云 API 迁移的普通技术用户：需要成本、隐私、门槛和失败恢复说明。

### 默认卡片形态

单张高密度卡，部署步骤、性能、评价和对比压缩为可读模块；必要时使用折叠区、附录或分栏，但不得删除关键字段。若内容规模超出单卡可读范围，再由主线程提出拆卡，而不是静默删减 Windows/Linux、吞吐量或社区评价。

### 必填内容骨架

1. **一句话结论**：适合谁、不适合谁、推荐等级与主要取舍；
2. **模型身份**：模型主页、官方仓库、Hugging Face / ModelScope 页面（如存在）、发布组织、许可证、版本/发布日期、参数规模；
3. **架构与训练信息**：基座、微调/蒸馏方式、上下文长度、模态、工具调用/代码/Agent 能力；未经一手来源确认的训练来源必须标为“资料声称”或“未核验”；
4. **硬件与量化矩阵**：参数规模、FP16/BF16/各量化级别文件大小、最低/建议显存、CPU/RAM、GPU/CPU/Metal/ROCm/CUDA 适配；必须说明上下文增长、KV cache、批量并发对显存的影响；
5. **吞吐量数据**：tokens/s、首 token 延迟、上下文处理速度、并发/批量吞吐（如有）；每个数字必须绑定硬件、后端、量化、上下文长度、batch/concurrency、测试工具和来源。没有可比条件时不得拼接成排名，写“不可直接横比”；
6. **Windows 部署流程**：优先列 LM Studio / llama.cpp / Ollama / vLLM（按模型格式和硬件适配选择），给出安装、模型下载、量化选择、GPU offload、上下文设置、启动 API、健康检查和常见错误恢复；命令必须可执行，路径和 PowerShell/CMD 差异要标明；
7. **Linux 部署流程**：区分 NVIDIA CUDA、AMD ROCm、CPU/llama.cpp、Docker/原生运行，给出驱动/运行时前置检查、模型下载、启动参数、OpenAI-compatible API、systemd 或后台运行建议、日志与显存排查；不在主机上执行这些命令，卡内命令仅作说明；
8. **工具选择建议**：LM Studio 适合桌面 GUI 与快速验证；llama.cpp 适合可控、轻量、本地服务；Ollama 适合低门槛 API；vLLM 适合 Linux/NVIDIA 高吞吐服务。不得把工具能力写成模型能力；
9. **横向对比**：至少选择 2–4 个同类模型，固定比较维度：质量/任务适配、代码与 Agent、中文/多语、速度、显存、量化生态、部署难度、许可证与隐私；明确“同硬件/同量化/同上下文”条件，否则只做定性对比；
10. **跨平台评价**：至少收集官方/模型主页、Hugging Face 或 ModelScope、GitHub Issues/Discussions，以及 Reddit、X、知乎、小红书等社区体验。社区内容只能作为体验反馈、安装踩坑或线索，不得直接升级为事实或性能结论；
11. **成本与风险**：云 API 成本只是动机之一，必须同时说明电力、硬件折旧、维护、更新、模型许可、隐私边界、量化损失、长上下文 OOM、驱动兼容和模型来源风险；
12. **最终决策表**：按“显存/系统/用途/可接受维护成本”给出推荐路径，并保留“不推荐使用”的条件；
13. **来源与更新时间**：正文或来源区标出每个关键数字的来源和抓取/测试日期，模型主页不能只写搜索结果页。

### 证据分层（强制）

- **L1 官方事实**：模型主页、官方仓库、官方文档、许可证、正式发布说明；
- **L2 可复现实测**：明确硬件、软件版本、量化、上下文和命令的实测；
- **L3 社区体验**：GitHub Issues/Discussions、Reddit、X、知乎、小红书等用户反馈，必须标注平台、时间、原文链接或可核验定位；
- **L4 未证实说法**：只能列为待核验线索，不能进入 hero 结论、推荐等级、吞吐排名或安全结论。

吞吐量、显存、模型大小、版本和兼容性字段默认至少需要 L1 或 L2；L3 只能补充真实体验与踩坑。若来源冲突，保留冲突并解释条件，不用平均值消除差异。

### Research handoff / bundle 要求

模型推荐卡的 bundle 必须增加并冻结：`model_identity`、`official_homepage`、`repository_url`、`model_hub_urls`、`license`、`parameter_count`、`context_length`、`quantization_matrix`、`hardware_matrix`、`throughput_records`、`comparison_set`、`windows_flow`、`linux_flow`、`community_evidence`、`evidence_levels`、`retrieved_at`、`unknowns` 和 `claim_boundaries`。每个吞吐量记录至少包含：`value`、`unit`、`hardware`、`backend`、`quantization`、`context`、`batch_or_concurrency`、`source_url`、`retrieved_at`。

### Grill-me 固化规则

对模型推荐卡最多进行 3 个关键问题的对齐，优先锁定：受众 → 单卡/拆卡深度 → 证据标准。用户已确认默认答案为：三类受众覆盖但以部署与选型为主；单张高密度卡；官方资料 + Hugging Face/ModelScope + GitHub Issues/Discussions + Reddit/X/知乎/小红书。后续同类卡可以直接采用该默认值，除非用户明确覆盖。

### 发布前硬门禁

- 没有模型主页、参数规模、模型大小或许可证：不得称为“完整模型推荐卡”；
- 没有 Windows 和 Linux 至少一条可执行流程：不得称为“部署指南”；
- 吞吐量没有测试条件：不得写成排名或横向结论；
- 社区评价未标平台、日期、链接和证据等级：只能删除，不能写入结论；
- 只有用户提供的模型资料而没有外部核验时，卡片必须明确“用户资料版 / 待核验”，不能伪装成评测报告；
- 大模型推荐卡触发 `visual_review`：量化矩阵、对比表、部署命令和长代码块必须有移动端可读替代结构，5 列以上表格必须提供卡片化或纵向堆叠版本。


- Never install dependencies in a worktree.
- Never stage files outside the bundle allowlist and generated index artifacts.
- Never force-push, repair another worktree, or turn `VISUAL_PENDING` into visual evidence after the fact.

For detached HEAD push patterns and parallel worktree rebase conflicts, see `references/publish-worktree-git-patterns.md`.
- Never start Wiki automatically; it must be requested by the task.

## References

- `references/infocard-publish-protocol-v3.md` — authoritative v3 protocol and migration boundary
- `references/validator-compatibility.md` — use when live repository validators differ from v3 fields
- `references/repository-discovery.md` — use before a route is selected
- `references/visual-infrastructure-failure.md` — use only for capture/runner failures
- `references/visual-screenshot-misdelivery.md` — use when `browser_vision` returns a screenshot of the wrong page despite correct DOM evidence (clientWidth=390, correct accessibility tree); DOM+structure gates pass but vision model routes to unrelated interface; record `VISUAL_PENDING`, do not claim visual pass
- `references/integration-recovery.md` — use when `origin/main` advances before push; includes new-file-first rebase pattern, stash-before-rebase, and worktree git remote correction (2026-07-19)
- `references/mobile-responsive-css-patterns-20260719.md` — 移动端响应式 CSS 修复：第一轮失败原因、正确 flex/grid 覆盖模板、验证信号
- `references/zed-official-docs-research-20260717.md` — GitHub raw docs调研：新兴开源工具默认优先官方文档路径，附文件索引和curl命令模板
-`references/audit-sidecar-gate.md`use after Pages verification, before audit-only commit
-`references/protocol-v3-first-release-lessons.md`first live v3 release: build-mutated timestamps audit-SHA boundary
- `references/execution-lessons-priority.md` — real-task lessons ranked as P1 hard gates, P2 defaults, and P3 scenario checks
- `references/batch-content-json-authoring.md` — multi-card Author `content.json` schema, deterministic renderer ownership, timeout recovery, and single-worktree integration contract
- `references/x-to-github-identity-boundary.md` — how to use X as a candidate source without confusing it for canonical GitHub identity
- `references/x-status-id-leak-false-positive.md` — how to keep X provenance while avoiding leak-scanner false positives from long numeric status IDs
- `references/sequential-publish-lessons-20260718.md` — 5 卡并行发布节奏：worktree 创建、3+2 Authoring 并发（受 max_concurrent_children=3 限制）、串行 build→push、visual gate、冲突解决与清理（2026-07-19 实操验证）
- `references/worktree-gitlink-pollution-recovery.md` — `git add <worktree-dir>` 在非 worktree 宿主仓库内创建 160000 gitlink，污染 origin/main 的完整恢复路径（2026-07-24 实操验证）
- `references/parallel-batch-pr-conflict-recovery.md` — 两个并行 worktree PR 冲突恢复：rebase + Python 重建 _index.yaml/index.html + GitHub REST API 合并 PR（2026-07-22 实操验证）
- `references/detached-head-commit-recovery.md` — 子智能体 commit 到 detached HEAD 后主线程看不到 commit 的恢复方法：`git log --all --oneline` + `git branch -a` + 命名分支创建
- `references/pitfalls-20260722.md` — 本次 session 新增陷阱：detached HEAD 不可见、GitHub merge 422、worktree node_modules cleanup、rebase --theirs + amend 错误
- `references/pitfalls-20260723.md` — 两提交 audit 流程使索引失效、vision_analyze 误路由、无 node_modules 仍可 build、verify-card-content 不是卡片门禁
- `references/batch-authoring-orchestrator-pattern.md` — 批量 Authoring 正确模式：**theme 由主线程注入**，子智能体只填充内容；worktree detached HEAD push 异常；verify-index.js 依赖 HEAD 而非 index 的正确序列；subagent 超时后产物检查流程
- `references/build-verify-commit-order-20260719.md` — build→verify→commit 正确顺序（先 stage `_index.yaml` 再 verify）和 worktree detached HEAD push 陷阱（2026-07-19 实操教训）
- `references/x-source-card-session-20260718.md` — X 原帖来源卡的事实抽取、作者保真、链接/媒体处理与版本/路线图边界
- `references/local-worktree-hard-gate-20260718.md` — absolute worktree、严格 sidecar、解析公开索引、pre-CDN 判定与受保护清理的可执行门禁
- `references/bundle-to-authorstage-pattern.md` — frozen bundle + research-a/b + outline → 独立 author-stage 目录（零 Git/零 push）；触发信号、主题模板路径（publish-worktree/theme/）、来源文件字段速查、常见陷阱（路线图写成上线功能、截断链接直接引用等）
