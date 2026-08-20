# CI 自动 rebuild：从 docs/ 编辑已有卡片

## 核心机制

`pages.yml` CI 流程：
```
push main
  → actions/checkout
  → npm run build        # docs/ → dist/（build-site.js 从 docs/ 读取，写到 dist/）
  → npm run verify
  → npm run verify-taxonomy
  → actions/upload-pages-artifact (path: dist/)
  → actions/deploy-pages
  → smoke test dist/_index.yaml
```

**关键结论**：对于已有卡片，**不需要本地 build**，直接改 `docs/` 后 commit + push，CI 会自动：
1. 从 `docs/` 读取更新后的 HTML
2. 重新生成 `dist/`（含新 index data）
3. 重新部署

## 验证方式

编辑已有卡片后，不要对比本地和远程的 HTML 全文（容易因缓存、压缩、gzip 导致字节数不同）。正确方式是：

```bash
# 1. 检查 HTTP header（最可靠）
curl -sI "https://ccwq.github.io/infocard-pub/docs/<slug>.html" | grep "content-length\|last-modified"
# 应与本地 wc -c 结果完全一致

# 2. 检查 CI deployment SHA（确认哪个 commit 被部署）
# GitHub API: pages/builds → latest deployment sha

# 3. 用 Content-Length 验收（10/12 → 12/12 的关键区别）
curl -sI "https://ccwq.github.io/infocard-pub/docs/<slug>.html" | grep content-length
```

> ❌ 错误做法：下载完整 HTML 全文，用 Python grep 关键词，同时计算字节数。gzip 压缩会使 `curl | wc -c` 得到不同值。
> ✅ 正确做法：只查 HTTP header `content-length`，与本地 `wc -c` 直接比对。

## 症状：bytes 不一致但 CI success

- 本地 `wc -c` = 28055
- `curl | wc -c` = 24957（gzipped transfer）
- `curl -sI content-length:` = **28055** ✅（无压缩的 header 值）

CI 两次 `completed | success` 且 SHA `ec0734a` = 确认已部署最新版本。

## "已发布卡片内容扩充"的最小路径

对于这类任务（不新增 slug，只编辑已有 `docs/<slug>.html`）：
```
1. git checkout main && git pull origin main
2. 直接 patch docs/<slug>.html（插入新内容/修改旧内容）
3. git add docs/<slug>.html
4. git commit -m "feat: expand <slug> content"
5. git push origin main
6. sleep 30
7. curl -sI 公网URL | grep content-length  # 验收
```

**不需要**：本地 npm install / npm run build（CI 会自动做）。

## 适用条件

此规则仅适用于**已有 slug 的内容扩充**。新增 slug 仍需走完整 build 流程以确保 `_index.yaml` 和 `index.html` 正确更新。
