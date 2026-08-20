# `.docs` 本地信息卡创作与七天清理规格

## Problem Statement

当前信息卡发布流程为每次发布创建独立 Git worktree，并要求在固定的系统临时目录中完成构建、校验、提交、推送和收尾。该方案隔离能力强，但对日常单卡发布过重：需要创建分支和 worktree、维护运行目录、处理历史 worktree、执行额外清理确认，并承担 detached HEAD、过期分支、磁盘累积和跨平台路径管理成本。

用户希望完全取消信息卡发布 worktree，把项目根目录下的 `.docs` 作为唯一的本地创作区。每张信息卡直接在 `.docs` 的一个直接子目录中创建和维护，完成后按明确清单复制到正式的 `docs` 与资源目录，再沿用构建、验证、精确暂存、提交、推送和线上验证流程。`.docs` 必须被 Git 忽略。

主仓库可能同时存在其他未提交或已暂存修改。新流程应优先保护现有信息并自主继续，而不是因为普通脏状态停止。只有继续操作可能造成重大内容丢失、错误覆盖、无法判断的语义冲突或不可安全恢复的 Git 历史风险时，才允许阻断发布。

`.docs` 中的卡片目录不是长期档案。项目需要一个只依赖 Node.js 标准库、兼容 Windows 和 Linux 的清理命令，按目录最后修改时间删除超过七天的 `.docs` 直接子目录。用户明确接受该规则可能删除超过七天的未完成草稿或唯一原稿；清理命令不以发布成功标记作为前置条件。

## Solution

建立一个 repo-local 的轻量信息卡工作流：

1. 每张信息卡在 `.docs/<card-directory>` 中创作、预览、修复并保留运行期材料。
2. `.docs` 全目录由 Git 忽略，构建索引也不扫描该目录。
3. 发布前生成 promotion manifest，声明要复制到正式目录的 HTML、sidecar、资源和必要附属文件，并记录源文件与目标文件的 SHA-256。
4. promotion 操作只允许处理 manifest 中声明的相对路径；目标路径必须位于允许的正式发布目录中。
5. promotion 完成后核对目标文件哈希，再执行现有 build、metadata、taxonomy、leak、内容、资源和视觉门禁。
6. 继续复用精确 allowlist staging。无关的 tracked、untracked 或 staged 修改必须保持原样，不得被本次发布提交。
7. 发布流程不创建、不枚举、不保留也不清理 Git worktree；旧 worktree 工具仅作为历史迁移或独立维护对象，不再属于新信息卡发布主路径。
8. 新增 Node.js 清理 CLI。默认扫描 `.docs` 的直接子目录，计算目录最后修改时间，列出超过七天的候选；默认 dry-run，显式 `--apply` 后才删除。
9. 清理不检查发布状态、manifest、目标文件或远端状态。安全边界仅负责确保删除目标确实是 `.docs` 内的直接普通目录，并拒绝符号链接、Junction、路径越界和 `.docs` 根目录。
10. 单次实际删除候选超过十个时，CLI 必须停止并要求人工确认，以符合仓库文件删除约束；确认机制应是明确参数或精确确认值，不依赖交互式 shell。

## User Stories

1. As an infocard author, I want to create each card under a fixed repo-local `.docs` directory, so that I always know where draft artifacts live.
2. As an infocard author, I want one direct child directory per card, so that drafts, metadata, assets and evidence do not mix across cards.
3. As an infocard author, I want the same directory contract on Windows and Linux, so that the workflow does not depend on system temp path conventions.
4. As an infocard author, I want `.docs` ignored by Git, so that drafts and runtime evidence cannot be staged accidentally.
5. As an infocard author, I want to preview and visually repair a card from its `.docs` workspace, so that publication files are not mutated during iteration.
6. As a publisher, I want promotion to use an explicit manifest, so that only declared artifacts are copied into the public source tree.
7. As a publisher, I want promotion paths validated as repository-relative paths, so that a malformed manifest cannot write outside the repository.
8. As a publisher, I want promotion destinations restricted to approved publication directories, so that a card cannot overwrite scripts, skills or repository configuration.
9. As a publisher, I want source and destination SHA-256 values compared after copying, so that a partial or transformed copy is detected before build.
10. As a publisher, I want an existing target card to be detected before overwrite, so that an update is not mistaken for a new publication.
11. As a publisher, I want ambiguous same-path changes to stop for review, so that existing public content is not silently replaced.
12. As a publisher, I want ordinary unrelated unstaged changes to coexist with publication, so that I do not need a separate worktree for every card.
13. As a publisher, I want unrelated untracked files to remain untouched, so that local research and user artifacts are preserved.
14. As a publisher, I want unrelated staged changes to remain staged but excluded from the card commit, so that the workflow does not rewrite the user's index state.
15. As a publisher, I want exact allowlist staging and commit behavior, so that a dirty repository does not broaden the release scope.
16. As a publisher, I want build-generated index files admitted only when the promoted card changed, so that unrelated generated drift is not committed.
17. As a publisher, I want build spillover outside the release allowlist classified before any restoration, so that pre-existing user edits are not mistaken for disposable build output.
18. As a publisher, I want the workflow to continue autonomously when recovery is lossless and deterministic, so that routine Git state does not require unnecessary confirmation.
19. As a publisher, I want the workflow to stop when content loss is plausible, so that speed never silently destroys user work.
20. As a publisher, I want force push excluded from autonomous recovery, so that remote history cannot be rewritten as a routine publication step.
21. As a publisher, I want merge, rebase and unmerged-index states inspected explicitly, so that publication does not proceed on an indeterminate Git base.
22. As a publisher, I want fetch and remote comparison to remain part of release preflight, so that the public branch state is known before push.
23. As a publisher, I want branch divergence handled only through a lossless, reviewable path, so that local work and remote work are both preserved.
24. As a publisher, I want all existing metadata, taxonomy, leak, content, asset and visual gates retained, so that removing worktrees does not weaken release quality.
25. As a publisher, I want public HTML and index identity verified after push, so that a successful Git command is not mistaken for a completed release.
26. As a publisher, I want public visual evidence retained as a separate gate, so that the lighter workspace model does not convert static checks into visual acceptance.
27. As a maintainer, I want new publish bundles to identify the primary repository as the runtime root, so that validators no longer require a dedicated worktree path.
28. As a maintainer, I want validators to distinguish the ignored authoring workspace from formal publication outputs, so that `.docs` can never satisfy a `docs` artifact requirement.
29. As a maintainer, I want the worktree creation and cleanup contract removed from the current SOP, so that agents do not create obsolete release workspaces.
30. As a maintainer, I want closeout to report `.docs` cleanup candidates instead of historical publish worktrees, so that operational reporting matches the new lifecycle.
31. As a maintainer, I want historical worktree incident notes clearly marked as legacy, so that they are not interpreted as current instructions.
32. As a maintainer, I want existing safe staging behavior reused, so that the migration adds as few new testing seams as possible.
33. As a maintainer, I want the cleanup implementation to depend only on the Node.js standard library, so that it runs without installing packages.
34. As a Windows user, I want cleanup to handle drive-letter paths and Junctions safely, so that recursive deletion cannot escape through Windows filesystem indirection.
35. As a Linux user, I want cleanup to reject symbolic links, so that linked directories outside `.docs` cannot be deleted recursively.
36. As a user, I want cleanup to default to dry-run, so that I can see which card directories are old before deletion.
37. As a user, I want `--apply` to be required for deletion, so that merely inspecting cleanup status cannot remove data.
38. As a user, I want the default retention threshold to be exactly seven 24-hour periods, so that cleanup semantics are predictable across time zones.
39. As a user, I want a configurable retention argument for controlled testing and maintenance, so that the CLI can be validated without waiting seven days.
40. As a user, I want directory age based on the card directory's last modification time, so that recent edits extend retention.
41. As a user, I accept that an unmodified draft older than seven days can be deleted, so that cleanup remains purely time-based.
42. As a user, I want only direct child directories of `.docs` considered, so that loose files and nested implementation details do not become independent cleanup targets.
43. As a user, I want `.docs` itself to survive every cleanup run, so that the authoring root remains available.
44. As a user, I want regular files directly under `.docs` skipped and reported, so that the CLI does not silently reinterpret them as cards.
45. As a user, I want symlinks and Junctions skipped and reported, so that cleanup never follows an indirection target.
46. As a user, I want deletion failures isolated per card directory, so that one locked directory does not hide the status of all other candidates.
47. As a user, I want a non-zero exit status when an apply run has failures, so that automation can detect incomplete cleanup.
48. As a user, I want a structured summary of candidates, removed, skipped, failed and reclaimed bytes, so that cleanup results are auditable.
49. As a user, I want candidate ordering deterministic, so that dry-run and apply reports are easy to compare.
50. As a user, I want exactly seven-day boundary behavior tested, so that directories are not retained or removed due to rounding ambiguity.
51. As a repository owner, I want deletion of more than ten candidate directories blocked without explicit bulk confirmation, so that repository safety policy is enforced.
52. As a repository owner, I want bulk confirmation scoped only to the current `.docs` cleanup operation, so that it cannot authorize other deletions.
53. As a repository owner, I want the cleanup command to work when `.docs` is absent, so that fresh clones and CI do not fail unnecessarily.
54. As a repository owner, I want the cleanup command to work when `.docs` is empty, so that routine maintenance remains idempotent.
55. As a repository owner, I want `.docs` excluded from site builds and index discovery, so that drafts never appear on the homepage.
56. As a repository owner, I want `.docs` excluded from leak scanning unless a card is explicitly promoted, so that draft-only content does not alter release gate scope.
57. As a repository owner, I want the formal `docs` directory to remain the only source of public card metadata, so that index generation has one authority.
58. As an agent operator, I want the SOP to say that publication authorization does not authorize deleting young or unrelated `.docs` directories, so that cleanup remains separately scoped.
59. As an agent operator, I want the SOP to run cleanup only as an explicit maintenance command or configured closeout action, so that card publication itself does not silently remove drafts.
60. As an agent operator, I want no `del-rm` worktree prompt in the new closeout, so that users are not asked to manage a mechanism the workflow no longer uses.

## Implementation Decisions

- The publication architecture changes from isolated Git worktrees to a repo-local authoring workspace plus a controlled promotion boundary. New card creation and iteration occur only inside `.docs`; formal publication artifacts continue to live in the existing public source locations.
- `.docs` contains one direct child directory per information card. No `active` or `archive` subdivision is introduced.
- `.docs` is ignored as a whole. The build, index, taxonomy and release systems continue treating formal `docs` metadata as the sole public source of truth.
- The publish bundle remains the release authority but no longer declares a dedicated worktree root. It declares the primary repository root, the card authoring directory, the promotion manifest and the formal output allowlist.
- Promotion is an explicit state transition, not an ad-hoc copy. It validates source containment, destination containment, file type, collision/update intent and hashes before local release gates run.
- The promotion manifest records repository-relative source and destination mappings and SHA-256 values. Runtime absolute paths may be reported as evidence but are not committed as public metadata.
- Promotion cannot use directory-wide wildcard copying without expanding it into a deterministic file list. This preserves exact artifact identity and makes later staging auditable.
- Existing exact-path batch staging remains the canonical Git write seam. It must continue to reject rename/copy ambiguity, unmerged entries and unexpected staged paths while allowing unrelated unstaged/untracked changes to remain outside the commit.
- Pre-existing staged paths are preserved. Publication must use a commit mechanism that commits only the exact release set without unstaging, resetting or committing unrelated staged changes.
- Autonomous continuation is allowed only for actions with deterministic lossless recovery. Read-only inspection, exact copying, hash verification, build reruns and exact-path staging are normal autonomous actions.
- Major-risk blockers include possible loss of unique user content, ambiguous overwrite of an existing formal card, unresolved merge conflicts, inability to distinguish pre-existing changes from build spillover, required force push, or a history rewrite whose semantic result cannot be established automatically.
- Fetch and remote comparison remain mandatory. Removing worktrees does not authorize destructive reset, automatic stash dropping, force push or silent replacement of the user's branch.
- The deterministic local release gate is revised to verify execution at the declared primary repository, validate that authoring sources are under `.docs`, validate that formal artifacts are outside `.docs`, and retain strict sidecar/index checks.
- Worktree root resolution, inventory, cleanup and `del-rm` closeout prompting are removed from the active information-card publication path. Compatibility code may remain temporarily for historical/manual worktree maintenance, but active skills and validators must not require it.
- Cleanup is implemented as one Node.js CLI using only the standard library. The repository root is discovered safely, and the cleanup root is fixed to that repository's `.docs`; arbitrary cleanup roots are not accepted in normal operation.
- The cleanup unit is a direct child directory of `.docs`. Regular files, symbolic links, Junctions/reparse-point directories and non-directory entries are skipped and reported.
- Age is calculated as `current_time - directory_mtime`. The default threshold is seven 24-hour periods. A directory at or beyond the threshold is eligible.
- Cleanup deliberately does not inspect publish state, Git state, manifests, target files, commits or remote Pages state. This encodes the user's explicit time-only deletion decision.
- Cleanup defaults to dry-run. `--apply` enables deletion. A configurable age argument is supported for tests and explicit maintenance, while seven days remains the default.
- More than ten deletion candidates require an additional explicit bulk-confirmation argument. Without it, apply mode exits without deleting any candidate.
- Deletion is best-effort per directory. The command continues after an individual failure, reports all outcomes and exits non-zero when any requested deletion fails or safety validation blocks the operation.
- Output provides a stable human-readable summary and may additionally expose JSON output for automation. At minimum it reports scanned, candidates, removed, skipped, failed and reclaimed bytes.
- The cleanup command never deletes `.docs` itself and never follows filesystem indirection. Real-path containment is revalidated immediately before each recursive deletion to reduce time-of-check/time-of-use risk.
- Publication closeout reports the retained `.docs` card directory and may run cleanup dry-run to show aged candidates. Actual cleanup is not implied by publication authorization and requires an explicit apply invocation.
- Skill documentation must distinguish current rules from historical worktree incidents. Historical recovery notes may remain searchable but cannot override the new `.docs` contract.

## Testing Decisions

- The primary test seam is the cleanup CLI as an external process against a temporary repository-shaped directory. Tests assert exit status, stdout/JSON summary and observable filesystem results rather than private helper calls.
- Every new or modified test case includes the repository-required Chinese Given/When/Then/regression comment.
- Dry-run tests create old and young card directories, execute the command without `--apply`, and assert that no directory is removed.
- Apply tests verify that directories older than seven days are removed while younger directories remain.
- Boundary tests use controlled mtimes to prove that exactly-threshold directories are candidates and just-younger directories are not.
- Safety tests prove that `.docs` itself, direct regular files, symbolic links, Junctions/reparse points where supported, and paths outside `.docs` are never recursively deleted. Platform-specific indirection tests may be skipped only when the host cannot create that filesystem primitive.
- Bulk safety tests create more than ten old card directories and prove that apply mode removes none without explicit bulk confirmation, then prove that the confirmed run removes eligible ordinary directories.
- Failure-isolation tests make one candidate undeletable or otherwise force a deletion error, then verify remaining candidates are still processed and the command exits non-zero.
- Missing-root and empty-root tests verify successful idempotent behavior.
- Deterministic-report tests verify stable ordering and complete candidate/removed/skipped/failed counts.
- Promotion tests operate at the highest available manifest-to-filesystem seam. They verify exact copy, hash equality, destination containment, collision handling, rejection of symlinks and rejection of undeclared outputs.
- Release-gate integration tests revise the existing local publish-gate cases: the primary repository is accepted, an execution directory outside the declared repository is rejected, `.docs` sources are accepted only as authoring inputs, and formal artifact paths inside `.docs` are rejected.
- Exact staging regression tests continue using the existing batch-staging CLI. New cases verify that unrelated staged/unstaged files survive unchanged while only promoted allowlisted outputs and legitimately generated indexes enter the publication commit.
- Build/index regression tests verify that metadata under `.docs` is not discovered and that only promoted formal sidecars affect generated index content.
- Documentation audits search active publishing skills for current worktree creation, worktree retention, `del-rm` prompting and fixed temp-root requirements. Any remaining match must be explicitly marked historical/legacy rather than executable current guidance.
- Cross-platform acceptance requires the Node.js suite to pass on Windows and Linux. Path comparison, timestamp math and recursive deletion must not depend on shell commands.
- Prior art includes the existing worktree CLI tests for filesystem safety, local publish-gate tests for runtime-root validation, and exact batch-staging tests for allowlist isolation. Those suites provide the preferred style and should be migrated rather than replaced with lower-level unit tests.

## Out of Scope

- Preserving worktree as a fallback for dirty repositories, parallel batches or recovery runs. The user explicitly selected complete removal from the information-card publication path.
- Automatically archiving card directories before cleanup.
- Distinguishing drafts from published cards during cleanup.
- Requiring `.published.json`, promotion manifest verification, commit verification or public URL verification before deletion.
- Recovering `.docs` content after the seven-day cleaner deletes it. `.docs` is ignored and Git is not a backup for it.
- Automatically uploading or backing up `.docs` to cloud storage, Wiki, artifacts or another repository.
- Force pushing, destructive reset, silent stash deletion or automatic semantic conflict resolution.
- Redesigning the existing visual verification, metadata, taxonomy, leak, public Pages or two-commit audit semantics except where their worktree assumptions must be removed.
- Deleting historical worktrees as part of this migration. Existing worktrees require a separately authorized maintenance operation.
- Publishing this specification to an external issue tracker. This request is explicitly for a local specification.

## Further Notes

- The time-only cleanup policy intentionally trades recoverability for simplicity. An unmodified draft older than seven days is eligible even if it has never been promoted or published. The CLI documentation and dry-run output must state this plainly.
- Directory mtime is the selected age source. Filesystem operations inside a card directory do not always update the parent directory mtime on every platform. Authors who need to retain a card beyond seven days must modify/touch the card directory or run cleanup only after reviewing dry-run candidates.
- Because the main repository can be dirty, the release report must separate pre-existing ambient changes, promoted card outputs, build-generated outputs and unresolved residue. A clean `git status` is no longer a prerequisite for successful publication.
- The current repository contains active unrelated changes and branch divergence. Implementation must preserve them and scope edits/commits to this specification only.
- This spec supersedes the 2026-08-20 fixed-temp worktree lifecycle for future information-card runs once implementation is completed and verified. Until then, the executable repository behavior remains the authority.
