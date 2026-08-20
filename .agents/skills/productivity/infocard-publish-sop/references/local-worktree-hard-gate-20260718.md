# 本地发布硬门禁：worktree、索引与 CDN 判定

## 适用

适用于 schema-v3 bundle 驱动的信息卡发布，以及发布后详情页/首页 404、缺入口的排障。

## 已验证的执行契约

在 `repository.root` 指向的专用 publish worktree 中运行：

```bash
npm run verify:publish-local-gate -- --bundle <bundle> --phase prebuild
npm run build
npm run verify:publish-local-gate -- --bundle <bundle> --phase postbuild
```

`repository.root` 必须是绝对路径；拒绝 `.` 等相对值，防止 bundle 在不同当前目录指向不同 worktree。

### prebuild 阻断项

- 当前目录不等于 bundle 声明 worktree；
- root 不是 Git worktree；
- sidecar 含多个 YAML document；
- `slug`、`path`、`category`、`title`、`desc`、`date`、`updated`、`tags` 缺失；
- sidecar 的 slug/path/category 与 bundle 不一致；
- desc 不是有效中文摘要。

### postbuild / pre-cdn 阻断项

除 prebuild 外，必须解析而非字符串搜索：

- `_index.yaml.cards` 中存在目标 slug，且 path 等于 bundle html_path，title/desc 非空；
- `index.html` 中的 `<script id="home-index-data" type="application/json">` 可解析，且其中目标条目也满足 slug/path/title/desc 条件。

不得以 HTML 注释、标题或任意自由文本出现 slug 作为公开入口证据。

## 线上异常排障顺序

1. 先确认远端内容 commit 含 HTML、sidecar、`_index.yaml`、`index.html`；
2. 在该 publish/recovery worktree 运行 `--phase pre-cdn`；
3. 再对公网详情页、`_index.yaml`、首页做有界退避；
4. 仅步骤 1–2 都通过且公网仍未刷新时，才可标记 `PUBLISHED_PENDING_CDN`。

不能因首次 404 重复 push；本地/远端证明失败时，在同一 worktree 或可追溯 recovery worktree 修复并完整重跑门禁。

## 清理

清理前运行：

```bash
npm run verify:publish-local-gate -- --bundle <bundle> --phase cleanup
```

若 `git status --porcelain` 非空，保留 worktree 与恢复信息；没有用户明确授权不得 `git worktree remove --force`。
