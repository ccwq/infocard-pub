# `.docs` 信息卡创作迁移剩余工作规格

## Problem Statement

当前信息卡发布流程已经开始从 worktree 迁移到项目根目录下的 `.docs/` 创作模式，但实现还没有收口。清理 CLI 的接口和测试仍在对齐中，promotion 与 local gate 也还需要完成跨平台收尾，另外几个 active Skill 还保留着旧 worktree / `del-rm` 语义。用户需要的是一个真正可用、可维护、Windows/Linux 都一致的 `.docs` 流程，而不是半旧半新的过渡状态。

## Solution

把剩余工作收敛为一次完整的 Node.js 实现与文档迁移：

- 清理命令固定作用于仓库根目录下的 `.docs/`，默认 dry-run，`--apply` 才删除。
- promotion 只接受显式 manifest，精确把 `.docs/<card>/` 里的声明文件复制到正式发布位置。
- local gate 只验证主仓库语义，不再要求 dedicated worktree。
- 发布相关 active Skill 改写为 `.docs` 创作、promotion、发布、收尾的新生命周期，不再把 worktree / `del-rm` 作为当前流程。
- 相关测试只验证外部行为，覆盖 dry-run/apply、安全边界、精确复制、路径 containment 和发布门禁。

## User Stories

1. As an infocard author, I want the cleanup command to operate on the repository-local `.docs` root, so that the workflow is predictable on Windows and Linux.
2. As an infocard author, I want cleanup to default to dry-run, so that I can inspect aged drafts before anything is deleted.
3. As an infocard author, I want `--apply` to be required for deletion, so that cleanup never removes drafts accidentally.
4. As an infocard author, I want the retention window to be configurable for testing, so that I can verify boundary behavior without waiting seven days.
5. As an infocard author, I want direct child directories to be the only cleanup unit, so that loose files under `.docs` are not mistaken for cards.
6. As an infocard author, I want cleanup to skip symlinks and Windows reparse points, so that directory indirection cannot escape the authoring root.
7. As an infocard author, I want cleanup to keep the `.docs` root itself, so that the authoring area remains available after maintenance.
8. As an infocard author, I want deletion failures to be isolated per candidate, so that one locked directory does not block the rest.
9. As an operator, I want bulk deletion to require an explicit confirmation token, so that large cleanup runs stay deliberate.
10. As an operator, I want cleanup output to report candidates, skipped entries, failures, and reclaimed bytes, so that maintenance is auditable.
11. As a publisher, I want promotion to copy only the files declared by the manifest, so that the release boundary stays exact.
12. As a publisher, I want promotion to reject undeclared or ambiguous destinations, so that `.docs` content cannot overwrite arbitrary repo files.
13. As a publisher, I want promotion to verify hashes after copy, so that a copied file is proven identical to the declared source.
14. As a publisher, I want publish gating to accept the primary repository as the runtime root, so that dedicated worktree setup is no longer mandatory.
15. As a publisher, I want publish gating to reject authoring inputs that live inside `.docs`, so that draft paths never count as formal release inputs.
16. As a maintainer, I want the active publish Skills to describe the new `.docs` lifecycle, so that future agents do not follow obsolete worktree guidance.
17. As a maintainer, I want the closeout flow to report `.docs` cleanup candidates rather than historical worktree inventories, so that the operator sees the real residue surface.
18. As a maintainer, I want old `del-rm` prompts removed from the active path, so that the workflow does not ask about a mechanism it no longer uses.
19. As a maintainer, I want the implementation tests to stay at the external-process seam, so that refactors do not overfit private helpers.
20. As a maintainer, I want the remaining spec and implementation work to stay Node.js-first, so that the repo no longer depends on a Python cleanup tool for this flow.

## Implementation Decisions

- The cleanup CLI is a Node.js script using only the standard library.
- The cleanup root is the repository-local `.docs` directory derived from the repository root; normal user-facing calls should not accept arbitrary filesystem roots.
- Age is measured from directory mtime, with a default seven-day threshold and a configurable test/maintenance override.
- Promotion remains manifest-driven and uses exact source-to-destination mappings plus SHA-256 verification.
- The publish gate treats the primary repository as the runtime root and keeps strict content/index/sidecar validation.
- Active publish Skills must be rewritten so the current path is `.docs` authoring → promotion manifest → repo-local release gates → closeout reporting → explicit cleanup, not worktree creation/retention.
- Historical worktree notes may remain as legacy references, but they must not read like active instructions.
- Tests should cover behavior through CLI and repository-level seams rather than private implementation helpers.

## Testing Decisions

- The cleanup CLI is tested as an external process against a temporary repository-shaped fixture.
- Promotion is tested through the manifest-to-filesystem seam.
- Publish gate tests continue to exercise the repository root / sidecar / index contract from the CLI boundary.
- Skill migration is checked with literal text audits for obsolete worktree and `del-rm` guidance, plus focused integration checks for the new `.docs` lifecycle.
- Prior art for the tests already exists in the repo: the publish-batch staging tests, the publish gate tests, and the current CLI-style Node test suites.

## Out of Scope

- Restoring or preserving the old worktree workflow as an active path.
- Automatic deletion of historical worktrees.
- Cloud backup or archival of `.docs` drafts.
- Switching the repo to a different issue tracker or publishing this spec externally.
- Redesigning the card visual system itself.

## Further Notes

- This spec is intentionally narrower than the original migration spec: it only captures the remaining work needed to finish the current implementation.
- The main risk is half-migrated documentation. The active Skills must be updated in the same direction as the code so that future runs do not mix `.docs` authoring with old worktree instructions.
