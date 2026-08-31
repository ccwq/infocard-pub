# git pull 被 untracked 文件阻挡的救援流程

**问题**：远端有更新，本地 pull 时报错：
```
error: The following untracked working tree files would be overwritten by merge:
    docs/20260709-longcat-video-avatar.html
Please move or remove them before you merge.
```

**根因**：本地存在 untracked 文件（如子智能体未提交的临时 HTML），远端 pull 会覆盖同名文件，git 主动阻止。

**正确处理流程**：

1. **先确认 untracked 文件是否需要保留**
   - 若是本会话生成的半成品 → 需要保留
   - 若是旧会话残留垃圾 → 直接删除

2. **保留场景 → 移到临时目录，等 pull 完再移回**
   ```bash
   mv docs/20260709-longcat-video-avatar.html /tmp/
   mv docs/20260709-longcat-video-avatar.meta.yaml /tmp/
   git pull --rebase
   # pull 成功后验证内容完整性
   mv /tmp/20260709-longcat-video-avatar.html docs/
   mv /tmp/20260709-longcat-video-avatar.meta.yaml docs/
   ```

3. **不保留场景 → 直接删或用 git clean**
   ```bash
   rm docs/20260709-longcat-video-avatar.html
   git pull --rebase
   ```

4. **不要用 git stash**：untracked 文件不在 stash 范围内，会报错 "pathspec did not match any file(s) known to git"。必须用 `mv` 物理迁移。

**验证 pull 结果**：
```bash
git log --oneline HEAD..origin/main   # 应为空（无落后提交）
git status -sb                        # 应显示 "main...origin/main [up to date]"
```

**关键教训**：子智能体生成的文件若未 stage，本地 pull 前必须主动检查 untracked 冲突；不让 git 替我们发现，否则中断发布链路。
