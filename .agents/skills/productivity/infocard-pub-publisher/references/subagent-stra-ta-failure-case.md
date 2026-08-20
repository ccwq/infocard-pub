# Subagent 超时 → 项目不存在的 failure 案例

## 事件（2026-07-07）

| 项目 | StraTA |
|------|--------|
| 子智能体 | `deleg_77b4b3c1`（第1次）+ `deleg_ea3113b6`（第2次）|
| 耗时 | 两次均 600s 超时 |
| API 调用 | 13 次 |
| 产出 | 0（文件不存在）|
| 根因 | GitHub 上无此仓库；用户提供了错误/不存在的项目名 |

## 失败排查路径

```bash
# 1. 搜索 GitHub API（直接路径）
curl -s "https://api.github.com/repos/stra-ta/stra-ta"  # → 无数据

# 2. 搜索 GitHub API（模糊搜索）
curl -s "https://api.github.com/search/repositories?q=StraTA+language:Python&per_page=5"

# 3. 查 git history
git log --all -S 'StraTA' --oneline | head -10
git log --all --oneline | grep -i 'stra'

# 4. 搜索 wiki 和会话历史
session_search(query="StraTA")
```

## 决策树（新补充）

```
子智能体超时
  → 检查文件是否存在
    → 不存在
      → 检查 git status 有无 untracked 文件
        → 有 untracked → 按"文件存在"流程接手
        → 无任何文件 → 进入"项目不存在"分支
          → 排查路径走一遍（上方 4 步）
          → GitHub 无结果 → 询问用户提供正确的 GitHub URL
            → 用户确认正确链接 → 重派子智能体
            → 用户无法提供 → 停止，等待用户提供更多信息
```

## 教训

- **不要重复派发未知项目**：第一次超时且无文件产出，说明调研阶段已经失败；重复派发同样失败
- **13+ API 调用 = 调研阶段卡住**：做了大量 API 调用但零文件产出，说明调研循环内部卡住（网络/搜索），不是"调研足但写卡慢"
- **用户提供的 URL 是唯一可靠入口**：无法从项目名反推 GitHub 路径；必须用户提供有效链接
