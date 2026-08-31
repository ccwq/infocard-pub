# Worktree 父仓库消失时的恢复流程

## 症状

```
历史现场值（不可复制执行）：fatal: not a git repository: /home/ccwq/infocard-pub/.git/worktrees/wt-pake
```

`git status`、`git log`、`npm run build`（内部调用 `scripts/sync-build-timestamps.js`）全部报错。

## 根因

本仓库是通过 `git worktree add` 创建的 worktree。`.git` 文件内容为：

```
gitdir: /parent/repo/.git/worktrees/<worktree-name>
```

当父仓库被删除或移动时，这个路径不再存在，Git 无法找到仓库根目录。

## 诊断

```bash
cd /path/to/worktree
cat .git
# 输出类似：gitdir: /path/to/parent/.git/worktrees/my-branch
# 验证父目录是否存在：
ls /path/to/parent/.git 2>/dev/null && echo "parent exists" || echo "parent GONE"
```

## 恢复路径（完整步骤）

### 1. 删除损坏的 gitlink，重建为独立仓库

```bash
cd /path/to/worktree
rm .git
git init
git branch -m master main  # 如果 workflow 期望 main
```

### 2. 添加远程并推送

**情况 A**：远程仓库已存在
```bash
git remote add origin https://github.com/<owner>/<repo>.git
git push -u origin main
```

**情况 B**：远程仓库不存在（首次推送）
```bash
gh repo create <repo> --public --source=. --push
# 注意：gh create 可能成功但 remote 添加失败（报错 "Unable to add remote"）
# 失败后手动添加：
git remote add origin https://github.com/<owner>/<repo>.git
git push --force origin main
```

### 3. 启用 GitHub Pages（否则 pages.yml 部署失败）

```
Error: Get Pages site failed. Please verify that the repository has Pages enabled
```

**原因**：新创建的仓库 Pages 默认关闭，`actions/configure-pages@v5` 找不到站点。

**修复**：
```bash
gh api repos/<owner>/<repo>/pages --method POST \
  -f build_type=workflow \
  -f source[branch]=main \
  -f source[path]=/
```

### 4. 触发 Pages 部署

```bash
gh workflow run pages.yml --repo <owner>/<repo>
# 或等下次 push 自动触发
```

## 验证

```bash
# 检查 Pages 状态
gh api repos/<owner>/<repo>/pages
# 应返回 "build_type": "workflow", "html_url": "https://<owner>.github.io/<repo>/"

# 等待约 30s 后验证公网访问
curl -s "https://<owner>.github.io/<repo>/_index.yaml" | grep -c "slug:"
# 预期：> 0
```

## 注意事项

- **删除 `.git` 前**：确认 worktree 中无未合并的重要提交（父仓库消失意味着无法通过正常流程合并）
- **`gh repo create` 的 remote 失败**不是致命错误，只是 remote 没添加成功，手动 `git remote add` + `git push --force` 即可
- **Pages 启用必须在首次 push 之后**，否则 pages.yml 的 `Setup Pages` step 会 404
