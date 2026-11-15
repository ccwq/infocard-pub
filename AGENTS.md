# Repository Guidelines

## 信息卡工作区硬边界（最高优先级）

信息卡工作默认使用主仓库 checkout。需要隔离任务或保护现有工作时，可以使用临时 clone；临时 clone 可以承担经用户授权的构建、提交和发布。worktree 不作为首选，确有需要时可以使用；创建、删除或清理已有 worktree 前须确认影响范围。

信息卡及其指定功能的创建、修改，以完成发布和公网验收为事务终点。仅调查、报告、本地预览，或用户明确禁止发布时，不进入发布流程。出现重大缺陷、门禁失败或其他真实阻塞时，停止受影响步骤并报告。具体发布操作仍须符合当前会话的授权边界。

默认生命周期（经授权的隔离 checkout 同样遵循候选、提升、验收和发布顺序）：

```text
.docs/<run-id>/<slug>/ 生成候选稿、事实、证据、截图与 promotion-manifest.json
→ Publisher 按 manifest 精确提升声明的 HTML / sidecar / assets 到 docs/ 与 assets/
→ Publisher 在当前授权 checkout 本地视觉门禁、build、verify、commit、push
→ 公网复核
```

硬规则：

- Author 只能写 `.docs/<run-id>/<slug>/`，不得直接写 `docs/`、`assets/`、`_index.yaml`、`index.html` 或 Git 状态。
- Publisher 是唯一能 promotion、build、commit、push 的角色；默认使用主 checkout，也可使用用户授权的隔离 checkout。
- 不得使用 `git push --force`、detached HEAD 或 `/tmp/infocard*` 作为信息卡发布流程的一部分。
- 现有 `/tmp` worktree 的盘点、备份或清理是独立的破坏性任务，需要单独、目录级授权；普通信息卡发布不得触发这些操作。
- 当前 checkout 的 ambient dirty/untracked 文件必须记录；不得顺带提交其他任务改动。执行 `stash`、`reset`、`clean` 前，须核对作用范围、未提交与未跟踪文件、恢复方式和潜在数据丢失；涉及覆盖或丢弃现有工作时，须取得明确授权。
- 发布前必须核对暂存文件清单，发布后验证目标页面和索引。

该边界覆盖项目内、全局和历史 reference 中的任何冲突发布建议。

## Infocard 发布前视觉门禁（硬规则）

任何信息卡创建、修复、重建、发布或 push 前，必须先读取并执行项目内流程：

- `.agents/skills/productivity/infocard-publish-sop/SKILL.md`
- `.agents/skills/productivity/visual-verification-gate/SKILL.md`
- `.agents/skills/infocard-styles/infocard-visual-evidence-grounding/SKILL.md`

顺序是硬门禁：**`.docs` authoring → manifest promotion → 本地渲染 → 桌面与移动截图（统一经由 `web-capture`，由运行环境提供 agent-browser endpoint）→ critical/major/minor 结论 → `npm run verify:visual-gate -- docs/<slug>.html` → build/verify → commit → push → 公网重新截图复核**。


禁止把 `HTTP 200`、`npm run build`、DOM/CSS token、或单端截图当作视觉通过。任何 HTML/CSS/结构/内容改动都会使旧截图与旧 manifest 失效。不得在 `docs/*.html` 中把 `theme/*.html` 当作 stylesheet 引用。

## 项目结构与内容模型

本仓库通过 GitHub Pages 发布静态信息卡。正式内容放在 `docs/`：使用 `docs/YYYYMMDD-slug.html` 或 `docs/YYYYMMDD-slug/index.html`。每张已发布卡片都必须有同名 `.meta.yaml`，其中的 `path` 必须与实际发布路径完全一致。

`.docs/` 是不发布的 authoring/process 区：每个运行使用 `.docs/<run-id>/<slug>/`；其中可保留 source HTML、sidecar、facts、manifest、视觉证据和声明资产。只有 promotion manifest 中声明的 HTML、sidecar、assets 可被 Publisher 提升到正式路径。

`scripts/` 存放 Node 构建、校验、taxonomy 与发布辅助脚本；`scripts/test/` 是 Node 原生测试。复用资源位于 `assets/`，视觉模板位于 `theme/`，PWA 入口为 `sw.js` 与 `manifest.json`。

## 构建、测试与本地开发

- `npm run build`：补齐缺失的元数据日期，生成 `_index.yaml`，并向根目录 `index.html` 注入索引数据。
- `npm run verify`：校验索引产物、卡片文件与元数据的一致性。
- `npm test`：运行 `scripts/test/` 中的 Node 原生测试。
- `node scripts/verify-taxonomy.js <meta>`：定向校验当前卡 taxonomy。单卡收尾不使用 `npm run fix-taxonomy`（该命令重写全仓 meta 引号风格，产生越界差异）；确需全局补全须用户单独授权，执行后用 `git status` 核查并回退非本卡文件。
- `npm run check-leak`：扫描敏感信息；出现 `CRITICAL` 或 `HIGH` 必须修复后才能发布。
- `npm run preview:source`：在 `http://localhost:4173` 预览源码；需要检查 `dist/` 时运行 `npm run preview`。

## 代码风格与命名

遵循相邻 HTML、CSS 与 JavaScript 文件的既有风格。slug 和文件名使用语义明确的 kebab-case，例如 `20260713-agent-browser-guide.html`。元数据日期始终加引号，如 `"2026-07-13 09:30:00"`，避免 YAML 类型误判。脚本应小而专注，CLI 参数清晰。

不要手动修改 `_index.yaml` 或 `index.html` 中生成的 `home-index-data`；必须通过构建生成。

## 测试与发布

修改卡片或元数据后，按 manifest allowlist 在主 checkout 依次运行 `npm run build`、`npm run verify`、`npm run verify-taxonomy` 与 `npm run check-leak`。修改脚本行为时，在 `scripts/test/` 补充或更新聚焦的 `*.test.js`。提交 PR 前确认本地卡片路径可访问、首页可见。

## 提交与 Pull Request
使用git-up -pcP 执行提交
