# Subagent Timeout Worktree Recovery Pattern

## 触发条件

子智能体返回 `status=timeout` 时，无论 `api_calls` 数量多少，都先检查工作树和全局提交记录。API 调用次数只表示发生过工具调用，不能证明已经写文件或提交。

## 核心原则

```text
timeout 报告 ≠ 无产物
timeout + 高 api_calls ≠ 一定有产物
以文件、git status 和 git log --all 为准
```

## 恢复流程

```bash
# 1. 定位工作树
git worktree list

# 2. 检查目标文件、未提交改动和所有 ref
ls -la /path/to/worktree/docs/<expected-slug>*
git -C /path/to/worktree status --short
git -C /path/to/worktree log --all --oneline -20
git -C /path/to/worktree branch -a
```

然后按事实分流：

- **有命名分支提交**：验证提交内容，继续 build、push、PR。
- **有 detached HEAD 提交**：用 `git log --all` 找 SHA，再创建命名分支。
- **有未提交文件**：先验证文件完整性，再由主线程提交。
- **没有目标文件、没有相关提交**：记录 `NO_ARTIFACTS`，主线程直接接管 Authoring；不要再派一个同范围 Author。

## 提交存在时的集成

优先在原 worktree 创建命名分支并 rebase 最新 `origin/main`：

```bash
git -C /path/to/worktree checkout -b publish/<slug>-YYYYMMDD
git -C /path/to/worktree fetch origin main
git -C /path/to/worktree rebase origin/main
```

生成文件冲突时，不把旧索引机械覆盖到新 main。以最新 main 和卡片源文件为基础重新运行 build，随后 stage `_index.yaml`、`index.html`并继续 rebase。

如果仓库当前流程明确要求选择冲突一侧，先确认 rebase 语义：rebase 中 `ours` 通常是新 base，`theirs`通常是正在重放的提交。不要把 `--theirs` 写成跨场景固定规则。

## 典型状态

### 已提交并已推送
- 工作树：无额外改动。
- 远端：目标分支存在。
- 动作：检查 PR/merge 状态，不重复提交。

### 已提交但未推送
- 工作树：目标 commit 可见。
- 动作：建命名分支、rebase、运行门禁、push。

### 有文件但未提交
- 工作树：目标 HTML/meta 等存在。
- 动作：验证文件后由主线程接管提交。

### 无产物
- 工作树：目标文件不存在；`git log --all`无相关提交。
- 动作：标记 `NO_ARTIFACTS`，主线程直接 Authoring。

## 避免误判

- 高 `api_calls` 不能替代文件证据。
- 普通 `git log` 看不到其他 ref 或 detached commit；必须看 `git log --all`。
- 不因 timeout 直接重建，也不因高调用数假定已完成。
- 恢复前先检查目标 slug、标题和实际文件，防止接管错误任务的产物。

## 相关参考

- `references/detached-head-commit-recovery.md`
- `references/build-verify-commit-order-20260719.md`
- `references/batch-authoring-orchestrator-pattern.md`
