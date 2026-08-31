# 信息卡发布耗时审计与优化规格

## 文档状态

- 类型：流程优化规格（to-spec）
- 语言：中文
- 编写日期：2026-08-31
- 适用项目：`/home/ccwq/qbox/opendir/project/infocard-pub`
- 目标：降低信息卡从来源到公网验收的端到端耗时，同时不削弱事实核验、主题契约、视觉门禁、窄范围提交和公网验收。
- 数据性质：本规格基于本轮执行日志、Git 时间戳和工具返回结果整理；耗时为阶段级观测值，不是逐工具调用的完整性能追踪。

## Problem Statement

信息卡发布端到端耗时偏长。最近一轮连续处理多张信息卡时，主要时间没有消耗在 `git push` 或 GitHub Pages 传播，而是消耗在：

1. 子智能体长时间读取资料却没有及时 authoring。
2. 子智能体多次写入错误的 `/home/ccwq/.docs/` 路径，主会话需要复读、拒绝错误产物并重建。
3. 每张卡都串行执行研究、主题决策、候选稿、promotion、静态校验、build、commit、push 和公网复核。
4. `npm run build` 每次扫描约 923–926 张卡，单次需要数分钟。
5. CDP `9222` 不可用，视觉门禁无法生成真实桌面/移动截图，流程只能记录 `VISUAL_PENDING` 后继续走已授权的 pending-visual 发布路径。
6. 发布完成后执行 `git-up -pcP`，将长期积累的 381 个 ambient dirty changes 作为一个提交处理，增加额外时间并降低提交边界的可审计性。

当前流程的质量门禁是必要的，但其执行方式没有把“可并行的研究/authoring”和“必须串行的正式发布”分开，也没有把“当前发布改动”和“长期工作区治理”隔离，因此出现了明显的等待和返工。

## 调查结果

### 观测到的端到端时间

Git 日志记录了最近连续发布节点：

| 阶段 | Git 时间 | 阶段间隔 |
|---|---:|---:|
| token.inurl.link | 07:50:47 | — |
| AI Website Cloner 更新 | 08:10:13 | 约 11.2 分钟 |
| vgpu | 08:27:04 | 约 12.8 分钟 |
| EVIE + PaddleOCR-VL | 08:41:57 | 约 11.5 分钟 |
| Claude Code Skills progressive-doc | 09:00:51 | 约 12.7 分钟 |
| 四张新卡/更新卡连续发布区间 | 07:50:47–09:00:51 | 约 70.1 分钟 |
| git-up -pcP | 09:00:51–09:12:26 | 约 11.6 分钟 |

说明：Git commit 时间是阶段完成锚点，不能精确代表每个工具调用的真实开始/结束时间，但足以证明当前每张卡平均占用约 11–13 分钟。

### 时间消耗排序

1. **子智能体协作等待和主会话接管**：最大返工源。
2. **多张卡串行执行完整生命周期**：放大每张卡的固定成本。
3. **全仓库 build**：稳定的确定性慢点，每次约数分钟。
4. **视觉基础设施不可用后的 pending 分支**：增加判断、记录和复核步骤。
5. **GitHub Pages 部署传播**：通常几十秒到约一分钟，不是主要瓶颈。
6. **git-up 处理 381 个长期脏改动**：发布之后的额外耗时和边界风险。

### 子智能体问题的具体表现

本轮多个子任务出现以下模式：

- 先读取主题模板、validator、历史 manifest 和项目文件，读取阶段过长。
- 没有在短时间内写入第一个候选文件。
- 使用 `/home/ccwq/.docs/...`，而不是项目根下的 `.docs/...`。
- 写出与任务无关的占位 JSON 或不符合要求的候选文件。
- 主会话需要读取错误产物、判断可信度、重新写入五个候选文件、重新生成 hash 和 manifest。

这说明当前委派上下文虽然包含了路径约束，但没有被子智能体稳定执行；“完整研究 + 完整 authoring + manifest + 自检”作为一个长任务，也放大了模型在探索阶段的停留概率。

### build 慢点

`npm run build` 当前会遍历约 923–926 张卡，并执行元数据扫描、索引生成和首页注入。其输出中反复出现历史 metadata shape warning，例如 dated path 与 bare slug 的差异，以及工作区中不在 `HEAD` 的 sidecar 文件。

这些 warning 当前未导致退出失败，但会造成：

- 全仓扫描固定成本。
- 大量无关输出，增加人工判断成本。
- build 超时与真实失败难以区分。
- 单卡发布必须承担全仓库生成索引成本。

### 视觉基础设施问题

当前 `127.0.0.1:9222` 未监听，`web-capture` 无法生成所需桌面和移动截图。严格视觉门禁因此返回：

- `review_status` 不能是 `VISUAL_PASSED`。
- desktop screenshot 缺失。
- mobile screenshot 缺失。

在用户明确授权发布的情况下，流程可进入 `PUBLISHED_PENDING_VISUAL`/`VISUAL_PENDING` 语义下的发布路径，但每张卡仍需额外创建 evidence manifest、运行一次失败的视觉 gate 并记录 evidence gap。这是可接受的显式例外，不得被静态检查替代。

### Git 工作区问题

发布过程中主会话严格对单卡使用窄范围 stage；但随后执行 `git-up -pcP` 时发现：

- 工作区存在 381 个 tracked/untracked 改动。
- 改动跨越数百个历史 metadata、skill、脚本、测试、未跟踪文档和资源。
- 第一次计划因 Unicode 路径解析错误失败。
- 第二次计划将工作区所有可见改动作为一个提交处理。
- 最终 commit：`c11dc30 chore(infocard): 🔧同步仓库工作流与发布产物`。

这不是单卡发布的必需步骤，而是发布后的仓库治理任务。它不应成为信息卡发布链路的默认后续动作。

## Solution

建立“研究/authoring 可并行，正式发布单写入”的轻量流水线，并增加阶段级耗时记录。

### 新的生命周期

```text
来源提取与一手核验（可并行）
→ 主题决策冻结
→ 短任务 authoring（只写 .docs）
→ 主会话复读并校验最终文件
→ promotion
→ 本地视觉门禁
→ build / verify / taxonomy / leak
→ 窄范围 stage / commit / push
→ 公网 HTML / index / fingerprint 验收
```

### 并行边界

允许并行：

- 不同卡片的来源提取。
- 不同卡片的一手仓库核验。
- 不同卡片的 `.docs/<run-id>/<slug>/` authoring。
- 当前卡片 push 等待期间，下一张卡的研究准备。

必须串行：

- 同一主 checkout 的 promotion 写入正式 `docs/`。
- `npm run build` 生成共享 `_index.yaml` 和 `index.html`。
- 对共享索引的 verify、taxonomy 和 leak gate。
- main 分支 commit、push 和公网复核。

禁止并行修改：

- 同一个 `.docs` 卡片目录。
- `_index.yaml`、`index.html` 或同一正式 HTML。
- 同一 Git index 和 main 分支。

### 子智能体任务拆分

将长任务拆成两个可观测阶段：

1. **Research 阶段**：只返回来源、事实、证据边界、待核验项，不写卡片。
2. **Authoring 阶段**：读取既定 research 和冻结的 theme-decision，直接写五个候选文件，不再继续扩展搜索。

Authoring 任务必须满足：

- 只写项目根下的绝对路径 `/home/ccwq/qbox/opendir/project/infocard-pub/.docs/<run-id>/<slug>/`。
- 第一个写入动作应在短时间内发生。
- 返回实际文件路径和 hash，但主会话不直接信任回执。
- 主会话重新读取全部最终产物后，才生成/更新 promotion manifest。

### 子智能体超时策略

- 30 秒仍无写入动作：发送一次 steer，要求停止读取并开始写文件。
- 60 秒仍无写入动作：停止子任务，主会话接管 authoring。
- 已经有部分文件时：只读取、校正缺失文件，不重新启动完整研究任务。
- 同一 slug 同时只能存在一个活动 authoring 任务。
- 不为同一个 slug 重复派发“研究 + authoring + 发布”的大任务。

### 增量构建方向

保留现有全量 build 作为发布安全基线，同时新增或规划以下优化：

- 预检查只扫描本轮 manifest 声明的 HTML/meta，快速发现单卡问题。
- 只有在 promotion 成功后才运行全量索引 build。
- 将历史 metadata warning 与本轮错误分离输出。
- 记录 build 的扫描卡片数、耗时和生成文件 hash。
- 后续评估为索引生成增加增量模式：未变化卡片不重复解析，最终仍输出完整 `_index.yaml`。
- 对 build 产生的 `index.html`、`_index.yaml` 使用独立的生成物校验，不把全仓 metadata warning 当作本轮失败。

### 视觉门禁方向

视觉门禁不得删除或降级。应优化的是基础设施和失败处理：

- 在发布前一次性检查 CDP/web-capture 可用性，避免每张卡重复发现同一故障。
- 若基础设施不可用，批次开始时统一记录一次环境故障，再为每张卡生成最小 evidence manifest。
- 用户明确授权 pending-visual 发布时，使用统一的 `PUBLISHED_PENDING_VISUAL` 状态，不重复解释同一个故障。
- CDP 恢复后，按 HTML SHA-256 找出所有待补视觉卡，批量执行桌面/移动截图和复核。

### Git 工作区治理

信息卡发布和仓库维护分离：

- 单卡发布只 stage 当前 HTML、sidecar 和生成索引。
- `git-up -pcP` 不应自动接管数百个 ambient dirty changes。
- 当工作区改动超过文件数量阈值，先输出计划并将其标记为独立维护批次。
- 历史 metadata、skill、测试和脚本按用途拆分为多个 commit。
- Unicode 路径必须用 NUL-safe 的 Git 状态解析，不得把转义后的路径直接作为 pathspec。
- 不执行 reset、clean、stash、worktree 创建或 force push 作为自动修复。

## User Stories

1. 作为信息卡作者，我希望在 60 秒内看到候选稿开始写入，从而知道 authoring 没有卡在无边界阅读阶段。
2. 作为信息卡作者，我希望所有子智能体只能写入项目 `.docs` 目录，从而避免错误路径造成返工。
3. 作为发布者，我希望每张卡都有独立的阶段耗时，从而能区分研究、authoring、build、push 和 Pages 延迟。
4. 作为发布者，我希望下一张卡的研究可以和上一张卡的 Pages 等待并行，从而减少串行空等。
5. 作为发布者，我希望 promotion、索引生成和 Git 写入保持串行，从而避免共享文件竞争。
6. 作为发布者，我希望单卡预检查只针对当前 manifest，从而快速发现路径、主题、hash 和 leak 问题。
7. 作为仓库维护者，我希望全量 build 的历史 warning 与本轮错误分开，从而降低误判成本。
8. 作为仓库维护者，我希望增量索引能复用未变化卡片，从而降低 900+ 卡片仓库的固定构建成本。
9. 作为视觉验收者，我希望批次开始时就知道 CDP 是否可用，从而不为每张卡重复等待相同失败。
10. 作为用户，我希望视觉 pending 的发布状态与静态/build/public 状态分开，从而不会把 HTTP 200误读为视觉通过。
11. 作为 Git 维护者，我希望 `git-up` 将长期脏改动与本轮发布改动分开，从而不产生数百文件的混合提交。
12. 作为仓库所有者，我希望提交计划只包含明确的文件 allowlist，从而不因自动化扩大副作用范围。
13. 作为信息卡读者，我希望每张卡的公网页面和索引都能在发布后被独立验证，从而确认实际发布而不是本地生成。
14. 作为项目维护者，我希望失败任务在磁盘有部分产物时能最小恢复，而不是重新研究和重写整张卡。
15. 作为流程负责人，我希望任何优化都保留主题契约、事实分层、leak、taxonomy、视觉状态和公网验收，从而只减少等待，不减少质量。

## Implementation Decisions

- 继续使用单一主 checkout，不创建、复用或清理 Git worktree。
- 继续使用 `.docs/<run-id>/<slug>/` 作为 authoring 区，正式 `docs/` 只能由 promotion 写入。
- 主题决策仍在 authoring 前冻结，并要求 `theme-decision.selected_theme`、HTML `data-theme`、meta `style` 和 manifest `bundle.style` 一致。
- 将 authoring 任务限制为短、可观测、单目录写入；研究不与 authoring 混在一个不可观测长任务中。
- 子智能体返回值只作为线索；主会话必须重新读取磁盘文件并以最终 hash 为准。
- promotion、build、共享索引修改、Git commit/push 保留在主会话串行路径。
- 视觉截图只使用批准的 `web-capture` / `agent-browser --cdp 9222` 路径；基础设施不可用时只允许记录 `VISUAL_PENDING`，不得伪造截图或 `VISUAL_PASSED`。
- 为每张卡记录阶段状态：`research`、`authoring`、`promotion`、`visual`、`static`、`build`、`commit`、`push`、`public`。
- 为每个阶段记录开始时间、结束时间、退出码、目标文件或 URL 和错误分类；不把模型思考时间当作唯一耗时来源。
- build 性能优化先做观测和增量预检，再实现增量索引；不通过跳过全量校验来制造速度。
- `git-up -pcP` 属于独立仓库维护动作，不自动成为每张信息卡发布的后置步骤。
- 当工作区存在大量 ambient dirty changes 时，默认只报告并排除，不自动合并到当前卡片提交；如需维护，应生成独立、可审计的提交计划。
- 对 Git 状态使用 NUL-safe 解析，保留 Unicode 文件名和 rename pair 的准确性。

## Testing Decisions

### Authoring 测试

- 给定项目根和冻结主题决策，authoring 产物必须出现在声明的 `.docs/<run-id>/<slug>/`。
- 错误的 `/home/ccwq/.docs/`、仓库外绝对路径、worktree、clone 都必须被识别并拒绝消费。
- 候选目录至少包含 `card.html`、`card.html.meta.yaml`、`research.md`、`visual/evidence_gap.md` 和 `promotion-manifest.json`。
- HTML、meta、decision、manifest 的主题值必须一致。
- 每个 manifest file 的 SHA-256 必须与磁盘文件一致。

### Promotion 与静态门禁测试

- 使用真实 `validatePromotionManifest()`，验证 bare slug、dated html path、source containment、destination allowlist 和 wiki 字段。
- 使用真实 theme contract 校验，拒绝主题 HTML 作为 stylesheet、缺失 `data-theme` 或组件 CSS 主题色不合规。
- 使用 leak check 验证没有凭据、追踪参数、status ID 可见泄漏。
- 运行 HTML/DOM 结构检查，覆盖长标题、表格、代码块、风险面板和移动端结构。
- 运行 build、verify、taxonomy 和 leak gates，并记录真实退出码。

### 性能测试

- 记录 10 张、100 张、900+ 张卡片规模下 build 的扫描数量、耗时和输出 hash。
- 比较全量 build 与单卡预检的耗时，确认预检不能替代最终全量索引验证。
- 模拟历史 metadata warning，确认 warning 不掩盖本轮错误。
- 验证连续发布时下一张卡研究可以与上一张卡公网等待重叠。
- 验证同一 slug 不允许多个 active authoring 任务。
- 验证 authoring 60 秒无写入后能被停止并由主会话最小恢复。

### Git 测试

- 预先存在 unstaged、untracked、staged 文件时，当前卡提交只能包含明确 allowlist。
- Unicode 文件名、rename pair 和空格路径必须能被准确解析。
- staged 内容非空时，提交计划必须拒绝扩大或覆盖现有 index 状态。
- 381 个以上 ambient dirty files 时，不应默认生成一个混合业务 commit。
- push 只在 commit 成功后执行；非网络错误不重试；禁止 force push。

### 视觉测试

- CDP 可用时，必须采集桌面和 390px 移动证据，并分别审查 hero、正文、表格、代码、风险和页尾区域。
- CDP 不可用时，必须生成带错误分类的 `VISUAL_PENDING` evidence manifest。
- HTML/CSS/结构内容变化后，旧截图和旧 hash 必须失效。
- 公网页面需要重新验证 release-specific fingerprint；HTTP 200 单独不算视觉通过。

### 验收标准

优化方案只有在同时满足以下条件时才算有效：

- 单卡平均端到端耗时明显下降，且阶段耗时可解释。
- 子智能体错误路径和长时间只读漂移显著减少。
- 正式发布文件、索引、主题契约、leak、taxonomy 和公网验收结果不下降。
- 用户授权的 pending-visual 发布仍明确标记为 pending，不被包装成视觉通过。
- Git 提交边界保持单一、窄范围、可回溯。

## Out of Scope

- 本规格不改变信息卡内容方向、用户授权规则或外部平台发送规则。
- 本规格不要求立即修复 CDP `9222`，只定义其对耗时和状态的影响及批次级预检查策略。
- 本规格不允许通过跳过主题契约、leak、taxonomy、build、verify 或公网验收来换取速度。
- 本规格不授权清理 `.docs`、历史 worktree、`#recycle` 或其他用户文件。
- 本规格不授权 reset、clean、stash、force push、删除历史 metadata 或重写远端历史。
- 本规格不把 `git-up -pcP` 的 381 文件混合提交回滚或拆分；那是独立的后续仓库维护任务。
- 本规格不实现具体代码改动、增量 build 算法或新的 cron 任务；这些需要后续实现规格。
- 本规格不把历史 Git 时间戳解释为逐工具精确 profiling 数据。

## Further Notes

- 本次调查的关键结论是：发布慢的主要原因是协作返工、串行化和全仓 build，而不是 push 本身。
- 最近四张卡的发布区间约 70.1 分钟，单张约 11–13 分钟；`git-up -pcP` 另增加约 11.6 分钟。
- 最优先的低成本改进是：缩短 authoring 子任务、严格验证路径、60 秒无写入即接管、研究与公网等待并行。
- 最优先的工程改进是：给 build 增加单卡预检和阶段耗时观测，再评估全量索引增量化。
- 最优先的治理改进是：让 `git-up` 识别 ambient dirty state，并将大规模仓库维护从单卡发布后置步骤中分离。
- 任何后续优化都必须继续遵守“结果必须用真实工具验收”的原则：文件存在不等于 promotion 成功，commit 不等于 push 成功，HTTP 200 不等于视觉通过。
- 本文件仅写入项目规格目录，未执行 commit、push、发布或外部发送。
