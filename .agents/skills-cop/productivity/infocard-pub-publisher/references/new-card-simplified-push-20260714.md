# 新增 slug 的简化发布流程（2026-07-14 实录）

## 问题

主线程新增 slug 时走以下流程会导致 rebase 冲突：

```bash
npm run build  # 生成本地 _index.yaml
git add docs/new.html docs/new.meta.yaml
git add _index.yaml index.html   # ← 这两行会引发 rebase 冲突
git commit
git push origin main
git pull --rebase origin main   # ← fatal: _index.yaml 冲突
```

典型错误信息：
```
fatal: path 'docs/xxx.html.meta.yaml' exists on disk, but not in 'HEAD'
[build-site] wrote _index.yaml and injected index.html (N cards)
# rebase 时：
CONFLICT (content): Merge conflict in _index.yaml
```

**这个问题今天（2026-07-14）重复出现 4 次。**

## 根因

本地 `npm run build` 生成了包含新卡的 `_index.yaml`，commit 后 push 时与远程最新 `_index.yaml` 冲突（远程 CI 也在 push）。rebase 无法自动合并。

## 正确做法

**不要 commit 根级 `_index.yaml` 和 `index.html`**，让 CI 来处理 build。

```bash
# 1. 写 docs/*.html + docs/*.meta.yaml
# 2. git add 只加 docs/ 下的文件
git add docs/20260714-new-slug.html docs/20260714-new-slug.html.meta.yaml
# 3. 直接 commit（不碰 _index.yaml 和 index.html）
git commit -m "feat: publish <slug>"
# 4. push
git push origin main
# 5. CI 自动完成：
#    - 从 docs/ 重新 build
#    - 生成 dist/_index.yaml 和 dist/index.html
#    - 部署 GitHub Pages
```

`pages.yml` CI 在每次 push main 后自动触发：
```yaml
- run: npm run build  # 从 docs/ 读取，写到 dist/
- uses: actions/deploy-pages
```

## 验证步骤

push 后等待约 25-30s（CI build + deploy），然后：

```bash
sleep 25 && curl -s -o /dev/null -w "%{http_code}" "https://ccwq.github.io/infocard-pub/docs/<slug>.html"
```

第一次可能是 404（CDN 传播延迟），第二次才是 200。

## 何时需要本地 build

- 需要本地检查 `_index.yaml` 是否包含新卡：`grep slug _index.yaml`
- 但 **不要** `git add _index.yaml index.html`

## CDN 传播时间参考

| 时间 | HTTP 状态 |
|------|-----------|
| push 后 10s | 404 |
| push 后 25s | 404 |
| push 后 30s | 200 ✅ |

实际时间随 CI build 速度波动，通常 25-35s。

## 完整正确流程

```bash
# 1. 写 HTML + meta.yaml
write_file docs/20260714-slug.html
write_file docs/20260714-slug.html.meta.yaml

# 2. npm run build（仅生成 _index.yaml 用于本地验证，不 commit）
npm run build 2>&1 | tail -3
grep "slug" _index.yaml  # 确认包含新卡

# 3. git add 只加 docs/ 文件
git add docs/20260714-slug.html docs/20260714-slug.html.meta.yaml
git commit -m "feat: publish slug (theme) — description"

# 4. push（CI 会自动 rebuild + deploy）
git push origin main

# 5. 等待 CDN
sleep 30

# 6. 验收
curl -s -o /dev/null -w "%{http_code}" "https://...html"  # 期望 200
curl -s "https://...html" | grep "<title>"
```
