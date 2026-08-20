# 子智能体发布前 URL 验证规范

## 教训背景（2026-07-07）

- **StraTA**：用户说"StraTA"，没有给 GitHub 链接。
- 子智能体搜索 GitHub API，找不到 `stra-ta/stra-ta`，也没有 `StraTA` 相关仓库。
- 子智能体花了 600s × 2 次才超时放弃，浪费了约 20 分钟。
- **根因**：没有在派发前验证 URL 可达性。

## 规范

**收到发布信息卡任务时**：

1. **用户必须提供 GitHub URL**。如果只提供项目名/描述，必须先用 GitHub API 搜索验证仓库存在，再派发子智能体。
2. **URL 验证命令**（派发前执行）：
   ```bash
   curl -sL https://api.github.com/repos/<owner>/<repo> | python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"✅ {d.get('full_name')} | {d.get('stargazers_count')}★\" if d.get('full_name') else \"❌ not found\")"
   ```
3. **验证 README 可达**：
   ```bash
   curl -sL -o /dev/null -w "%{http_code}" https://raw.githubusercontent.com/<owner>/<repo>/main/README.md
   # 必须返回 200
   ```
4. **只有在两步都通过后才派发子智能体**。

## 常见陷阱

- 用户给 Twitter/X 链接（需要登录，无内容）→ 询问内容或替代 URL
- 用户只给项目名 → 先搜索 GitHub API 确认仓库
- 用户给 `github.com/user/repo` 但仓库是 private/不存在的 → 验证阶段就会发现

## 响应模板（当 URL 不可达时）

> "无法访问这个链接，能提供具体的 GitHub 仓库地址吗？"
