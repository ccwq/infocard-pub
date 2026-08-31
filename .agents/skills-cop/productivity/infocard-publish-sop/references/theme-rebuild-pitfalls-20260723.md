# 主题重建陷阱（2026-07-23 新增）

来源：unknowns-ai-guideline 信息卡从 graph-paper 主题迁移到 white-purple 主题。重建 = 从零做结构 + CSS，不接受换色或内容扩充。适用于主题切换（graph-paper → white-purple）或版式完全不同时。

---

## P3: `git worktree add` 报错"branch already exists"，根因是 worktree 目录残留

**症状**：

```bash
git worktree add /tmp/infocard-qwen-v2 origin/main
# → "Preparing worktree ... done. HEAD is now at 0ef555d"
git checkout -b publish/unknowns-ai-guideline-20260723
# → fatal: a branch named 'publish/unknowns-ai-guideline-20260723' already exists
```

删了本地分支后再试，仍同样错误。

**根因**：`git worktree add` 在创建 worktree 前先验证目标目录。目录已存在时报"分支已存在"——错误信息有误导性。真正问题是目录残留，不是分支。

**正确清理序列**（worktree + 分支完整清理）：
```bash
# 1. 删 worktree
git worktree remove /tmp/infocard-<slug> --force

# 2. 清理 .git/worktrees 残留
git worktree prune

# 3. 删本地分支（不是 remote tracking）
git branch -D publish/<slug>-YYYYMMDD

# 4. 若分支 track 远程（publish/ 开头的推送分支）
git branch -r -d origin/publish/<slug>-YYYYMMDD  # 先删 remote tracking
git push origin --delete publish/<slug>-YYYYMMDD  # 再删远程分支

# 5. 现在才 add
git worktree add /tmp/infocard-<slug> origin/main
cd /tmp/infocard-<slug>
git checkout -b publish/<slug>-YYYYMMDD
```

**Prevention**：worktree 生命周期结束后，三步清理（remove → prune → branch cleanup）必须全部执行。不能跳过任何一步。

---

## P3: PR 创建后不立即 merge 导致 squash-conflict

**症状**：创建 PR 后等 CDN 传播（90s sleep）。其他 PR 合并推进 main。Squash merge → `HTTP 405: Pull Request has merge conflicts`。

**根因**：Squash merge 要求 PR 相对于 base 无冲突。创建 PR 后不立即 merge，期间 main 被推进则冲突。

**正确操作**：push 后立即执行 merge API。
```bash
git push origin publish/<slug>-YYYYMMDD
# 立即 merge（PUT /repos/:owner/:repo/pulls/:number/merge）
# merge 成功后再 sleep 等待 CDN

# 冲突时：
git fetch origin main && git rebase origin/main
git push origin publish/<slug>-YYYYMMDD --force
# 立即重新 merge
```

**Prevention**：push + merge 是原子操作对，中间不能插入任何等待。批量 PR 串行：build→push→merge→下一个，不混行。

---

## 主题重建额外要求

**重建定义**：主题 CSS 骨架完全不同（hardblue / darkblue / white-purple / graph-paper 等）时的重新编写，不是颜色换肤。

重建时必须：

1. 读取目标主题的 `theme/<theme>.html` 完整 CSS 变量（`:root{}` 块）。
2. 将新 CSS 注入新 HTML 结构，不能复用旧 CSS。
3. 保留原卡片全部文字内容（标题、正文、章节顺序、标签、数据）。
4. 检查原卡片无重复后（`ls docs/` grep slug），使用原 slug 写入新 HTML。
5. 写完后 build → leak check → commit → push → PR → merge → CDN 验证。

禁止：
- 把换色当成重建（CSS 变量覆盖不行，结构必须适配主题）。
- 删除原卡片内容（即使旧版卡片还存在）。
- 在同一 worktree 里同时改两个主题的文件。
