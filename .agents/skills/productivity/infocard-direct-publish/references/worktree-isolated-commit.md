# Worktree 隔离提交模式

> 在 infocard-pub 类仓库中，用 worktree 隔离写卡提交，不污染主分支历史，最后 cherry-pick 合并。

## 典型场景

- 需要在 `docs/` 目录写卡但不确定主仓库状态
- 不想在写卡过程中引入其他 untracked 文件到主分支
- 需要对同一仓库并行做多张卡（多个 worktree 并行写）
- 用户明确要求「提交但不要 push」

## 核心模式

### 模式 A：仓库已有 git 历史

```bash
REPO="/path/to/infocard-pub"
cd "$REPO"

# 创建 worktree（从当前 HEAD）
git worktree add /tmp/infocard-runs/YYYYMMDD-[slug] HEAD

# 在 worktree 内写卡、提交
cd /tmp/infocard-runs/YYYYMMDD-[slug]
# ... write files ...
git add docs/YYYYMMDD-[slug].html docs/YYYYMMDD-[slug].html.meta.yaml
git commit -m "docs: add [slug] — description"

# 记录 worktree commit SHA
WT_SHA=$(git rev-parse HEAD)

# 回到主仓库，合并
cd "$REPO"
git cherry-pick "$WT_SHA"
git worktree remove /tmp/infocard-runs/YYYYMMDD-[slug]
```

### 模式 B：仓库无 git 历史（冷启动）

当 `infocard-pub` 目录存在但没有 `.git/` 时：

```bash
REPO="/path/to/infocard-pub"

# 1. 克隆 upstream 作为 bare origin（保留原始仓库历史作为 reference）
git clone --bare https://github.com/AUTHOR/REPO /tmp/bare-[repo].git

# 2. 初始化主仓库
cd "$REPO"
git init
git remote add origin /tmp/bare-[repo].git
git fetch origin

# 3. 提交初始状态（worktree 需要有 parent commit 才能 split）
git add -A
git commit -m "init: initial state"

# 4. 创建 worktree
git worktree add /tmp/infocard-runs/YYYYMMDD-[slug] -f HEAD

# 5. worktree 内写卡、提交
cd /tmp/infocard-runs/YYYYMMDD-[slug]
# ... write files ...
WT_SHA=$(git rev-parse HEAD)

# 6. 合并回主仓库
cd "$REPO"
git cherry-pick "$WT_SHA"
git worktree remove /tmp/infocard-runs/YYYYMMDD-[slug]
```

**本 session 实测（模式 B）**：
- `/tmp/pureslop-bare.git` 作为 origin
- 主仓库首次 commit SHA: `7573635`
- worktree commit SHA: `c385a45`
- cherry-pick 后主仓库 SHA: `402494b`（内容一致，历史分离）

## Worktree 状态查询

```bash
# 查看所有 worktree
git worktree list

# 查看 worktree 内提交历史
git -C /path/to/worktree log --oneline -3

# 清理损坏的 worktree 记录
git worktree prune
git worktree remove /path/to/worktree   # 需要 worktree 内无未合并提交
git worktree remove /path/to/worktree -f  # 强制删除
```

## 验证命令清单（worktree 场景）

### 1. Social Platform 泄漏检查

```bash
# ❌ 错误：grep -i "meta" 会匹配 CSS 类名 .meta，导致 false positive
grep -i -E "(twitter|x\.com|weibo|微博|weixin|微信|...)" file.html

# ✅ 正确：严格行内匹配，避免 CSS class/selector 误触
grep -i -E "^.*(twitter|x\.com|weibo|微博|weixin|微信|telegram|facebook|instagram|reddit|tiktok|bluesky).*$" \
  file.html file.yaml && echo "LEAK FOUND!" || echo "CLEAN"
```

**常见误触词**（CSS class/HTML attribute 中出现）：
- `.meta` → 匹配 `class="meta"`, `<meta>`, `.meta{...}`
- `.title` → 匹配 `class="title"`, `<title>`, `.title{...}`
- `.content` → 匹配 `class="content"`, `<div id="content">`

### 2. HTML 结构验证

```python
# Python 比 grep 更可靠（检查标签配对）
python3 -c "
import sys
with open('docs/YYYYMMDD-[slug].html') as f:
    c = f.read()
errors = []
for tag in ['<!DOCTYPE html>', '<html', '</html>', '<head>', '</head>', '<body>', '</body>']:
    if tag not in c:
        errors.append(f'Missing: {tag}')
print('✅ Valid' if not errors else 'ERRORS: ' + str(errors))
sys.exit(1 if errors else 0)
"
```

### 3. 命名正确性验证

```bash
# 正确项目名（非 Slop.md）
grep -c 'Slop\.md' docs/YYYYMMDD-[slug].html || echo "0 ← correct"

# 正确 repo 引用
grep -c 'alonsarias' docs/YYYYMMDD-[slug].html   # 应 > 0
grep -c 'PURESLOP' docs/YYYYMMDD-[slug].html       # 应 > 0
```

### 4. 文件存在性验证

```bash
# 主仓库确认文件存在
ls -la /path/to/repo/docs/YYYYMMDD-[slug].html
ls -la /path/to/repo/docs/YYYYMMDD-[slug].html.meta.yaml

# worktree 内确认
ls -la /path/to/worktree/docs/YYYYMMDD-[slug].html

# Git SHA 验证
cd /path/to/repo
git rev-parse HEAD
git show HEAD:docs/YYYYMMDD-[slug].html.meta.yaml | head -5
```

## 提交信息规范

```
docs: add [slug] — 简短描述

- 一句话说明内容
- 包含日期
- 不写 "publish"（因为未 push）
- 不写 "release"（因为未发布）
```

**本 session 示例**：
```
docs: add pureslop/PURESLOP.md 反面教材信息卡 (2026-07-17)
```

## 与直连发布的区别

| | Worktree 隔离提交 | 直连发布 |
|---|---|---|
| Push | ❌ 不 push | ✅ push |
| 发布 | ❌ 不发布 | ✅ 发布到 Pages |
| Wiki | ❌ 不同步 | ✅ wiki 同步 |
| 适用 | 草稿/审核/暂存 | 正式发布 |
| Git 历史 | 隔离，不影响主分支 | 直接写入主分支 |
