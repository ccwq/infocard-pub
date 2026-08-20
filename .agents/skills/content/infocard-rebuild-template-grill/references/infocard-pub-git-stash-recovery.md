# infocard-pub git 冲突与 stash 恢复模式（2026-07-08）

## 典型症状

在 `infocard-pub` 仓库中操作时遇到以下组合：
- `git stash` 保存了本地修改
- `git pull` 被 untracked files 阻塞
- `git stash pop` 后处于 `REBASING` 状态（`git rebase --edit-todo` 提示）
- 后续命令（`git status`、`git checkout`）报 timeout 或异常退出

## 根因

`infocard-pub` 的两个 CI workflow（`index.yml` 和 `pages.yml`）会在每次 push 后自动 commit `_index.yaml`、`index.html`、`docs/` 等文件到 `main`。本地工作区长时间不同步时，`git pull` 会遇到：
1. **Untracked files 冲突**：CI 新生成的文件（如 `docs/20260708-xxx.html`）与本地 stash 的同名文件冲突
2. **Stash + pull 组合导致 REBASING 状态**：如果 stash 后尝试 pull 失败，再 `stash pop` 会把 stash 内容留在 `REBASING` 中的文件上，导致混乱

## 恢复步骤（按顺序执行）

```bash
cd /home/ccwq/infocard-pub

# Step 1：退出任何 rebase/merge 状态
git rebase --abort 2>/dev/null
git merge --abort 2>/dev/null

# Step 2：丢弃本地修改（此时 html 文件已由 CI 发布，不需要本地版本）
git checkout -- .

# Step 3：删除会阻塞 pull 的 untracked 文件（CI 新生成的）
git clean -fd dist/ infocard-*/ 2>/dev/null
# 如果还有别的，用 git status 找 untracked 再 clean

# Step 4：切回 main 并 fast-forward
git checkout main
git pull origin main

# Step 5：重新应用修改
# （patch 已在剪贴板或从对话历史恢复，重新 patch）
```

## 预防规则

1. **每次操作前先 `git fetch origin main && git status -sb`**：检查是否 behind，behind > 3 时先 pull 再操作
2. **修改前先 pull**：在 main 上改文件比先 stash 再 pull 更干净
3. **不要 stash**：如果只需要修改一个 HTML 文件，直接改，改完后 `git add + commit + push` 即可，不需要 stash
4. **dist/ 目录在 .gitignore 里但不是所有 CI 产物都在**：需要 `git clean -fd` 清理的是 `dist/`、`infocard-*/` 这类 CI 生成的未跟踪目录

## 本次教训

当用户说"修改已发布的信息卡"时，流程是：
1. `git fetch origin main && git pull origin main`（先同步）
2. 修改 HTML
3. `git add + commit + push`

不需要 stash。Stash 是在"需要临时切分支"时才用的。
