# 批量信息卡发布：可靠性门禁与清理清单

## 触发条件

适用于多卡并行、子智能体调研/写卡、隔离 worktree、浏览器视觉验收的发布批次。

## 可复用规则

### 1. 调研必须可恢复

- Research A 在开始阶段先写可解析的最小 handoff；每获得一条已核验事实，立即追加：`claim`、`source_url`、证据摘录、`retrieved_at`、置信度、限制条件。
- 不接受“只在最终返回时写完整 JSON”的交付方式；超时应留下可由主线程接管的部分成果。
- Author 缺少已验证研究、风险边界或有效 bundle 时必须 fail-closed：只报告缺项，不创建猜测性卡片。

### 2. Bundle 与 build 的正确时序

1. 生成仓库实际 schema 所要求的 v3 bundle。
2. 使用仓库 validator 校验并冻结 bundle/allowlist。
3. 确认所有声明的 HTML、meta、资产均存在且完成本地检查。
4. 再运行 build；随后检查 diff 只包含 allowlist、生成索引和已声明 audit。

构建在 Author 产物出现前执行时，生成的索引漂移不是有效发布证据，应在正确时序下重新生成。

### 3. 批次叙事与风险审计

发布前跨卡审查：术语、能力承诺、限定语、禁用词、脚注口径、风险语言必须一致。

- `security`：明确书面授权、范围与时间窗；工具输出需人工复核；不得把发现/命中等同风险成立。
- `physical-system`：仿真不等于可部署；保留签核、台架/边界工况/现场验证、人工接管与故障降级。
- `external-side-effect`：最小权限、显式确认、审查/测试/发布审批、密钥不入提示词或日志。

### 4. 浏览器隔离与收尾

- 每张卡使用独立：`agent-browser --session <run-id>-<slug>`。
- 不复用 session；视觉终态后按 session 关闭对应 tab，并在 run-local evidence 记录清理结果。

### 5. 容量与 worktree 生命周期

- 建立 worktree 前和生成视觉资产前记录容量；低于 3 GB 时请求清理授权，禁止扩容式继续执行。
- 发布处于终态后，先将非敏感审计证据保留在 worktree 外；确认 worktree 干净；保留 worktree 并用 `npm run worktree:list -- --repo <repo>` 报告历史 WT。只有用户精确回复 `del-rm` 后，才重新扫描并运行 `npm run worktree:cleanup -- --repo <repo> --confirm del-rm`。
- 分支仅在合并或确认废弃后删除；有未处理改动不能强制删除。

## 验收报告分层

把仓库遗留告警标为 `BASELINE_WARNING`，与本批次引入的 `BLOCKER` 分开。构建成功不代表本批次没有范围问题；需同时给出 artifact allowlist diff 结果。
