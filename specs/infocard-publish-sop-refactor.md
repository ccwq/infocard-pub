# 信息卡发布 SOP 执行重构规格

## Problem Statement

当前信息卡发布 SOP 以线性清单和人工对话推进为主，未充分区分内容生产、发布门禁、共享仓库写入和公网验收。多卡任务中容易出现长粒度子智能体超时、同一文件并发修改、依赖步骤并行、主题契约与 manifest 反复返工、全量索引重复构建，以及视觉基础设施失败后重复尝试等问题。

结果是：发布质量门禁基本保留，但执行时间、工具调用次数和对话轮数显著超过按内容复杂度的预估；失败恢复也容易回到前序阶段，重复研究或重写。

本规格的目标是降低返工、等待和上下文切换成本，同时保留事实核验、主题契约、敏感信息扫描、taxonomy、视觉状态、build、verify、commit/push 和公网验收。

## Solution

将信息卡发布 SOP 重构为三层：

1. **Authoring SOP**：负责来源、事实、主题和候选 HTML，不触碰正式发布目录及 Git。
2. **Publisher SOP**：负责 manifest、promotion、视觉门禁、build、verify、commit、push 和公网验证。
3. **Orchestration SOP**：负责多卡批次调度、并行边界、子智能体超时接管、状态机和最小缺口恢复。

每张卡采用显式状态机；内容生产可以并行，共享索引和 main 分支写入必须串行。批次内先完成各卡 authoring 和预检，再统一 promotion/build/verify/commit/push，最后并行做公网复核。

## User Stories

1. 作为信息卡作者，我希望在来源和事实冻结后再写 HTML，以便减少因事实变更产生的返工。
2. 作为信息卡作者，我希望主题在 authoring 前冻结，以便 HTML 一开始就满足主题契约。
3. 作为发布者，我希望 manifest 自动生成并自动计算 hash，以便避免手工同步错误。
4. 作为发布者，我希望单卡 preflight 在 promotion 前发现主题、路径、hash 和泄漏问题，以便 promotion 不再承担试错功能。
5. 作为批次协调者，我希望不同卡的研究和 authoring 可以并行，以便充分利用等待时间。
6. 作为批次协调者，我希望共享索引、build 和 main 分支写入串行，以便避免竞态。
7. 作为批次协调者，我希望子智能体在无产物时及时被接管，以便不等待无效的长任务超时。
8. 作为批次协调者，我希望超时后按当前磁盘和 Git 状态恢复，以便只补缺失阶段。
9. 作为发布者，我希望修改 HTML 后自动刷新 manifest hash，以便避免旧 hash 阻塞 promotion。
10. 作为验收者，我希望视觉运行时在批次开始前预检，以便不对每张卡重复撞同一个不可用的视觉服务。
11. 作为验收者，我希望视觉服务不可用时明确标记 VISUAL_PENDING，以便不把静态通过误报为视觉通过。
12. 作为发布者，我希望 verify 不依赖过期的本地索引缓存，以便 build/verify 语义稳定。
13. 作为发布者，我希望一次批量 build 和 verify，以便减少大型仓库的重复扫描。
14. 作为仓库维护者，我希望正式提交只包含 manifest allowlist 对应的文件，以便隔离 ambient dirty changes。
15. 作为用户，我希望进度报告按阶段和卡片状态汇总，以便减少无必要的对话往返。
16. 作为用户，我希望最终报告区分本地、远端、公网和视觉状态，以便准确判断是否完成。
17. 作为恢复执行者，我希望已 promotion 的卡不再重新 authoring，以便失败恢复不造成重复劳动。
18. 作为恢复执行者，我希望 Pages 传播延迟只触发公网复核，不触发内容重写，以便隔离外部延迟。
19. 作为测试维护者，我希望有 build→verify 的回归测试，以便防止索引时序问题重新出现。
20. 作为流程维护者，我希望所有阶段都有输入、输出、验收命令、失败状态和恢复入口，以便 SOP 可执行而非仅供阅读。

## Implementation Decisions

- 使用显式状态机：`DISCOVERED`、`FACTS_FROZEN`、`THEME_FROZEN`、`AUTHORING_READY`、`AUTHORING_DONE`、`STATIC_PREFLIGHT_PASSED`、`PROMOTED`、`VISUAL_PENDING`、`VISUAL_PASSED`、`BUILD_PASSED`、`VERIFY_PASSED`、`COMMITTED`、`PUSHED`、`PUBLIC_VERIFIED`，并配套 `BLOCKED_*` 状态。
- 失败只回退到最近一个未通过门禁的阶段；禁止因 promotion、视觉或 Pages 失败重复研究。
- 每张卡的 authoring 产物只允许写入 `.docs/<run-id>/<slug>/`；Publisher 才能 promotion、build、commit 和 push。
- 子智能体任务限制为事实提炼、HTML authoring 或只读审查之一，不再委派完整发布链路。
- 采用 30/45/60 秒接管协议：约 30 秒检查产物，约 45 秒 steer 一次，约 60 秒无产物则主线程接管。
- 同一文件的读取、修改、hash、manifest 写入和 promotion 必须串行。
- 允许并行的范围仅包括不同卡的只读研究、authoring、独立 preflight 和最终公网 URL 复核。
- 增加单卡 `preflight:infocard`，检查 HTML/meta 可解析性、主题一致性、主题注册、必需 selector、硬编码颜色、来源泄漏、slug/path 唯一性和 hash 一致性。
- 增加 `create-infocard-manifest`，从结构化输入生成完整 `card`、`bundle`、`files`、`wiki` schema，并自动计算 SHA-256。
- 增加批次状态文件，至少记录每张卡的 authoring、promotion、visual、build、verify、commit、push 和 public 状态。
- 增加视觉运行时批次预检；视觉后端不可用时统一记录 `VISUAL_PENDING`，不重复对每张卡尝试同一失败路径。
- 将批次流程固定为：authoring 并行 → preflight → promotion → 一次 build → 一次 verify/taxonomy/leak → 窄范围 stage → 一次 commit → 一次 push → 公网复核。
- 修复 verify 对过期 `dist/_index.yaml` 的依赖；verify 应验证可定义、可重建的当前索引状态，并增加新卡未提交、已提交、full build、增量 build 回归测试。
- 进度消息改为阶段摘要和卡片状态表；只有用户决策、高风险副作用、不可自动恢复阻塞和阶段完成才单独发送消息。
- 保留主 checkout 单一工作区约束，不引入 worktree、force push 或顺带提交 ambient dirty changes。

## Testing Decisions

- 测试外部行为和验收结果，不测试具体对话措辞或内部函数调用顺序。
- 为 manifest 生成器测试：完整 schema、destination、style 一致性、HTML/meta hash 同步和缺失字段拒绝。
- 为单卡 preflight 测试：合法主题、主题不一致、未注册主题、硬编码颜色、泄漏 X status URL、重复 slug 和 hash 过期。
- 为状态机测试：正常推进、promotion 失败最小回退、视觉 pending 不升级为 passed、Pages 失败不回退 authoring、已 promotion 产物恢复。
- 为批次调度测试：不同卡 authoring 可并行、共享 build/commit/push 串行、同一目标禁止重复派发、超时后只执行缺口恢复。
- 为 build/verify 测试覆盖新卡未提交、已提交、full build 和增量 build 四种状态，确保索引缓存不会造成伪失败。
- 为视觉运行时预检测试覆盖 CDP 不可用、desktop 可用/mobile 不可用、视觉后端 503 和全部可用四种结果。
- 以仓库现有 Node 原生测试和 `npm run verify`、`npm run verify-taxonomy`、`npm run check-leak` 作为 prior art；新增脚本必须有聚焦测试。
- 代表性回归批次至少包含工具介绍、技术方法和写作型内容三种卡片，比较总墙钟时间、工具调用数、对话轮数、promotion 返工次数、build 次数、verify 失败次数、接管次数和视觉阻塞次数。
- 发布验收必须分别确认本地正式文件、远端 main tree、目标 HTML、索引关键词、公网 HTTP/内容指纹和视觉状态；任何缺失证据均标记为 pending 或 unverifiable。

## Out of Scope

- 不降低或删除事实来源分层、主题契约、leak、taxonomy、视觉门禁、build、verify、commit/push 和公网验收要求。
- 不自动绕过视觉门禁，不把截图存在、DOM 无溢出或 HTTP 200升级为视觉通过。
- 不改变信息卡内容模型、主题视觉 DNA 或既有卡片的传播定位。
- 不处理与本次发布批次无关的历史 metadata warning、全仓索引格式清理或 ambient dirty changes。
- 不引入 Git worktree、临时 clone、force push 或未经授权的外部发送。
- 不在本规格中实现公众号发布、跨平台分发或长期定时任务。

## Further Notes

本规格源自 2026-09-06 多卡发布批次的执行复盘。该批次暴露的主要超额耗时来自大粒度子智能体超时、依赖操作错误并行、主题/manifest 反复返工、视觉运行时未预检和索引缓存时序问题；用户调度因素接近于零，环境/工具因素为次要因素。

实施顺序建议为：先落地 SOP 编排和超时协议，再实现 manifest/preflight/状态文件工具，随后修复 verify/index 语义，最后用代表性三卡批次做真实回归。优化不得以减少门禁为代价。

当前仓库 GitHub CLI 未登录，因此本规格已写入本地项目 `specs/`，尚未发布到 issue tracker；发布 issue 需要先完成 GitHub 登录并确认目标仓库与标签体系。