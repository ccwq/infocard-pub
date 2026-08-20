# Worktree 隔离草稿模式

在 `infocard-pub` 仓库中，**草稿阶段使用独立 worktree** 隔离，避免污染 `main`。

## 典型流程

```bash
# 从 origin/main 创建独立 worktree（不污染本地 main）
cd ~/infocard-pub              # 或实际路径
git worktree add \
  /tmp/infocard-runs/YYYYMMDD-slug \
  origin/main \
  -b YYYYMMDD-slug

# 在 worktree 内工作
cd /tmp/infocard-runs/YYYYMMDD-slug
# ... 创建卡片、运行门禁、提交 ...

# 确认 SHA 后，主线程从 worktree 目录推送
git log -1 --format="%H %s %ci"
```

## 关键约束

| 约束 | 说明 |
|------|------|
| 基于 `origin/main` | 确保 worktree 分支起点干净 |
| 命名约定 | `/tmp/infocard-runs/YYYYMMDD-<topic>` |
| push 由主线程控制 | worktree 阶段不 push，只 commit |
| 产物必须含 MD | 同步生成 `.md` 报告文件 |

## 何时用 worktree vs 直接在仓库内分支

| 场景 | 推荐方式 |
|------|---------|
| 用户要求"不要 push，只 commit" | 必须 worktree 隔离 |
| 主线程负责发布 | worktree + 主线程 push |
| 快速修复 / 小更新 | 直接在仓库内分支 |
| 多卡片并行草稿 | 每个用独立 worktree |

## 验证命令（在 worktree 内）

```bash
cd /tmp/infocard-runs/YYYYMMDD-slug
git log -1 --format="%H"                    # 确认 commit SHA
npm run build && npm run verify && npm test && npm run check-leak  # 重跑门禁
```

## 完成后清理

```bash
# 合并到 main 后（或放弃草稿），删除 worktree
git worktree remove /tmp/infocard-runs/YYYYMMDD-slug
```
