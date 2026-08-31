# 子智能体超时接管模式（2026-07-13 实录）

## 触发模式

子智能体以 `status=timeout` 结束时，不代表零产出。典型场景：

- 子智能体已完成 HTML 写入、meta.yaml 生成
- 在 `git add` → `git commit` → `git push` 阶段卡住或超时
- 本地 Git 状态显示 commit 已完成，但远程未推送

## 判断流程

```
subagent 超时
  → 检查本地 Git log：是否有对应 commit SHA？
    → 是（commit 完成）：检查 HTTP 验收 → 手动 push
    → 否（commit 未完成）：检查工作区 HTML/meta 是否存在
      → 存在：主线程重建 commit + push
      → 不存在：完全重做
```

## 本次实测（2026-07-13）

| 卡 | Subagent 结果 | 实际状态 | 处理 |
|----|--------------|---------|------|
| Colibri | timeout (19 API calls, 600s) | commit 已完成 `c5aa03b` | HTTP 验收通过 ✅ |
| awesome-autoresearch | timeout (20 API calls, 600s) | HTML/meta 存在，未 commit | 主线程接手完成 ✅ |
| Codespaces | timeout (31 API calls, 600s) | commit 已完成 `c0b8c3c` | HTTP 验收通过 ✅ |

## 主线程接管检查清单

1. `git log --oneline -3` — 确认 commit 是否存在
2. `ls docs/<slug>.html` — 确认 HTML 是否存在
3. `curl -s -o /dev/null -w "%{http_code}" https://...html` — HTTP 验收
4. 若 commit 存在但未 push：`git push origin main`
5. 若 commit 不存在：主线程重建 HTML/meta → `npm run build` → commit → push

## 根因分析

子智能体超时通常卡在：
- GitHub API 核验（rate limit）
- Git push（网络不稳定）
- HTTP 验收轮询（超时阈值设置过低）

600s 是硬上限，但产出可能在 600s 内已完成（只是 push 卡住）。
