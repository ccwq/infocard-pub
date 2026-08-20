# infocard-pub 重新发布 / rebase 冲突恢复

适用场景：用户要求“重新发布”某张已上线信息卡，或 push 前后遇到 `_index.yaml` rebase 冲突。

## 核心原则

1. **重新发布要留下可见变化**
   - 对同一张卡的重发，优先做一个最小但可见的版本标记更新（例如 badge 从 `v1` 改为 `v2`）。
   - 这样能保证 HTML 产生新的发布痕迹，避免“看起来没变”的误判。

2. **只处理本次发布相关文件**
   - 卡片 HTML
   - `.meta.yaml`
   - `_index.yaml`
   - 其他工作区改动不要混入发布提交。

3. **遇到 `_index.yaml` 冲突，别手拼**
   - 冲突时直接用仓库内全部 `docs/*.meta.yaml` 重新生成 `_index.yaml`。
   - 不要手动保留/删除 conflict markers。

4. **rebase 前先清理无关脏文件**
   - 若工作区存在无关修改，先 stash/uncommit，避免 `git pull --rebase` 被阻塞。

## 推荐流程

### A. 重新发布同一张卡

1. 打开目标 HTML。
2. 做一个最小可见改动（如 `核验版` → `核验版 v2`）。
3. 如有需要，同步更新 `.meta.yaml` 的 `updated` 字段。
4. 重新生成 `_index.yaml`。
5. `git add` 相关文件。
6. `git commit`。
7. `git pull --rebase`。
8. 如有冲突，按下面的 B 处理。
9. `git push`。
10. 验证 raw 与 Pages 都是 200。

### B. `_index.yaml` rebase 冲突处理

1. 先停止手工编辑冲突块。
2. 用仓库里所有 `docs/*.meta.yaml` 重新生成 `_index.yaml`。
3. `git add _index.yaml`。
4. `GIT_EDITOR=true git rebase --continue`。
5. `git push`。
6. 验证 Pages 和 raw。

### C. 无关工作区文件阻塞 rebase

1. `git status --short` 看看哪些文件是无关改动。
2. 对无关改动 `git stash push -u`（或另开临时分支/临时提交）。
3. 完成 rebase/push 后再恢复这些改动。

## 归因与验证

- 发布成功的最低标准：
  - raw.githubusercontent.com 新内容可见
  - GitHub Pages 返回 200
  - `_index.yaml` 里能搜到新的 slug
- 若 Pages 与 raw 不一致，先怀疑部署刷新/索引同步，而不是直接改 HTML 结构。

## 常见坑

- 只改 HTML，不改任何可见版本标识，容易让“重新发布”缺少变化。
- `_index.yaml` 里手工合并冲突，容易把 `_sort_ts`、新 slug 或旧条目搞乱。
- push 前没有处理无关改动，`git pull --rebase` 会直接失败。
- 只验证 Pages 首页，不验证详情页和 `_index.yaml`，容易漏掉索引问题。

## 参考

- `references/index-audit-and-cache-verification.md`
- `references/current-channel-and-index-rebase.md`
- `references/github-pages-freeze-rebase.md`
- `references/infocard-pub-rebuild-index-trick.md`
