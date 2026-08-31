# GitHub Pages 路径陷阱

## 问题

当 HTML 文件位于 `docs/YYYYMMDD-slug.html` 时，相对路径 `../assets/img/...` 在本地浏览器可以正确解析，但在 GitHub Pages 部署时会 404。

**原因**：GitHub Pages 将 `docs/` 目录作为站点根目录（而不是仓库根目录），所以 `docs/foo.html` 的 `../assets/...` 指向 `https://{user}.github.io/{repo}/assets/...`，而实际文件在 `https://{user}.github.io/{repo}/docs/assets/...` 或其他路径。

## 验证方法

```bash
BASE=https://{user}.github.io/{repo}
# 相对路径（预期 404）
curl -o /dev/null -w '%{http_code}' "${BASE}/docs/../assets/img/slug/x-post.jpg"
# 绝对路径（预期 200）
curl -o /dev/null -w '%{http_code}' "${BASE}/assets/img/slug/x-post.jpg"
```

## 修复

所有 `<img src>` 和 `<a href>` 使用**完整 CDN 绝对 URL**，禁止 `../` 相对路径：

```html
<!-- ❌ 错误：相对路径在 GitHub Pages 下 404 -->
<img src="../assets/img/sensenova-u1-infographic-v3-x/x-post.jpg">

<!-- ✅ 正确：完整 CDN 绝对 URL -->
<img src="https://{user}.github.io/{repo}/assets/img/sensenova-u1-infographic-v3-x/x-post.jpg">
```

## 适用场景

- `docs/` 目录下的 HTML 引用的图片（`assets/img/`）
- `docs/` 目录下的 HTML 引用的其他 `docs/` 文件（改用绝对 URL）
- 任何在 HTML 中硬编码的相对路径引用

## 预防检查（发布前必做）

```bash
BASE=https://{user}.github.io/{repo}
DOC=docs/YYYYMMDD-slug.html

# 1. 确认 HTML 中 img src 是绝对 URL
grep 'img src=' <(curl -sS "${BASE}/${DOC}")

# 2. 确认图片 CDN 直接访问 200
curl -o /dev/null -w '%{http_code}' "${BASE}/assets/img/slug/x-post.jpg"
```

## 相关案例

- 2026-07-18：SenseNova U1 V3 信息卡（`sensenova-u1-infographic-v3-x`），演示图 404 → 改用绝对 URL 后修复
