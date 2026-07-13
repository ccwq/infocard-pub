# Repository Guidelines

## 项目结构与内容模型

本仓库通过 GitHub Pages 发布静态信息卡。主要内容放在 `docs/`：使用 `docs/YYYYMMDD-slug.html` 或 `docs/YYYYMMDD-slug/index.html`。每张已发布卡片都必须有同名 `.meta.yaml`，其中的 `path` 必须与实际发布路径完全一致。

`scripts/` 存放 Node 构建、校验、taxonomy 与发布辅助脚本；`scripts/test/` 是 Node 原生测试。复用资源位于 `assets/`，视觉模板位于 `theme/`，PWA 入口为 `sw.js` 与 `manifest.json`。

## 构建、测试与本地开发

- `npm run build`：补齐缺失的元数据日期，生成 `_index.yaml`，并向根目录 `index.html` 注入索引数据。
- `npm run verify`：校验索引产物、卡片文件与元数据的一致性。
- `npm test`：运行 `scripts/test/` 中的 Node 原生测试。
- `npm run fix-taxonomy && npm run verify-taxonomy`：修改卡片后补全并校验 taxonomy。
- `npm run check-leak`：扫描敏感信息；出现 `CRITICAL` 或 `HIGH` 必须修复后才能发布。
- `npm run preview:source`：在 `http://localhost:4173` 预览源码；需要检查 `dist/` 时运行 `npm run preview`。

## 代码风格与命名

遵循相邻 HTML、CSS 与 JavaScript 文件的既有风格。slug 和文件名使用语义明确的 kebab-case，例如 `20260713-agent-browser-guide.html`。元数据日期始终加引号，如 `"2026-07-13 09:30:00"`，避免 YAML 类型误判。脚本应小而专注，CLI 参数清晰。

不要手动修改 `_index.yaml` 或 `index.html` 中生成的 `home-index-data`；必须通过构建生成。

## 测试与发布

修改卡片或元数据后，依次运行 `npm run build`、`npm run verify`、`npm run verify-taxonomy` 与 `npm run check-leak`。修改脚本行为时，在 `scripts/test/` 补充或更新聚焦的 `*.test.js`。提交 PR 前确认本地卡片路径可访问、首页可见。

## 提交与 Pull Request

采用历史中的 Conventional Commit 风格，例如 `feat: publish <title>`、`docs(package): add script descriptions`。保持提交范围单一。PR 应说明影响的卡片或脚本、列出已运行的校验命令、关联 issue；涉及首页或卡片视觉变化时附截图。生成产物必须和源文件一并提交。
