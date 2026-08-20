# infocard-pub 多 worker 协作的 git 预检

## 触发场景

`/home/ccwq/qbox/opendir/project/infocard-pub` 是被多个 Hermes 会话 / 多个 worktree 共用的协作仓。
不同会话可能在同一时间窗口里：

- 写新卡（每张 commit 一次）
- 修主题 / 移动端 bug
- 跑 build 修订 `_index.yaml`、`index.html`
- 留下未 commit 的脏工作区

如果直接进入"写卡 → build → add → commit → push"流程，常见后果：

1. 把别人未提交的本地差异（例如 `awesome-claude-md.html` 的移动端修复）混进自己的 commit。
2. 看到 origin/main 已经存在的卡显示成 `??` untracked，被 `git add docs/2026...` 通配后整批 commit。
3. push 时遇到 non-fast-forward；为了"快"想用 `git push --force`，越界覆盖别人卡。

## 必做：开工前 3 行预检

```bash
cd /home/ccwq/qbox/opendir/project/infocard-pub
git fetch origin --quiet
git status -sb
git log --oneline -5 origin/main
```

判断分叉：

- `## main...origin/main [ahead N, behind M]`
- `M >= 1`：远端领先，**必须先同步**
- 工作区出现你没动过的 `??` 或 `M` 文件：先停下来，不要 add

## 标准修复流程

### 情况 A：本地干净，仅远端领先

```bash
git pull --rebase origin main
```

### 情况 B：本地领先 + 远端领先（分叉）

绝不能直接 merge / push --force。按 stash → rebase → pop 的顺序：

```bash
# 把当前所有改动（包括 untracked）暂存；只列你这次要保留的路径，其它别人的脏文件留在工作区
git stash push -u -m 'wip-before-rebase-<topic>' -- \
  _index.yaml index.html \
  docs/<your-slug>.html docs/<your-slug>.html.meta.yaml \
  docs/assets/images/<your-slug>

git pull --rebase origin main

git stash pop
# 如果 _index.yaml / index.html 出现 UU（双方都改），它们是 build 产物，直接 reset 后重 build：
git checkout HEAD -- _index.yaml index.html
npm run build && npm run verify

# 如果 stash pop 报 untracked 冲突（"already exists, no checkout"），
# 说明远端已经把同名文件并进 main，你的 stash 里的版本要么相同要么是别人的本地脏改动；
# 用 git stash show -u 检查，确认不属于你这次任务后 git stash drop。
```

### 情况 C：工作区里出现一堆别会话遗留的 untracked

不要 `git add docs/` 通配。**显式列出本次要 commit 的文件**：

```bash
git add _index.yaml index.html \
  docs/<your-slug>.html \
  docs/<your-slug>.html.meta.yaml \
  docs/assets/images/<your-slug>
git status --short  # 确认仅这几行被 staged
```

未列入的别人脏文件保持原状，不动它们；在最后的用户汇报里明确告知"工作区里还残留 X、Y、Z 文件未处理，需要确认"。

## 提交后再次校验

```bash
git log --oneline -3
git status --short  # 必须只剩别人的脏文件，不能再有本次 slug 相关条目
```

push 失败时优先看 `git status -sb`，先 fetch + rebase，再决定下一步；force-push 必须单独取得用户授权（见 memory `force-push 必须单独告知用户原因`）。

## 反模式

- ❌ `git add .` 或 `git add docs/`
- ❌ 在分叉状态直接 `git push --force-with-lease`
- ❌ 把 `_index.yaml` / `index.html` 的合并冲突手工拼接——它们由 `npm run build` 生成，永远 reset + 重 build
- ❌ 假装看不到工作区里别人的脏文件，整体 commit "feat: …"
