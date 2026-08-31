---
name: infocard-build-and-deploy
description: "build 超时时直接 push 源码，Actions 自动构建；index.html 锚点恢复用 febcfee。"
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, build, deploy, github-actions]
    related_skills: [infocard-publish-sop]
---

## When to Use

触发条件：`npm run build` 超时（>2 分钟）、报错 `missing #app anchor for home-index-data injection`，或本地构建阻碍发布进度。

### npm run build 超时 → 直接 push 源码

**Local build can timeout in two execution contexts:**
1. `terminal`: `npm run build` or `node scripts/build-site.js` times out (>120s) — common when `copyStaticTreeToDist()` copies 799+ files
2. `execute_code`: Python subprocess sandbox has a 120s hard cap and returns `subprocess.TimeoutExpired` — `build-site.js` is a Node.js script, not a shell wrapper, so it runs fine in `terminal` but times out in `execute_code`

**Correct path (always):**
```bash
# Stage → commit → push (no local build needed)
REPO_ROOT="$(git rev-parse --show-toplevel)" || exit 1
cd "$REPO_ROOT"
git add docs/<slug>.html docs/<slug>.html.meta.yaml _index.yaml index.html
git commit -m "feat: add <slug> infocard (YYYY-MM-DD)"
git push origin main

# Wait for GitHub Actions + Pages deploy (~45s)
sleep 45

# Verify HTTP 200
curl -sI --max-time 15 "https://ccwq.github.io/infocard-pub/docs/<slug>.html" | head -1
```

GitHub Actions has its own build pipeline — the `copyStaticTreeToDist()` work is done by Pages automatically. The local build step is entirely skippable when pushing source.

### npm run build 超时 exit 124 ≠ 构建失败

**现象**：`npm run build` 超时返回 exit 124，但实际构建产物已生成。

**判断方法**：检查 `git status --short docs/<slug>.html` — 如果文件显示 `M`（modified staged），则构建实际成功，直接 `git add + commit + push` 即可，无需重新 build。

### Git commit 遭遇并发锁

**现象**：`git commit` 报错 `Unable to create '/path/to/.git/index.lock': File exists`，来自另一个正在运行 `git push` 的后台进程。

**解法**：
```bash
# 1. 等待后台 push 完成
ps aux | grep -E "git (push|send-pack|pack-objects)" | grep -v grep
# 重复直到返回空（通常 60-120s）

# 2. 清除锁
rm -f "$REPO_ROOT/.git/index.lock"

# 3. 重试 commit + push
git add docs/<slug>.html docs/<slug>.html.meta.yaml _index.yaml
git commit -m "feat: ..."
git push
```

### index.html 锚点恢复

**报错**：`index.html missing #app anchor for home-index-data injection`

**原因**：源码 `index.html` 锚点被覆盖，从 `<div id="app" class="app-shell"></div>` 变成 `<main id="app">`

**恢复**：
```bash
cd /path/to/infocard-pub
git checkout febcfee -- index.html
grep 'app-shell' index.html  # 验证：应返回 <div id="app" class="app-shell"></div>
```

**诊断**：
```bash
# 检查当前 HEAD
git show HEAD:index.html | wc -l
# ~313 行 → 被覆盖；~25000 行 → 正常

git show HEAD:index.html | grep -c 'home-index-data'
# 0 → 被覆盖；1 → 正常
```

**锚点来源**：`febcfee`（带 home-index-data 的最新完整版）。

### 公网验收
```bash
curl -s https://ccwq.github.io/infocard-pub/docs/<slug>.html | grep -c 'href='
# 预期：从 1 增长到预期数量
```

## Deprecated compatibility entry

此旧入口仅作兼容转发，替代入口为 `infocard-publish-pipeline#build`。没有有效质量通过结果和发布授权时不得执行构建或部署副作用。
