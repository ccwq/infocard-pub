# CI Pages Deploy 失败排查模式

## 触发场景
GitHub Pages 部署后卡片返回 HTTP 404，但 GitHub 上文件确实存在（文件在 repo 里但 Pages 没部署）。

## 快速诊断流程

### 1. 检查最新 CI runs
```bash
curl -s "https://api.github.com/repos/ccwq/infocard-pub/actions/runs?per_page=3" \
  -H "Accept: application/vnd.github.v3+json" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); [print(r['id'], r['name'], r['status'], r['conclusion']) for r in d.get('workflow_runs',[])]"
```

### 2. 找到失败的 job 的失败步骤
```bash
# 替换 RUN_ID 为上一步得到的 ID
curl -s "https://api.github.com/repos/ccwq/infocard-pub/actions/runs/{RUN_ID}/jobs" \
  -H "Accept: application/vnd.github.v3+json" | \
  python3 -c "
import sys,json
d=json.load(sys.stdin)
for j in d.get('jobs',[]):
    for s in j.get('steps',[]):
        if s.get('conclusion') == 'failure':
            print('Failed step:', s['name'])
"
```

### 3. 常见失败原因 + 对策

| 失败步骤 | 根因 | 修复方式 |
|---------|------|---------|
| Verify committed generated artifacts | `_index.yaml` / `index.html` 修改后未提交 | 补提交 index 文件，push 触发重跑 |
| Ensure build does not mutate tracked files | build 脚本产生了未提交的产物变更 | 同上 |
| Deploy to GitHub Pages | 上一步失败导致跳过，非独立错误 | 先修 verify 步骤 |
| Smoke test deployed index | Pages 部署本身失败（网络 / artifact 问题） | 重跑 workflow |

### 4. 无 token 时强制重跑 CI
无法通过 API rerun（需要 token），只能：
1. 修复本地问题（补提交 index 文件）
2. `git push` 触发新 CI run
3. 等待 70-90s 后验证

### 5. 验证 Pages 部署成功的标准
不是 HTTP 200 就代表成功。要交叉验证：
1. `curl -sI https://ccwq.github.io/infocard-pub/docs/{slug}.html` → HTTP 200
2. GitHub Actions run `Deploy GitHub Pages` 结论为 `success`（不是 `skipped`）
3. `git diff --exit-code` 在 CI clean（意味着 index 文件已提交）

**关键信号**：如果 CI run 里 `Deploy GitHub Pages` 结论是 `skipped`，说明 verify 步骤失败了，此时 Pages 没有重新部署，文件存在但不可访问。

### 6. 本地等效验证（不依赖 token）
在 CI 失败后，本地执行 CI 的两个 gate：
```bash
cd /path/to/infocard-pub
npm run verify          # 等价于 CI "Verify committed generated artifacts"
git diff --exit-code    # 等价于 CI "Ensure build does not mutate tracked files"
```
两个都通过后 commit + push，CI 才能完整走完。

## 本次教训
- **必须 commit 所有 4 个文件**：card HTML + meta.yaml + _index.yaml + index.html
- 单独 commit card 文件会触发 CI git diff 失败，导致 Pages 跳过部署
- 修复：补提交 `_index.yaml` 和 `index.html` 即可，无需修改其他内容