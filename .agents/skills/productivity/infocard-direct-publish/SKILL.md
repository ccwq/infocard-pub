---
name: infocard-direct-publish
description: Use when one URL or a complete user brief should become one published infocard through the .docs promotion workflow.
version: 2.0.0
---

# Infocard 直连发布（单对象 `.docs` 直连模式）

## 适用场景

- 用户给出一个 GitHub URL、官方文档 URL 或完整研究材料，并明确要求发布一张信息卡。
- 用户给出主题、标题与足够完整的内容，且不存在多个候选对象。
- 单对象、低风险、无需多源交叉核验的 light route。

不适用于：多对象批量、敏感争议、需要多源事实裁决、用户要求并行研究，或素材不足以确定发布对象的任务。

## 唯一工作区模型

此模式不是直接写 `docs/` 的旁路，也不允许 worktree：

```text
主线程调研与断言审计
→ .docs/<run-id>/<slug>/ 写候选 HTML、sidecar、facts、视觉证据、promotion-manifest.json
→ Publisher 验证 manifest 并精确提升到 docs/ 与 assets/
→ 主 checkout visual gate → build → verify → commit → push → 公网复核
```

禁止：

- `git worktree add/remove/prune`
- 临时信息卡仓库根目录或 repo clone
- detached HEAD、发布分支绕行、force-push
- Author 直接写 `docs/`、`assets/`、`_index.yaml`、`index.html` 或 Git 状态

主 checkout 有 ambient dirty/untracked 文件时，记录并保留它们；Publisher 只 stage promotion manifest 声明的正式产物和构建生成的索引，不得 reset、stash、clean 或借助 worktree 规避。

## STOP GATE：视觉验收先于 build / commit / push

任何正式 `docs/*.html` 写入或修改后：

1. 从当前主 checkout 渲染被 promotion 的正式目标；
2. 采集桌面与移动截图，给出 `critical / major / minor`；
3. 更新 `.docs/<run-id>/<slug>/` 中绑定当前 HTML sha256 的视觉 manifest；
4. 将该 manifest 的正式门禁副本放到项目要求的 `.visual-evidence/<slug>/manifest.json`；
5. 运行 `npm run verify:visual-gate -- docs/<slug>.html`；
6. 只有 `0 critical / 0 major`、HTML hash 匹配时，才允许 build、commit、push；
7. push 后必须 cache-bust 打开公网 URL 并重新截图复核；本地和公网视觉状态分别报告。

禁止先 push 后补截图，也禁止将 build 成功、HTTP 200、DOM 检查或旧截图当作视觉通过。

## 执行步骤

### 1. 调研与断言审计

优先用第一方来源：GitHub API、README、官方文档、package manifest、release notes。

把用户材料中的可核验断言整理为内部表：

```text
claim | source | status(confirmed/claimed/unsupported) | final wording
```

- `confirmed`：可作为事实写入卡片；
- `claimed`：保留来源归属，如“README 声称”；
- `unsupported`：删除，不以修辞替代验证。

### 2. 主题选择与 run evidence

调用 `infocard-theme-assignment` 生成并冻结 `.docs/<run-id>/<slug>/theme-decision.json`。该 JSON 是唯一主题决策源；本 skill 只消费并检查它，不重新选择主题。**委派 Author 前必须确认该文件已存在且有效；委派上下文禁止写入或暗示任何具体主题（包括 `Theme: hardblue`），只能要求消费 `selected_theme`。** P0 主题决策门禁如下：

```text
主题决策存在且有效 → 才能 author
主题决策缺失/无效 → THEME_BLOCKED
委派上下文预选具体主题 → DELEGATION_THEME_BLOCKED
```

主题决策记录格式：

```json
{
  "content_type": "...",
  "content_shape": "...",
  "candidate_themes": ["..."],
  "excluded_themes": [{ "theme": "...", "reason": "..." }],
  "selection_weights": { "...": 1 },
  "seed": "...",
  "selected_theme": "...",
  "user_override": { "requested": null, "accepted": false, "reason": null }
}
```

读取对应 `theme/<selected_theme>.html` 和 style skill，使用主题分配模块解析/校验决策记录。HTML 必须使用与 `selected_theme` 一致的注册 `data-theme`，sidecar 必须使用同一 bare slug 的 canonical `style`，并满足 token + 结构签名门禁。缺失或冲突时返回 `THEME_BLOCKED`；不得生成旧式文本决策记录或旧四字段。

### 3. Authoring：只写 `.docs`

在 `.docs/<run-id>/<slug>/` 创建：

```text
card.html
card.html.meta.yaml
facts.json 或 research.md
promotion-manifest.json
visual/
```

`promotion-manifest.json` 是唯一 promotion 权威：source 必须相对 authoring 目录；target 只能是 `docs/` 或 `assets/`；禁止绝对路径、`..`、重复 target、未声明文件、bundle、截图、过程文件与生成索引。

sidecar 必须是单一 YAML mapping，至少包含：

```text
slug / title / desc / date / updated / tags / category /
author / source / source_url / style / path
```

日期格式为 `"YYYY-MM-DD HH:MM:SS"`。`path` 必须与 manifest 正式 HTML target 完全一致。

### 4. Publisher promotion 与本地门禁

调用 `infocard-pub-publisher`：

1. 在主 checkout 记录 `git status --short`；
2. 验证 bundle、manifest、sidecar 和 source/target allowlist；
3. 只复制 manifest 声明的 HTML、sidecar、assets 到正式 `docs/`、`assets/`；
4. 渲染并完成视觉门禁；
5. 在主 checkout 运行：

```bash
npm run build
npm run verify
npm run fix-taxonomy
npm run verify-taxonomy
npm run check-leak
```

6. 检查 `_index.yaml`、`index.html` 和 staged diff 只包含声明产物、必要声明资产与生成索引。

### 5. Commit、push 与公网复核

使用窄 allowlist stage，禁止 `git add -A`：

```bash
git add docs/<slug>.html docs/<slug>.html.meta.yaml
git add <declared-assets>
git add _index.yaml index.html .visual-evidence/<slug>/manifest.json
git commit -m "feat: publish <title>"
git push origin main
```

远端前进时，只在当前主 checkout fetch/rebase 一次、重新生成索引和受影响视觉证据；第二次失败即 `BLOCKED_AT_INTEGRATION`。禁止 force-push。

公网验收地址：

```text
https://ccwq.github.io/infocard-pub/docs/<slug>.html
```

使用 cache-busting 验证详情页、`_index.yaml`、首页 entry、释放指纹和公网桌面/390px 视觉证据。

## 内容与元数据边界

- 工具卡必须让读者理解安装/取得方式、首次使用、核心参数或配置、依赖、许可证与边界。
- 视觉上像可点击资源的项目必须有真实 `href`；无 URL 的内容不得伪装为链接卡。
- 不自动启动 Wiki；只有用户明确要求才运行 Wiki 同步。
- 不安装、配置或执行卡片中介绍的工具，除非用户单独授权。

## 失败恢复

- Author 超时：检查 `.docs/<run-id>/<slug>/` 是否已有可用候选稿、sidecar、manifest 和 facts；不得寻找或新建 worktree。
- 视觉失败：修复 `.docs` 候选，重新 promotion，重新截图和视觉门禁；旧 evidence 失效。
- build/meta 失败：只修复当前 manifest 声明的 sidecar/HTML，再完整重跑本地门禁。
- push/integration 失败：保留 `.docs` 与主 checkout 状态，记录阻塞；不得创建 clone、worktree 或重写 main。

## 验收清单

- [ ] Authoring 只存在于 `.docs/<run-id>/<slug>/`
- [ ] Manifest source/target allowlist 验证通过
- [ ] 正式 `docs/`/`assets/` 只含被提升的声明文件
- [ ] 视觉门禁 desktop/mobile 均为 0 critical / 0 major
- [ ] build / verify / taxonomy / leak 通过
- [ ] staged diff 不含 ambient state
- [ ] push 后详情页、索引、首页与公网视觉证据均验证
- [ ] 未创建、进入、复用或清理任何 worktree
