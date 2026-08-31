# Git 冲突恢复模式 — infocard-pub 发布场景

## 模式1：rebase 冲突导致 _index.yaml 冲突

**触发**：rebase 时 remote 有新 commit，本地也有新 commit，两者修改了 `_index.yaml`。

```bash
# 1. 保留远程版本（不手动合并）
git checkout --theirs _index.yaml

# 2. 重建索引（自动合并）
python3 scripts/rebuild_index.py

# 3. 标记冲突解决
git add _index.yaml

# 4. 继续 rebase（跳过冲突提交消息编辑）
GIT_EDITOR=true git rebase --continue
```

**简化写法**（无需 EDITOR）：
```bash
git checkout --theirs _index.yaml && python3 scripts/rebuild_index.py && git add _index.yaml && git commit --no-edit && git push
```

**关键**：不要手动合并 `_index.yaml`——rebuild_index 会根据 meta.yaml 重建，合并结果比手动更准确。

---

## 模式2：rebase 后处于 detached HEAD（`--theirs` 之后）

**触发**：`git rebase --continue` 失败（无有效命令），或 checkout 时意外进入 detached 状态。

**解法**：
```bash
git checkout main
git reset --hard origin/main   # 丢弃本地 rebase 状态，恢复到 remote
# 然后重新执行发布步骤（文件已恢复到工作区，rebuild_index 后重新提交）
```

**注意**：`--hard` 会丢失 rebase 中的本地 commit，文件内容需重新写入。

---

## 模式3：推送被 reject（fetch first）

**触发**：remote 有新 commit，本地尚未 pull。

```bash
git pull --rebase   # 拉取远程 + 变基本地
# 如果有冲突 → 进入模式1
git push
```

---

## 模式4：验证推送后的真实内容

**常见问题**：HTTP 200 不代表内容完整——GitHub Pages 可能返回缓存旧版本或部分截断。

```python
import urllib.request
url = "https://ccwq.github.io/infocard-pub/docs/YYYYMMDD-slug.html"
with urllib.request.urlopen(url, timeout=15) as r:
    body = r.read()
    # 1. 检查完整字节数
    print("SIZE", len(body))
    # 2. 检查关键内容
    print("HAS TeamCreate:", b"TeamCreate" in body)
    print("HAS Pipeline:", b"Pipeline" in body)
    # 3. 确认页脚存在
    print("TAIL:", body[-200:].decode("utf-8","ignore"))
```

**经验阈值**：
- 预期 size = 写入时的字节数（22126）
- size < 5000 通常意味着页面的 CSS/结构被截断或返回旧模板
- 推送后需等待 90~120 秒再验证（Pages 构建延迟）

---

## 模式5：Pages 可能回退旧版本

**触发**：推送后 HTTP 404 或内容仍为旧版本。

```python
import time
url = f"https://ccwq.github.io/infocard-pub/docs/YYYYMMDD-slug.html?t={int(time.time())}"
# 带时间戳强制 cache-bust，绕过浏览器缓存
```

---

## 流程图：发布决策树

```
推送被 reject？
├── Yes → git pull --rebase
│         └── 冲突？→ 模式1（--theirs + rebuild）
└── No → 等待 90s → curl 验证
          ├── 404？→ 等更久（90s → 180s）
          ├── size < 预期？→ 强制 cache-bust 再验证
          └── content 完整？→ DONE
```