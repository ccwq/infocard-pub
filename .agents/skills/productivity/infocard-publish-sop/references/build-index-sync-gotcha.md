# Build Index Sync Gotcha

## Problem

After every `npm run build`, the generated `_index.yaml` and `index.html` are written to `dist/` — **not** to the repo root.

```text
dist/_index.yaml     ← contains fresh index data with new cards
dist/index.html      ← contains fresh home-index-data injection
_index.yaml          ← root: STALE (old version from last committed build)
index.html           ← root: STALE
```

If you commit without syncing `dist/` → root, the pushed commit will have **stale index data**:
- New card does NOT appear in `_index.yaml`
- New card does NOT appear in homepage search/filter
- Homepage filter options are out of date

The card HTML file (`docs/<slug>.html`) is already committed, but the index doesn't know about it.

**This has caused at least 2 failed publish attempts** (lemma-platform, claude-code-recipes), requiring `git commit --amend` to retroactively fix.

## Root Cause

`scripts/build-site.js` calls `writeGeneratedArtifacts(indexData)` from `scripts/index-build-lib.js`, which writes to `DIST_DIR = path.join(ROOT_DIR, 'dist')`.

The `dist/` directory is in `.gitignore`. Only the root `_index.yaml` and `index.html` are tracked.

## Correct Sequence

After `npm run build`:

```bash
# WRONG: git add docs/... _index.yaml index.html; git commit
# (root _index.yaml is stale, new card not in index)

# RIGHT:
cp dist/_index.yaml _index.yaml
cp dist/index.html index.html
git add docs/<slug>.html docs/<slug>.html.meta.yaml _index.yaml index.html
git commit -m "feat: ..."
git push origin main
```

## Detection

After any build, verify the new slug is in root `_index.yaml`:

```bash
grep -c "slug-name" _index.yaml
```

If it returns 0, the root file is stale — sync from `dist/`.

## fix-meta-shape `git show HEAD` fatal 但 build 仍成功（2026-07-14）

**现象**：
```
fatal: path 'docs/20260714-caveman-ai-token-saver.html.meta.yaml' exists on disk, but not in 'HEAD'
[build-site] wrote _index.yaml and injected index.html (565 cards)
```
`npm run build` 以 exit 0 结束，`dist/_index.yaml` 正确，`_index.yaml` 已同步，但脚本末尾 `git show HEAD:docs/...meta.yaml` 校验新文件时报 fatal。**判断标准**：只要输出 `wrote _index.yaml and injected index.html (N cards)` 且 `npm run verify` 通过，索引即正常。fatal 只是脚本内部 git 检查噪声，不影响构建结果。不要因此回退或废弃刚生成的正确文件。

---

## git rebase --skip 会丢弃整个 commit（2026-07-14）

**现象**：`git pull --rebase` 遇冲突后执行 `git rebase --skip`，当前分支 commit 被完全丢弃，working tree 中文件随之消失（即使已 git add）。

**高危场景：删除信息卡时**。删除卡片的典型操作序列：
```bash
git rm docs/<slug>.html docs/<slug>.html.meta.yaml
npm run build && cp dist/_index.yaml _index.yaml && cp dist/index.html index.html
git add _index.yaml index.html
git commit -m "chore: remove <slug> card"
git push  # → rejected → git pull --rebase
# 出现 CONFLICT（仅在 _index.yaml/index.html，HTML 文件本身无冲突）
git rebase --skip  # ← 危险！丢弃整个 commit，HTML 文件复活！
```

**根因**：rebase 冲突只在索引文件，HTML 文件本身无冲突。`--skip` 跳过当前 commit 后，删除操作（`git rm`）也随之消失，HTML 文件从 origin/main 重新出现。

**正确处理 rebase 冲突（删除卡场景）**：
```bash
git pull --rebase
# 出现 CONFLICT：_index.yaml/index.html only
# 确认本地工作区：docs/<slug>.html 已通过 git rm 标记删除
# 解决索引冲突：用 dist 最新版覆盖
cp dist/_index.yaml _index.yaml && cp dist/index.html index.html
git add _index.yaml index.html
# 不 git rebase --skip！直接：
git rebase --continue
```
这样 rebase 继续时，commit 中保留 `git rm` 操作，文件真正被删除。

**若已 skip 导致文件复活**：重新执行删除链即可：
```bash
git rm docs/<slug>.html docs/<slug>.html.meta.yaml
npm run build && cp dist/_index.yaml _index.yaml && cp dist/index.html index.html
git add _index.yaml index.html
git commit -m "chore: remove <slug> card"
git push
```

**教训**：rebase 冲突在 `_index.yaml`/`index.html` 时，不要假设 `--skip` 无害——它丢弃的是整个 commit，包括所有文件操作（增/删/改）。

---

## Amend-Fix Pattern (when you already committed without syncing)

```bash
cp dist/_index.yaml _index.yaml
cp dist/index.html index.html
git add _index.yaml index.html
git commit --amend --no-edit
git pull --rebase origin main   # if remote has new commits
git push origin main
```

## Rule

**Every single commit that adds a new card must include both `dist/` synced to root `_index.yaml` and `index.html`.** This is non-negotiable — no exceptions, no matter how small the change.
