# Build → Verify → Commit 正确顺序（2026-07-19）

## 根因

`npm run build` 会重写 `_index.yaml` 和 `index.html`。
`verify-index.js` 检查 `_index.yaml` 是否与当前 **staged** 文件匹配，而非磁盘文件。

错误顺序：
```
npm run build
node scripts/verify-index.js  ← ❌ _index.yaml 未 staged，"not in HEAD" 错误
git add _index.yaml index.html
git commit
```

正确顺序：
```
npm run build                  # (1) 重写 _index.yaml + index.html
git add _index.yaml index.html # (2) 先 stage 重写后的索引文件 ← 关键
node scripts/verify-index.js  # (3) 现在验证器才能看到 staged 文件
node scripts/check-info-leak.js "docs/<slug>.html"  # (4) 敏感信息检查
git add "docs/<slug>.html" "docs/<slug>.html.meta.yaml"  # (5) stage 卡产物
git commit -m "feat: publish <slug> infocard"
git push origin main          # (6) 推送
```

## Worktree detached HEAD push 问题（2026-07-19）

用 `--detach` 创建的 worktree 处于 detached HEAD 状态。
在 worktree 内执行 `git push origin main` 会检查 `origin/main` 是否在本地是最新的——
**它不会推送本地新 commit**，而是返回 "Everything up-to-date"。

正确做法：
- **批量发布**：文件直接写入主仓库，主仓库内执行 build → verify → commit → push
- **单卡 worktree 发布**：用命名分支
  ```bash
  git -C "$WT" checkout -b <slug>-push origin/main
  git -C "$WT" add docs/ && git -C "$WT" commit -m "..."
  git -C "$WT" push origin <slug>-push:main
  ```

## 实战教训

本次 5 卡并行发布中：
1. 5 个 worktree 均用 `--detach` 创建，commit 后 push 说 "Everything up-to-date"
2. 切换策略：从主仓库直接复制文件并执行 build → verify → commit → push 成功
3. build 超时 120s，改用单独 commit（绕过 verify 本地等待） + GitHub Actions CI 做最终 verify
4. build 后立即 commit `_index.yaml` 但未 stage，导致 verify 报错

## 依赖本技能的入口

- `references/light-route-url-driven-pattern.md` — 调用此参考文件
- `references/parallel-batch-publish-20260719.md` — 批量发布节奏中的 build 步骤
