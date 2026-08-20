---
name: infocard-pub-publisher
description: Use when an authorized Protocol v3 infocard bundle is ready for isolated build, release, public verification, and audit.
version: 3.0.0
---

# Infocard Pub Publisher

## Purpose

The leading word is **isolation**. This skill turns a frozen Protocol v3 bundle into a release without touching another card's workspace. It does not research, author card content, select themes, or manage subagents.

Load `infocard-publish-sop/references/infocard-publish-protocol-v3.md` before any Git write.

## 1. Create the isolated release workspace

### Git environment preflight

Before any Git read or write, inspect `env | grep '^GIT_' || true`. A persisted `GIT_INDEX_FILE`, `GIT_DIR`, `GIT_WORK_TREE`, or `GIT_ALTERNATE_OBJECT_DIRECTORIES` may redirect this run to another task's index/object store and create false missing-object failures.

For release commands, use a controlled environment, for example:
```bash
env -u GIT_INDEX_FILE -u GIT_DIR -u GIT_WORK_TREE -u GIT_ALTERNATE_OBJECT_DIRECTORIES git -C "$WORKTREE" status --short --branch
```
Run `git fsck --full --no-reflogs` in that controlled environment before staging. If it passes there, treat any failure under the inherited shell as environment contamination, not repository corruption. Do not repair or mutate the primary checkout; continue from a clean clone/worktree with the controlled environment.

1. Fetch `origin/main`; create one branch and one worktree for the candidate card from the fresh remote base. The worktree path must come from `node scripts/infocard-worktree.js resolve --run-id <run-id> --slug <slug>` and therefore live under the cross-platform fixed `os.tmpdir()/infocard-worktree` root. Do not create repo-local `wt-*`, `/tmp/infocard-*`, clones, or copied repos for new publish runs.
2. If live repository commands need local Node dependencies, symlink validated primary-repository `node_modules` into the worktree. If no local dependencies are needed, record that in the bundle. Never install Node dependencies in the worktree.
3. Confirm that the frozen bundle artifact allowlist exists in the worktree and that no process artifact is included.

Completion criterion: one candidate worktree contains only the declared release scope and either the required reusable dependency symlink or a recorded `local_dependencies: none` exemption.

## Batch handoff and artifact normalization

For an explicitly authorized multi-card publication, treat all returned author artifacts as one publisher-owned batch. Do not ask for another release confirmation after the authors finish. Copy each HTML and sidecar into the isolated worktree, normalize sidecar naming to `docs/<slug>.html.meta.yaml`, and repair repository-required fields such as `slug`, `path`, `date`, `updated`, `style`, and taxonomy before running gates. Keep only the declared card files plus generated index artifacts in the staged allowlist; never carry temporary `/tmp` files, process manifests, or author scratch files into the commit.

If the repository's compatibility checker is single-card while the release is a batch, run its required checks per card or construct per-card compatibility bundles; do not invent a non-conforming shared bundle and then treat its failure as a content failure. A checker failure caused by bundle shape is a workflow/normalization issue to repair before release.

## Batch normalization gate (before build)

For every card in a multi-card batch, validate the sidecar against the repository's actual index contract before invoking the build. The minimum required fields are `slug`, `path`, `category`, `title`, `date`, `tags`, and non-empty `desc`. Do not assume a sidecar that is valid for a single-card authoring workflow is build-valid.

- Always add the exact `path: docs/<slug>.html` field.
- Always add `category`, including for method cards and technical shares.
- Normalize `description` to `desc` before the first build.
- Remove duplicate YAML keys rather than relying on parser last-write-wins behavior.
- Re-read every sidecar after timestamp/shape fixers mutate it and inspect the diff.

A batch build can fail on one malformed sidecar after all authors have completed. Repair the sidecar contract first, then rerun the single batch build. Legacy slug-mismatch warnings and Git warnings for untracked sidecars are not equivalent to index errors; distinguish them explicitly.

## 2. Theme diversity and implementation gate

Before any build in a batch of two or more cards:

1. Verify each card has an independent `content_shape`, `theme_primary`, `theme_fallback`, `theme_reject`, and (if same-theme reuse occurs) `same_theme_exception` in the run evidence/bundle.
2. Block unapproved same-theme reuse with terminal state `THEME_BLOCKED`.
3. Mechanically verify per card: normalized `meta.yaml.style` == HTML `data-theme`; target CSS token signature exists; at least two target structural signatures exist. A metadata-only style change is not a theme implementation.
4. If a research or author handoff recommended another theme, require an explicit override reason before proceeding.

## 3. Build and verify

1. Run the live repository build command **once per isolated batch**, not once per card.
2. Run repository-wide gates once only when the repository actually requires them; run card-specific content/assets/metadata gates per card and in parallel where their scripts do not mutate files.
3. For a batch with a single-card compatibility checker, create/validate one conforming per-card compatibility bundle in a temporary run directory. Do not invent a shared bundle shape. Keep those bundles and any manifests out of Git.
4. Before a mutating build, snapshot `git status --porcelain`; after it completes, automatically restore unrelated churn. The only allowed final diff is declared card artifacts plus generated `_index.yaml` and `index.html`.
5. If a local structure/content gate fails, make one targeted repair and one full rerun. A second failure is `BLOCKED_AT_LOCAL_GATE`.
6. Consume the current visual disposition from the bundle. `VISUAL_BLOCKED` stops release. `VISUAL_PASSED` or `VISUAL_PENDING` may proceed under Protocol v3; `VISUAL_PENDING` requires a recorded mechanical responsive check, HTTP smoke result, exact unavailable-tool reason, and a follow-up state.

Completion criterion: every required local gate is green, the staged allowlist is exact, and the bundle carries a permitted current visual disposition.

## 3. Commit and integrate

**⚠️ Staging danger — `git add -A` inside a non-worktree host repo:** If the worktree directory sits inside the host repo's working tree and you run `git add -A` or `git add <worktree-dir>`, Git detects the nested `.git` and creates a gitlink (mode `160000` entry) as a submodule. A shell-prompted "yes" or unprompted auto-commit pollutes `origin/main` with a gitlink blob. Prevention: always use explicit file staging (`git add "docs/<slug>.html" "docs/<slug>.html.meta.yaml" "assets/..." "_index.yaml" "index.html"`), never glob or directory add. If the gitlink was already committed, load `references/worktree-gitlink-pollution-recovery.md`.

1. Stage exactly the artifact allowlist plus generated index artifacts. Inspect the staged set and diff before committing.
2. Create the content commit. It contains card artifacts and generated index artifacts only.
3. Fetch immediately before push. If `origin/main` advanced, load `integration-recovery.md`; it permits one rebase/rebuild in this worktree. For a batch, rebase and rebuild once for the whole batch, never per card.
4. If integration still fails, set `BLOCKED_AT_INTEGRATION`; do not force-push or modify another worktree.

Completion criterion: the content commit is pushed, or the bundle records the exact terminal integration state.

## 4. Verify public release

**⚠️ CRITICAL — URL path format for this repo:**
HTML files live under `docs/` in the GitHub Pages URL structure. The correct URL format is:
```
https://ccwq.github.io/infocard-pub/docs/<slug>.html
```
The bare-root path `https://ccwq.github.io/infocard-pub/<slug>.html` returns **HTTP 404**. Always verify with the `docs/` prefix. This caused a false-negative verification failure on 2026-07-21.

Steps:
1. `curl -I <docs-url>` → expect HTTP 200
2. `curl -I <root-url>` → expect HTTP 404 (cross-check)
3. `curl -I _index.yaml` and `index.html` at the root → expect HTTP 200

1. Perform cache-busting checks for every public card HTML, `_index.yaml`, homepage/index entry, and expected identity text. Fetch shared index/homepage evidence once per batch, not once per card.
2. Retry network/Pages evidence at most three times after the initial attempt with `10s → 30s → 60s` backoff. A first 404 immediately after push is `DEPLOYING`, not a terminal failure.
3. If all public checks pass, set Pages to `PUBLISHED` when visual is passed, or `PUBLISHED_PENDING_VISUAL` when visual is pending.
4. If public evidence remains unavailable after the bounded retries, set `PAGES_VERIFICATION_FAILED`; do not fabricate a Pages success.
5. **线上截图交付硬门禁**：当 Pages 为 `PUBLISHED`，或用户明确要求线上证明时，必须用最终线上 URL + cache-busting 参数重新截图；截图至少覆盖桌面首屏，触发移动端审查时另截 390×844。核对页面 slug/title/当前版本后，把截图保存为真实绝对路径 PNG，并在 closeout 中交付 `MEDIA:/absolute/path/to/screenshot.png`。浏览器工具返回的虚拟 screenshot path 不得直接交付。截图失败、身份不符或视觉结论缺失时，状态只能是 `VISUAL_PENDING`，不能报告“发布并验证完成”。

Completion criterion: the bundle contains public URLs, evidence timestamps, a terminal Pages state, and delivered online-URL screenshot path(s).

## 5. Commit release audit

1. After successful Pages verification, update only the existing card `.meta.yaml` with Protocol v3 `release_audit` fields.
2. Load `audit-sidecar-gate.md`. Verify YAML, required fields, content-commit SHA, HTML/manifest hashes, visual/Wiki states, and the exact one-file staged set.
3. Create and push an audit-only commit. Record content and audit commit IDs in the run bundle after push.
4. If audit integration fails after Pages is public, preserve the Pages state and record `AUDIT_PENDING`.
5. If Wiki was requested, let the orchestrator run and report its separate state after Pages. Wiki failure never rolls back Pages.

Completion criterion: the audit sidecar passes its independent gate and its audit-only commit is pushed, or the bundle truthfully records `AUDIT_PENDING` after a successful Pages release.

## 6. Retain and report publish worktrees

After the terminal Pages/audit state is recorded, do not automatically remove the publish worktree. Run `npm run worktree:list -- --repo <repo>` from the primary repository or equivalent repo root, report historical worktrees, and prompt the user exactly: `如需清理可安全删除的历史 worktree，请回复：del-rm`.

If the user later replies exactly `del-rm`, re-run the inventory first, then run `npm run worktree:cleanup -- --repo <repo> --confirm del-rm`. The cleanup command may remove only clean registered worktrees inside the fixed temp/infocard-worktree root and must not use `--force`. Dirty, active, external, repo-local, unregistered, or ownership-uncertain directories are skipped and reported.

## Boundaries

- Never install dependencies in a worktree.
- Never stage files outside the bundle allowlist and generated index artifacts.
- Never force-push, repair another worktree, or turn `VISUAL_PENDING` into visual PASS.
- Never create new publish worktrees outside the fixed temp/infocard-worktree root.
- Never remove publish worktrees unless the user replied exactly `del-rm` for this cleanup pass.
- Never start Wiki automatically; it must be requested by the task.

## References

- `infocard-publish-sop/references/infocard-publish-protocol-v3.md` — source of truth for states, retry budgets, audit schema, and migration
- `infocard-publish-sop/references/integration-recovery.md` — one-rebase recovery branch
- `infocard-publish-sop/references/validator-compatibility.md` — live-validator compatibility branch
- `infocard-publish-sop/references/audit-sidecar-gate.md` — audit-only sidecar validation branch
- `references/parallel-batch-pr-conflict-recovery.md` — 两个并行 worktree PR 冲突恢复：rebase + Python 重建 _index.yaml/index.html + GitHub REST API 合并 PR（2026-07-22 实操验证）
