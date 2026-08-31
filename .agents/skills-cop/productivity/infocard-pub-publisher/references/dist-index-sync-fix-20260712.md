# `_index.yaml` 同步失败根因与修复 SOP

## 问题现象

每次 `npm run build` 后：
1. `dist/_index.yaml` 包含新提交的卡片 slug
2. 但 `git commit` 后 `_index.yaml`（根目录）没有更新
3. `git show HEAD:_index.yaml | grep slug` 返回 0
4. 公网 CDN `_index.yaml` 不含新卡片

**根本原因**：SOP v1.7 暂存精确门禁（`Task 6`）导致 dist/ 外的文件不会意外混入。但 dist/ 目录未被追踪，`git add .` 不会把 dist 内容加入暂存区。

## 正确工作流

每次 `npm run build` 后，必须执行：

```bash
# 步骤 1：npm run build
npm run build > /dev/null 2>&1 && npm run verify > /dev/null 2>&1 && echo "BUILD OK"

# 步骤 2：验证 dist/_index.yaml 包含新卡片
grep -c "new-slug" dist/_index.yaml

# 步骤 3：复制正确的索引到工作区
cp dist/_index.yaml _index.yaml
cp dist/index.html index.html

# 步骤 4：确认复制后的内容
grep -c "new-slug" _index.yaml

# 步骤 5：add + commit（含 _index.yaml 和 index.html）
git add docs/202607XX-new-card.html docs/202607XX-new-card.html.meta.yaml _index.yaml index.html
git commit -m "feat: publish ..."

# 步骤 6：push
git push origin main
```

## 已废弃的错误模式

### ❌ 只 add docs/ 文件，不含 _index.yaml
```bash
git add docs/202607XX-new.html docs/202607XX-new.html.meta.yaml
git commit  # _index.yaml 不在提交里 → 公网索引无新卡
```

### ❌ `git add .`
`.gitignore` 包含 `dist/`，所以 `git add .` 不会添加 dist 内容，也不会添加根目录 `_index.yaml`（因为未被追踪）。安全但无效。

### ❌ `git add _index.yaml index.html`（不复制）
根目录的 `_index.yaml` 可能是旧版本（上次构建前的快照），直接 add 无效。**必须先 cp dist/ 版本**。

## 修复已发布仓库的索引

如果已经 push 了不含 `_index.yaml` 的 commit：

```bash
# 1. 确认当前 HEAD 不含新卡片
git show HEAD:_index.yaml | grep -c "slug"  # 应该为 0

# 2. 复制正确的 dist 版本
cp dist/_index.yaml _index.yaml
cp dist/index.html index.html

# 3. amend 修正（无新 commit）或追加新 commit
git add _index.yaml index.html
git commit --amend --no-edit   # 修正上一个 commit
# 或
git add _index.yaml index.html
git commit -m "fix: sync _index.yaml with dist"  # 新 commit

# 4. pull --rebase（远程可能领先）
git pull --rebase origin main

# 5. push
git push origin main
```

**注意**：`--amend` 在远程已推进时会失败，此时必须 `pull --rebase` 后再 push。

## 预防措施

1. 始终把 `cp dist/_index.yaml _index.yaml && cp dist/index.html index.html` 写成固定步骤
2. 写 commit 前先 `grep -c slug dist/_index.yaml` 验证
3. 推送后立即 `git show HEAD:_index.yaml | grep slug` 验证
4. 公网 CDN 有几分钟延迟，HTTP 验证要等 15-30 秒

## 本次经验

- 每次 push 后的 CDN 同步时间约 5-30 秒（取决于 GitHub Pages 队列）
- 在 push 后 5 秒内 HTTP 返回 404 是正常的（等待 Pages 部署）
- 推送后 15-20 秒再验证，404 通常已变成 200
- `git show HEAD:_index.yaml | grep -c slug` 是最快验证方式（不依赖 CDN）
