# Git 工作树状态：并发终端命令会互相覆盖

## 问题

在 active repository root 下：

- 背景进程（如 Python HTTP 服务器）运行中，**不保护**工作树分支状态
- 后续在同一目录执行的任何 `git checkout`、`git fetch`、`git status` 等终端命令，**会重置**工作树到该命令指定的分支
- 同一个终端 session 中，后执行的命令覆盖先前的分支状态

## 案例（2026-07-08 迁移 PR）

```
# 主智能体切到 refactor 分支，准备 PR
git checkout -B refactor/ci-generated-index-artifacts
# 同时后台运行: python3 -m http.server 4174 -d dist
# ... 后续执行任意 git fetch / git checkout main ...
# 结果: 工作树回到 main，refactor 分支状态丢失
```

## 后果

- 精心准备的 patch（workflow 修改、index.html 清理等）**从工作树消失**
- 必须重新 apply 所有修改
- 分支 push 后 PR 创建时发现 HEAD 不对

## 安全做法

### 方案 A：不同目录隔离（推荐）

```bash
# 分支开发在独立 worktree
git worktree add ../infocard-pr-work refactor/ci-generated-index-artifacts
cd ../infocard-pr-work
# 所有操作在 worktree 中进行，不影响主仓库
```

### 方案 B：禁止在主仓库做分支切换

```bash
# 禁止在未验证的 primary checkout 直接执行
git checkout <branch>
git fetch <remote> <branch>
git pull
```

### 方案 C：用脚本一次性完成所有修改

将所有 patch 写入一个 Python 脚本（或 bash heredoc），一次性执行：

```bash
python3 - <<'PY'
# 所有文件修改在一个 Python 进程内完成
# 不存在中途被其他命令覆盖工作树状态的问题
PY
```

## 验证命令

```bash
git branch --show-current
git rev-parse HEAD
git status -sb
```

## 教训

- 背景进程不会锁定 git 分支状态
- 关键操作（commit 前 / push 前）必须再次确认分支状态
