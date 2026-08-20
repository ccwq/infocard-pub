# 子智能体超时接管参考（2026-07-07）

## 经验数据

- 超时阈值：600s
- 子智能体通常在 14-26 次 API 调用后超时
- **即使超时，HTML/meta 文件通常已写好**（常见卡点：git push 或 wiki push）
- API 调用 ≥ 15 次的超时：文件通常已完整；< 5 次的超时：需要重新调研

## 超时后接管三步

```
1. 检查文件: ls docs/2026070x-{slug}*
2. 检查 git:  git log --all --oneline | grep {slug}
3. 判断情况:
   ├── 已在 origin/main → 验收 + wiki sync
   ├── 本地有 commit 未 push → node scripts/build-site.js && push
   └── 文件未写 → 用户决定
```

## 关键诊断命令

```bash
# 判断文件是否在 origin/main（同一 commit SHA 或其他 commit 包含）
git log origin/main --oneline | grep {slug}

# 判断本地 HEAD 是否领先远端
git log --oneline -3          # 本地 HEAD
git log origin/main --oneline -3  # 远端

# 如果本地领先 1 个 commit 但 push 说 up-to-date
# → 说明 commit 已在远端，但本地 HEAD 指向旧 commit
# → 检查 git branch 显示的当前分支
git branch -v

# 最终确认：commit 是否在 origin/main 历史中
git branch -a --contains <commit>
```

## gstack 案例（2026-07-07）

- 子智能体超时，但 commit `7b94790` 已写入本地
- `git log --all --oneline` 显示 commit 在本地历史中
- `eaa322a`（origin/main 最新）是 3 张卡合并 commit，包含 gstack
- **结论**：gstack 文件已通过 `eaa322a` 入 origin/main，无需额外 push
- Pages 验证：HTTP 200 ✅

## 教训

- 不要只看 `git log --oneline -3`（只显示当前分支最近 3 个）
- 用 `git log --all --oneline | grep <slug>` 全局搜索
- 用 `git branch -a --contains <commit>` 确认 commit 是否在目标分支

## 新文件未 git add 导致 git diff 干净（2026-07-07 新发现）

当子智能体写好了 HTML/meta 文件但从未执行 `git add`（文件全新，未被 git 跟踪）：
- `git diff --name-only` 和 `git status -s` 都可能显示为空
- `ls docs/20260707-{slug}*` 能看到文件存在，但 git 不知道

### 判断标准

```bash
# 1. 文件存在？
ls docs/20260707-{slug}*

# 2. commit 是否包含该 slug？
git log --all --oneline | grep {slug}

# 3. commit 是否在 origin/main 历史中？
git branch -a --contains <commit_sha>
```

### 强制添加并推送

当确认文件存在但未在 origin/main 历史时：

```bash
# 方法A：git add -u（只追踪已跟踪文件的变化，不管新文件）
git add -u

# 方法B：git add -f（强制添加，包括新文件）
git add -f docs/20260707-{slug}.html docs/20260707-{slug}.html.meta.yaml

# 如果 add 后有内容 → commit 并 push
git commit -m "feat: publish {slug} infocard"
git push origin main
```

## 超时后接管决策树（2026-07-07 更新版）

```
子智能体超时（600s）
  ↓
文件存在？ ─否→ 用户决定是否重试
  ↓是
commit 在 origin/main 历史中？ ─是→ 验收 + wiki sync
  ↓否
commit 在本地但未 push？
  ├─ git diff 干净 + 文件存在 → git add -u && commit && push
  └─ 有未跟踪新文件 → git add -f && commit && push
  ↓
推送后 Pages 持续 404？
  └─ 本地 diff 干净 → git commit --allow-empty && push（重跑 CI）
```

## Node.js 兼容性问题

- `npm run build` / `npm run verify` 在 Node.js v24.15.0 下失败
- **解决**：直接调用脚本
  ```bash
  node scripts/build-site.js     # 等价于 npm run build
  node scripts/verify-index.js  # 等价于 npm run verify
  ```

## 2026-07-13 新增：超时≠零产出，commit 往往已完成

三张卡（Colibri/c5aa03b、Codespaces/c0b8c3c、awesome-autoresearch）subagent 均超时（600s），但 commit 已在 origin/main。

| 场景 | 根因 | 处理 |
|------|------|------|
| commit 已在 origin/main（HTTP 200） | push 完成，超时在等 CI/日志确认 | 直接验收，无需操作 |
| commit 在本地未 push，HTML/meta 完整 | push 未执行或中途断开 | 主线程接管：build + push |
| HTML/meta 不完整 | 调研/写作阶段未完成 | 用户决定是否重试 |

**关键诊断（简化版）**：
```bash
cd ~/hehome/hermes-data/home/qbox/opendir/project/infocard-pub
ls docs/2026071x-{slug}*
git log --oneline origin/main | grep {slug}
curl -o /dev/null -w "%{http_code}" "https://ccwq.github.io/infocard-pub/docs/2026071x-{slug}.html"
```

**接管决策**：
1. 文件存在 + origin/main 有 commit → HTTP 验收 ✅
2. 文件存在 + 无 commit → 主线程接管：npm run build → git add → commit → push → HTTP 验收
3. 文件不存在 → 用户决定

**主线程接管模板**：
```bash
npm run build && cp dist/_index.yaml _index.yaml && cp dist/index.html index.html
git add docs/YYYYMMDD-{slug}.html docs/YYYYMMDD-{slug}.html.meta.yaml _index.yaml index.html
git commit -m "feat: add {slug} ({theme})" && git push origin main
sleep 15 && curl -o /dev/null -w "%{http_code}" "https://ccwq.github.io/infocard-pub/docs/YYYYMMDD-{slug}.html"
```
