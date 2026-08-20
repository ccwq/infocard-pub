# _index.yaml 冲突解决模式

## 症状

GitHub Actions 的 `index.yml` workflow 会自动推送 `_index.yaml` 更新。如果本地有未推送的 _index.yaml 修改，git push 会失败并出现 `fetch first` 错误。

如果尝试 `git pull --rebase` 解决，会遇到三方冲突标记（`<<<<<<< HEAD` 等），且文件中有多处冲突标记。

## 正确解决流程

### Step 1: 中止所有 rebase/merge

```bash
git rebase --abort 2>/dev/null
git merge --abort 2>/dev/null
```

### Step 2: 获取远程最新 _index.yaml

```bash
git fetch origin
git show origin/main:_index.yaml > /tmp/remote_index.yaml
```

### Step 3: 在远程版本上修复

```python
import yaml

with open('/tmp/remote_index.yaml') as f:
    d = yaml.safe_load(f)

cards = d['cards']

# 修复：缺失 slug 的卡片（常见于旧格式卡片）
for c in cards:
    if not c.get('slug'):
        if 'subagent' in c.get('title', ''):
            c['slug'] = '20260525-subagent-matrix'
            c['category'] = 'docs'
        # 可添加其他已知修复规则

# 添加：新卡片（如果不在列表中）
slugs = [c.get('slug') for c in cards]
NEW_SLUG = '20260528-xianyu-slang'
if NEW_SLUG not in slugs:
    cards.insert(0, {
        'slug': NEW_SLUG,
        'path': 'docs/20260528-xianyu-slang.html',
        'category': 'docs',
        'title': '卡片标题',
        'date': '2026-05-28',
        'tags': ['tag1', 'tag2'],
        '_sort_ts': 1779941830  # 用当前时间戳或从 git log 读取
    })

d['_count'] = len(cards)
with open('_index.yaml', 'w') as f:
    yaml.safe_dump(d, f, allow_unicode=True, sort_keys=False)
```

### Step 4: 硬重置到远程 + 提交修复

```bash
# 放弃本地所有修改，以远程为准
git reset --hard origin/main

# 重新修改（Python 脚本已写入本地 _index.yaml）
git add _index.yaml
git commit -m "chore: add <slug> to index + fix missing slug"
git push
```

### 为什么不用 rebase

Rebase 在 _index.yaml 有多处冲突时极难手动解决（冲突标记出现在多个位置，包括 _updated、_sort_ts）。`reset --hard + 本地修复` 流程只需一次 commit，更干净。

## 防止未来冲突

workflow 的 `index.yml` 已配置 `contents: write` 权限，在每次 push 后自动将 `_index.yaml` commit 回仓库。这会持续产生远程与本地的分叉。

**最佳实践**：发布信息卡时，始终从 origin/main 拉取最新 _index.yaml 作为起点再修改，不要在本地基于旧版本修改。

## _sort_ts 规则

workflow 从 git commit timestamp 读取 _sort_ts。本地手动添加的卡片可以用：

```python
import time
sort_ts = int(time.time())
# 或从 git 读取文件最近 commit 时间
import subprocess
ts = subprocess.check_output(['git', 'log', '-1', '--format=%ct', '--', 'docs/new-card.html'], text=True).strip()
sort_ts = int(ts)
```