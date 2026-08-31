# fix-taxonomy post-commit dirty worktree → CI failure

## 故障现象（2026-06-28）

**CI Run #905**：`pages.yml` 中 `git diff --exit-code` 步骤失败 → Deploy 失败，详情页返回 404。

## 根因

`npm run fix-taxonomy` 的副作用：**每次运行都会扫描 `docs/**/*.meta.yaml`，规范化全仓所有字段**（如 `taxonomy.style` 去 `-style` 后缀、`desc` 引号规范化、补全 taxonomy 字段等），并将这些修改写回磁盘。

正确流程：
```
npm run fix-taxonomy     ← 在 commit 之前
npm run build
npm run verify
git add <本次新卡> <所有被 fix-taxonomy 修改的 meta.yaml> _index.yaml index.html
git commit -m "..."
git push
```

本次错误流程（commit 后才 fix-taxonomy）：
```
npm run build && npm run verify
git add ... && git commit -m "..."  ← 此时 meta.yaml 还是旧状态
git push && sleep 90
npm run fix-taxonomy               ← 修改了已提交的 meta.yaml，工作目录变脏
git status --short                 ← M docs/20260628-xxx.meta.yaml
→ CI git diff --exit-code FAIL
```

## 诊断

```bash
cd /path/to/infocard-pub
git status --short
# 若有 M docs/*.meta.yaml 出现 → fix-taxonomy 改动了已提交的 meta.yaml
```

## 修复

两种方式，任选其一：

### 方式A： amend（推荐，本 session 使用）

```bash
# 1. 先确保 fix-taxonomy 已运行完毕
npm run fix-taxonomy

# 2. 关键：staging 所有被 fix-taxonomy 修改的 meta.yaml，不只是新卡！
#    fix-taxonomy 会规范化全仓所有 meta.yaml（去style后缀、补taxonomy等）
#    必须用 find+xargs 捕获全部，不能只 git add 本次新卡
find docs -name '*.meta.yaml' -print0 | xargs -0 git add

# 3. amend 到上一条 commit（不产生新 commit，保持历史干净）
git add docs/<slug>.html docs/<slug>.html.meta.yaml _index.yaml index.html
git commit --amend --no-edit
git push

# 4. 确认工作区干净
git diff --exit-code && echo "clean"

# 5. 在 CI 上 re-run（若 CI 已经触发）
# GitHub Actions → Deploy GitHub Pages → Run #905 → Re-run all jobs
```

**amend 方式要点：amend 只修改 commit message 不追加 commit，所以只产生一条干净的 commit 记录。**

### 方式B：reset → rebuild → re-commit
```bash
# 1. git reset --hard origin/main  恢复干净状态
# 2. npm run fix-taxonomy
# 3. npm run build && npm run verify
# 4. git add 全部变更（含 fix-taxonomy 的 meta.yaml 修改）
# 5. git commit -m "..."
# 6. git push
```

## 预防规则

**`npm run fix-taxonomy` 必须出现在 `git commit` 之前。**

每次 `git commit` 之后，立即检查 `git status --short`，如果出现 `M docs/*.meta.yaml`，说明有未 stage 的 meta.yaml 修改。必须在 push 之前把这些修改加进同一 commit（amend 或 re-commit），不能带 dirty worktree 推送。

## 关键 CI 步骤（pages.yml）

```yaml
- name: Ensure build does not mutate tracked files
  run: git diff --exit-code
```

这步在 `npm run verify` 之后、`Setup Pages` 之前运行。如果本地有 dirty meta.yaml，这步 exit 1 → 整个 CI fail。

## 相关坑点

- `fix-taxonomy` 会规范化 `taxonomy.style`（去 `-style` 后缀），导致 `_index.yaml` diff → CI verify 失败
- 详见主 SKILL.md `Build / commit / deploy` 中的 `fix-taxonomy 规范化 stale _index.yaml` 条目
