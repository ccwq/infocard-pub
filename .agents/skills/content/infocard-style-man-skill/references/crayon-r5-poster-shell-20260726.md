# R5 空间优化 & 合并卡片 Git 原子性教训

## R5 poster-shell 空间效率优化（2026-07-26）

**问题**：编号列 86px，数字本身仅占 30-40px，浪费 50%+；正文被限制在 max-width:560px，仅利用 60-70%；条目间距 50-70px，过于奢侈。

**修复（R5）**：

| 属性 | R4 | R5 | 效果 |
|------|-----|-----|------|
| `.skill-card` grid-template-columns | 86px | **56px** | −35% 列宽 |
| `.card-stripe` left | 72px | **48px** | 与 56px 编号列对齐 |
| `.card-body` padding | 16px 28px 16px 34px | **14px 28px 14px 28px** | 收紧 2-6px |
| `.card-title` margin-right | 28px | **0** | 正文全宽利用 |
| `.card-desc` max-width | 560px | **none** | 文字全宽流淌 |
| `.skill-card` min-height | 116px | **96px** | −17% 垂直空间 |

**核心原则**：编号列是锚定元素，不是填充元素。56px 足以容纳 01-09，不溢出。正文全宽是纸张思维，不是卡片思维。

## 合并多卡为一张时的 Git 原子性（2026-07-26）

**场景**：合并 A、B 两卡为 C，删除 A 和 B。

**失败模式**：
1. commit 含新增 C + 删除 A/B，但 push 失败（rejected：fetch first）
2. 另一个进程同时 push 了其他 commit
3. `git pull --rebase` 失败：旧文件 A/B 在 worktree 是 untracked 文件，会被远端 checkout 覆盖

**正确流程**：
```bash
# 1. 先删除本地旧文件（避免 untracked 阻塞 checkout）
rm -f docs/A.html docs/A.html.meta.yaml docs/B.html docs/B.html.meta.yaml

# 2. 在干净状态做 add + commit
git add -A
git commit -m "feat(card): 合并 A+B 为 C，删除旧卡"

# 3. push
git push origin main
```

**若 push 被 reject**：用 stash + fetch + reset 方案
```bash
# 保存新文件
cp docs/C.html /tmp/C.html
cp docs/C.html.meta.yaml /tmp/C.meta.yaml

# 强制 reset 到远端
git fetch origin && git reset --hard origin/main

# 重新写入（无旧文件残留）
cp /tmp/C.html docs/C.html
cp /tmp/C.meta.yaml docs/C.html.meta.yaml
rm -f docs/A.html docs/A.html.meta.yaml docs/B.html docs/B.html.meta.yaml

git add -A && git commit && git push
```

**教训**：合并+删除必须在同一个 commit 里完成，旧文件必须物理删除后再 add，不能只 `git rm --cached`。
