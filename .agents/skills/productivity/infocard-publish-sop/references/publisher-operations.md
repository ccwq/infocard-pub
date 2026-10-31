---
kind: standards
status: active
trigger: Publisher needs manifest fields or executable command details
---

# Publisher 按需操作参考

本文件只说明操作，不另设发布入口、视觉预算或授权。规则冲突交由当前 Router/Publish 入口处理。

## 候选与提升

- 保留唯一 `.docs/<run-id>/<slug>/` 候选源。需要修复时改候选，再通过 manifest 提升；不要分别编辑候选与正式 HTML。
- manifest 的 source 相对候选目录，target 相对仓库根；target 仅允许声明的 `docs/` 和 `assets/` 文件。不要提升索引、截图、过程文件、秘密或整个目录。
- 正式 sidecar 为 `<文件>.html.meta.yaml`。包含 `slug, path, category, title, desc, date, updated, tags, author, source, source_url, style`；path 等于 HTML target。
- 日期使用带引号的 `YYYY-MM-DD HH:MM:SS`。更新卡保留首次 date，刷新 updated；核对正式 sidecar 和生成索引，而不只检查候选。
- 使用已冻结的主题决策与实际主题骨架。用户明确指定主题时保留其选择；不得把 `theme/*.html` 当 stylesheet。
- 子任务返回后先检查已有文件。接管缺失项，不重新研究或重派整个任务。

## 命令入口

以下从仓库根执行。`<candidate>` 指实际候选目录；`<html>` 和 `<meta>` 指 manifest 声明的正式路径。只在相应阶段执行，不把本清单当重复运行循环。

```bash
# 更新既有卡时，在提升前刷新候选元数据
node scripts/sync-publish-metadata.js --manifest <candidate>/promotion-manifest.json --timestamp "YYYY-MM-DD HH:MM:SS"
# 精确提升；命令拒绝时先检查字段与路径
node scripts/promote-infocard.js --manifest <candidate>/promotion-manifest.json
# 按当前 Publish 规则采集和审查最终 HTML 后，校验其证据
npm run verify:visual-gate -- <html>
# 构建一次，再单独验证；定向检查当前卡，不修复全仓历史内容
npm run build -- --full
npm run verify
node scripts/verify-taxonomy.js <meta>
node scripts/check-info-leak.js <html>
```

构建可能更新 sidecar。检查差异，必要时同步正式 sidecar 回候选并更新其 manifest hash；HTML 变化则旧视觉证据失效。不要只替换视觉记录的 hash 来复用旧截图。

## 失败与收尾

- 索引过期先检查 full build 是否完成、verify 是否单独执行。针对已证实原因做最小恢复，不循环构建，不改校验器。
- 视觉模型建议先用 DOM、盒模型或局部截图验证。视口底边裁切和容器内横滚不自动构成页面缺陷；不追逐新的审美 minor。
- 需要截图时使用项目可用的 capture 适配；缺失后端记录证据缺口，不虚构可执行工具，不安装或改配置以绕过授权。
- 校验通过后检查精确 diff，只暂存当前任务产物及其必要生成文件。共享仓库的既有改动不清理、不顺带提交。
- 远端拒绝不能直接推断为并发；先调查分叉、重叠路径、删除方向和内容丢失风险。按授权整合，不 force push。
- 公网验证目标页内容指纹、索引入口与当前视觉。分开报告候选、当地验收、commit/push、公网验收；未完成项保留准确状态。
- 新卡 HTML `<head>` 必须包含 `<meta name="slug" content="<slug>">`（slug 为 sidecar `slug` 字段值，不带日期前缀）；否则 post-publish-verify 指纹恒缺 marker，无法达到 PUBLISHED_VERIFIED。存量卡不回改，批量补需单独决策。
- Author/校验器契约坑（2026-10-28 实测）：`bundle.slug` 不得带 `YYYYMMDD-` 前缀，校验器要求 `html_path == docs/YYYYMMDD-${slug}.html`，`asset_dir`/`manifest_path` 必须是 `assets/img/${slug}`；日期只进 target/path，sidecar slug 字段不受此限。
- 主题 `required_selectors` 是字面匹配 `class="X`：必需类必须写在 class 首位（`class="col panel"` ✓，`class="panel col"` ✗）。
- 移动视口含表格的卡：`@media` 下必须 `table{min-width:5xxpx}` + `.scroll{overflow-x:auto}`，否则列被挤成 3 字宽判 major；修复 HTML 后四图按新哈希重截。
- agent-browser screenshot 相对路径可能打印成功但文件不存在：一律绝对路径 + 每张前 `/json/activate/<TID>`。
- 历史事故文件只用于定位同类原因，其中的命令、放行和状态定义不自动生效。
