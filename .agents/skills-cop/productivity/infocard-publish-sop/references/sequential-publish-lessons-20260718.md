# 本次依次发布经验（2026-07-18）

## 适用范围

仅记录本轮四张卡采用“逐卡完成、再进入下一张”的发布模式时验证过的经验；不把本轮卡片主题、提交号或临时路径固化为通用规则。

## 1. 依次发布的边界

用户要求依次发布时，不应先并行启动全部 Author。上一张卡必须完成：作者产物、卡片级本地门禁、构建与 diff 审计、提交、推送、公网验证，才启动下一张 Author。这样可以把失败归因到单张卡，避免多个未完成产物互相污染同一 integration worktree。

## 2. 公开验证必须容忍 CDN 传播

首次 push 后，detail 页面可能暂时 404，首页和索引也可能仍是旧内容；HTTP 200 不能单独证明新卡已上线。对 detail、`_index.yaml`、首页身份文本分别验证，使用有限退避重试。只有三者同时通过，才将该卡标记为公开验证完成。

## 3. 构建时机

Author 产物尚未到齐时不得运行 build。早期 build 会生成与任务无关的索引漂移，不能作为有效发布证据。若误运行，先保存证据供复盘，然后恢复生成文件，待卡片产物到齐后重新构建。

## 4. Author 输出不等于发布完成

Author 只能负责 HTML、sidecar 和卡片级检查；主线程仍必须执行构建、索引、allowlist diff、提交、推送、公网验证与收尾。缺研究或缺 bundle 时 Author 应 fail-closed，不得猜测写卡。

## 5. 浏览器 session 隔离与清理

视觉验收或网页证据采集时，每张卡必须使用独立的 `agent-browser --session <run-id>-<slug>`。不得复用 session，避免 tab 地址和状态覆盖。卡片进入成功、失败或取消终态后，按同一 session 关闭其 tab，并记录清理结果；不得关闭其他任务的 tab。

## 6. Facts fixture 与语义门禁

本轮 live validator 不只读取 HTML/meta，还依赖 `.tmp/infocard/<slug>/facts.json`。fixture 应在卡片门禁前生成，并与冻结的 Research handoff 对齐：hero identity、required sections、claims 与 coverage 都必须可追溯。若 hero 或章节标签不匹配，应修卡或修 fixture；不得通过随意降低 coverage 或删除事实来制造绿色结果。

## 7. Worktree 终态清理

每张卡或整批任务进入 published、published-pending-visual、blocked 或 cancelled 后，先保留必要的非敏感 run evidence，再确认 worktree 干净并保留 worktree。用 `npm run worktree:list -- --repo <repo>` 报告历史 WT，并提示用户回复 `del-rm` 才清理。脏 worktree 不得强删；应先记录或处理残留。分支只有在已合并或确认废弃后删除。

## 8. 历史门禁噪声分层

仓库全量构建可能报告历史 sidecar slug mismatch 等 warning。发布报告应区分本批新增 blocker 与 baseline warning；不能因为历史 warning 宣称本批失败，也不能把“构建命令退出成功”误报成全部门禁通过。
