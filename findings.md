# 三张信息卡重建发现

## 现状
- 主 checkout 为 E:\project\self.project\infocard-pub。
- ambient dirty state（仅记录，不处理）：`.scratch/infocard-skill-architecture/migration-manifest.md`、`_index.yaml`、`docs/20260827-ai-reads-books.html`、`docs/20260827-caveman-hardblue.html`、`docs/20260827-designlang.html`、`index.html` 已修改；`wt-ai-relay/docs/20260803-ai-relay-station-shutdown.html` 已删除。
- 三张目标卡均为自包含 HTML；当前主题标记：ai-reads-books=blue，openwiki=sage-swiss，stitch-google=blue。
- 当前目标卡存在重复/桥接样式与多个响应式规则，重建应统一结构并重点检查移动端。

## 过程约束
- Author 子智能体各自在 `.docs/rebuild-20260828-<slug>/` 写候选稿；Publisher 才能提升到 docs。
- 截至本记录，截图必须通过 web-capture / agent-browser --cdp 9222；视觉门禁独立于 build/HTTP。
- 项目记忆 CLI 调用曾因 DSH runtime node ENOENT 失败，暂记为基础设施降级，不修改项目记忆文件。

## 证据边界
- 未将截图或外部页面描述当作事实；数值与日期以现有 HTML/sidecar 为准，候选稿应保留来源与不确定性。
