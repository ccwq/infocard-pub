# 磁盘清理与 GitHub API 备选（2026-07-23 新增）

两条 session 新发现的 pitfall，补充 `references/pitfalls-20260723.md` 未覆盖的场景。

---

## P1: worktree 用 `cp`/`git clone` 创建导致 SOP 清理链路断裂

**What broke**: 6 个 worktree 残留 `/tmp/infocard/`，共 1.7 GB，触发磁盘紧张告警（92%）。

**根因**：创建时使用了 `git clone` 或 `cp -r` 完整仓库，而不是 `git worktree add`。
- 用 `git clone` 创建的目录有 `.git` 文件，但不是 Git 注册的 worktree
- `git worktree list` 无法列出它们
- SOP 里 `git worktree remove <path>` 找不到对象，静默跳过
- 后续 `rm -rf` 也没有被触发

**正确创建方式**:
```bash
git fetch origin main
git worktree add /tmp/infocard/<slug> --track -b publish/<slug>-YYYYMMDD origin/main
```

**正确清理方式**（worktree 需在命名分支上）:
```bash
# 1. 确认 worktree 已 merge，fetch 最新 main 如有冲突 rebase
git fetch origin main && git rebase origin/main

# 2. 推送并 merge PR（主线程串行，避免 main 推进冲突）

# 3. 删除 worktree 和分支
git worktree remove /tmp/infocard/<slug>   # 前提：worktree 干净
git branch -d publish/<slug>-YYYYMMDD       # 已 merge 的分支用 -d
# 或 force: git branch -D publish/<slug>-YYYYMMDD
```

**worktree 有 untracked 文件时（node_modules 等）**:
```bash
rm -f /tmp/infocard/<slug>/node_modules   # 先清理临时产物
git worktree remove /tmp/infocard/<slug>  # 再解除 worktree 注册
```

**Prevention**: 每次创建 worktree 必须用 `git worktree add`，禁止手动 `git clone` / `cp -r`。主线程 `build` 后立即 `git status --porcelain` 检查，只有干净状态才能触发 worktree remove。

---

## P2: gh CLI 不可用时用 GitHub REST API + `.git-credentials` token 完成 PR + merge

**What broke**: `gh` CLI 未安装，GitHub Personal Access Token 位置未知，无法创建 PR 和 merge。

**解决路径**:

```bash
# 1. 从 ~/.git-credentials 提取 token
TOKEN=$(grep github.com ~/.git-credentials | sed 's/.*://' | cut -d@ -f1)

# 2. 创建 PR（POST /repos/:owner/:repo/pulls）
curl -s -X POST "https://api.github.com/repos/ccwq/infocard-pub/pulls" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -d '{"title":"<title>","head":"<branch>","base":"main","body":"<body>"}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['number'], d['html_url'])"

# 3. Squash merge PR（PUT /repos/:owner/:repo/pulls/:number/merge）
curl -s -X PUT "https://api.github.com/repos/ccwq/infocard-pub/pulls/<n>/merge" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  -d '{"merge_method":"squash","commit_title":"<title> (squashed)"}' \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('merged'), d.get('message',''))"
```

**Prevention**: 每次 publish 后立即创建 PR + merge，不要等（等久了 main 会推进，产生冲突）。`gh` CLI 不可用时用此 API 路径作为稳定备选。
