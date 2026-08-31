# 信息卡实际执行经验分级（P1 / P2 / P3）

## 用途

本文件只收录真实信息卡任务执行中反复出现、能够改变后续执行动作的经验。它不是完成日志，也不记录单次提交号、临时 URL 或偶发错误。

优先级定义：

- **P1**：不执行就可能造成错误发布、覆盖成果、误报验收或主线停摆；作为硬门禁。
- **P2**：显著降低耗时、冲突和返工；作为默认执行策略。
- **P3**：只在特定卡型或异常条件触发；作为场景 reference。

## P1：硬门禁

### P1-1 子智能体超时后先取证，禁止直接重派

超时不等于零产出。按以下顺序检查后再决定接管或重派：

1. `git status -sb`与完整 untracked 状态；
2. 目标 HTML、meta、Markdown、assets 是否存在及大小；
3. `git log -1 --oneline`与候选 commit；
4. 实际 gate 输出和最近修改时间。

只要存在可用半成品，就由主线程做最小修复或继续门禁；禁止在未检查 worktree 的情况下重新创建同一张卡。

### P1-2 多卡发布禁止把子 worktree 的完整提交直接 cherry-pick 到集成 worktree

子 worktree 的 build 可能包含各自版本的 `_index.yaml`、`index.html`和时间戳。直接 cherry-pick 会制造生成文件冲突，甚至把集成 worktree 留在未决状态。

多卡正确集成方式：

1. 从最新 `origin/main`创建唯一发布 worktree；
2. 按每卡 bundle allowlist 复制 HTML、meta、Markdown、assets 等源产物；
3. 不复制子 worktree 的生成索引；
4. 在发布 worktree 中统一执行一次 build；
5. 统一门禁、提交和 push。

单卡可在原写作 worktree rebase 后直接发布，但同样不得通过另一个中间 worktree cherry-pick 生成文件。

### P1-3 build 后必须审计变更范围

build 可能重写历史 sidecar、索引、首页或时间戳。提交前必须：

- 查看 `git diff --stat`、`git status --short`和目标外文件；
- 恢复所有不属于 bundle allowlist 或必要生成索引的改动；
- 禁止无审查使用 `git add -A`；
- staged set 必须精确等于卡片 allowlist + 必要生成索引。

### P1-4 公网 HTTP 200 不能单独作为发布完成证据

公网验收必须同时确认：

- HTML 返回 200；
- 页面包含本次发布的唯一身份词或新增内容/CSS；
- 公网 `_index.yaml`包含正确 slug 与 path；
- CDN 已刷新，或 cache-busting 请求已读到新内容。

200 但内容仍旧，状态仍是未完成验收。

### P1-5 没有真实截图证据，不得标记视觉通过

DOM、HTML 结构、`scrollWidth == clientWidth`只能证明机械门禁，不能证明视觉质量。

- 有桌面和移动端截图且完成视觉审查，才能标记 `VISUAL_PASSED`；
- 视觉调用第一次失败后，必须走**差异化重试**，而不是只改问法或重复同一调用：依次改变截图分段、图像尺寸/长度、受检区域和实际可用的视觉入口；最多 5 次；
- 每次失败应记录错误类别（截图、路由/provider、准入/容量、分析空结果）和实际策略。第 2 次失败起，在 run-local evidence 记录尝试矩阵；
- 五次均为视觉基础设施失败、且其他 Pages 门禁通过时，才能标记 `VISUAL_PENDING` / `PUBLISHED_PENDING_VISUAL`；视觉模型报告任何实际 critical/major 缺陷时，优先进入 `VISUAL_BLOCKED`，不得用重试绕过；
- 截图默认是 Agent 的审查证据，可以按用户要求或供人工复核发送；但不得把“请用户自行判断截图”作为替代视觉验收的结论；
- 不得把 accessibility tree、HTTP 成功或无溢出升级为视觉 PASS。

### P1-6 创作与发布均使用隔离 worktree

每张卡使用独立创作 worktree；多卡使用单独集成/发布 worktree。所有 worktree 从最新 `origin/main`创建，不在脏主仓库中直接写卡、构建或发布。

### P1-6a 强制清理前必须保护唯一未提交产物

对包含目标产物或不确定残留的 worktree，执行 `git worktree remove --force`、`git clean -fd`、`rm -rf` 前，先完成并验证至少一种恢复锚点：

1. 提交到命名分支；或
2. 导出可应用的 `git diff` / patch；或
3. 复制到已验证存在的恢复目录，并核对文件大小或哈希。

禁止“先删后取”。新 worktree 必须先成功创建并可读写，才能清理旧 worktree。删除属于独立破坏性动作，仍需遵守用户的单独清理授权边界。

### P1-7 grill-me 超时默认最大覆盖，不阻塞

grill-me 选择题 10 分钟无响应时，直接采用最大覆盖方案（通常是"全部覆盖"或"最高配置"），不等待确认。记录本次决策于汇报末尾，标注"超时 → 默认 AAAA"。

不因超时而放弃任务或降低内容质量。

### P1-8 代码审查是门禁的必要环节，不得跳过

每次发布 gate 实现（`scripts/verify-publish-local-gate.js` 及其测试、bundle validator 等）必须经过独立代码审查，不能仅以"测试通过"作为门禁验收结论。审查必须覆盖：

- 字段类型与边界条件（如绝对路径强制、相对路径拒绝）；
- 结构解析而非字符串搜索（如 `home-index-data` 必须用 `extractInjectedIndexData()` 解析，不能用 `html.includes(slug)` 替代）；
- 测试覆盖率是否包含反例（如故意传入相对 root、故意传入无 `home-index-data` 的 HTML）。

审查发现缺陷后先修复、再测试、再提交，不得以"测试已通过"为由绕过修复。审查报告作为发布 gate 实现的必要组成部分写入 skill reference。

## P2：默认执行策略

### P2-1 子智能体并行创作时，主线程同步完成依赖就位

子智能体并行创作期间，主线程在 dispatch 同时完成以下就位动作（不等待子智能体返回）：

- 对 publish worktree 软链接 `node_modules`：若 worktree 来自 `origin/main` 干净 checkout，且主仓库 `node_modules` 已存在，直接 `ln -sf /path/to/main/node_modules node_modules`；
- 检查磁盘余量：`df -B1 /` 剩余 < 1 GB 时在子智能体返回前告知用户；
- 创建 bundle 文件并写入 `/tmp/infocard-runs/<run-id>/bundle/` 目录。

子智能体返回后立即进入集成链路，无需额外等待。

### P2-2 worktree 禁止安装依赖

### P2-2 多卡采用“并行创作、串行集成、统一构建”

研究和写卡可以并行；索引生成、集成、视觉验收、push 和公网验收由唯一发布线程串行完成。子智能体只提交声明的源产物，不各自发布。

### P2-3 每张卡必须有 artifact allowlist

bundle 明确列出 HTML、meta、Markdown、assets/manifest。完成后主线程逐项检查真实文件，并将 staged diff 与 allowlist 对齐；不以子智能体文字汇报代替文件取证。

### P2-4 最终发布时间由发布阶段生成

子智能体不硬编码最终发布时间。首页、sidecar、索引中的发布时间按内容 commit 时间或实际发布完成时间回填，并在 build 后检查一致性。

### P2-5 Pages 与 Wiki 分开验收、分开报告

本地写出 Wiki 文件不等于同步完成。Wiki 只有在 raw、知识页、index、log 均存在，完成 commit/push 并核验远端后才能标记 `SYNCED`。Pages 成功不能推导 Wiki 成功。

### P2-6 视觉验收复用专用 CDP tab

所有 `agent-browser` 调用使用运行环境提供的 endpoint。新建专用预览 tab；关闭前核对身份；身份不确定时保留并报告，禁止误关用户已有 tab。

### P2-7 push 后先确认 CDN 新内容，再截图

视觉修复 push 后，先检查公网已出现目标 CSS/关键词和新索引内容，再进行截图。不得拿旧 CDN 页面或本地文件替代公网视觉验收。

### P2-9 SVG 节点图中文节点字数不超过 6 字

graph-paper 风格 Hero 右侧 SVG 节点图，节点文字使用等宽字体（12px），中文节点名应控制在 4-6 字以内。过长的文字在等宽字体下会被压缩变形，影响可读性。

实测稳定范围：4-6 字（如"多光标""Vim 模式""Remote SSH"）。英文或缩写词（如"LSP""AI 集成"）按实际宽度估算，确保视觉平衡。

### P2-8 发布结束必须做残留清理

停止临时 HTTP 服务，删除已确认无用的 worktree、辅助软链接和 scratch 文件；最后分别检查目标仓库与 Wiki 仓库的 `git status -sb`。只清理经确认的残留，不删除不明文件。

### P2-10 批量 Author 只交付结构化内容，禁止并发写完整 HTML

多卡任务中，Author 读取完整主题模板并直接写 HTML，会放大上下文消耗、超时恢复和多写者返工。默认改为：

- Author 只读冻结 bundle 和精简 facts，先写最小合法 `content.json`，再增量补充；
- Author 不读取主题、不写 HTML、Markdown、meta、时间戳或 Git；
- 主线程是唯一渲染者，在唯一发布 worktree 中把 `content.json + bundle + theme` 确定性生成产物；
- Author 超时后先检查 JSON 的路径、大小、mtime、解析状态与缺失字段；存在可用内容时只做最小补齐，不重新创作；
- 全批次只统一 build 一次、审计一次、提交和 push 一次。

详细契约见 `batch-content-json-authoring.md`。

## P3：场景触发规则

### P3-1 社交平台只提供发现线索时，证据必须降级

登录墙、搜索标题或摘要不能证明正文实施细节。技术卡应回到官方文档、仓库、README、源码或直接可读原文核实。

### P3-2 用户要求隐藏发现平台时，扫描全部公开产物

扫描 HTML、Markdown、meta、图片说明、索引文本和 staged diff 的平台名及常见变体。无法脱离该平台证据成立的陈述应删除或降级，不得只隐藏来源名称。

### P3-3 全库 validator 暴露历史问题时，保持本卡范围

本次发布只修复本卡引入的问题。仓库级 taxonomy 或元数据修复器若改写无关历史文件，恢复溢出改动并采用最小卡片级门禁；不得借单卡发布顺手重写全库。

### P3-4 下载按钮必须验证真实导出结果

按钮存在和可点击不等于功能正确。必须确认实际下载非空 PNG，且不是打印对话框、空白图或错误 MIME。

### P3-5 复杂技术卡先研究，再 grill-me

先形成版本、参数、配置面、代价和证据缺口，再进行最多三轮范围对齐；避免用户在事实基础不足时做内容决策。

### P3-6 偶发故障先记 case note，不直接升级为长期规则

单次网络超时、CDP target 失效或短暂 Pages 404 只有在重复出现、根因稳定、workaround 经验证后，才进入主 skill/reference。

## 执行闭环

每次发布结束只检查是否出现新的 P1/P2/P3 候选：

1. 是否改变未来执行动作；
2. 是否至少重复出现或造成过真实阻塞；
3. 是否已有稳定验证或 workaround；
4. 是否能脱离本次任务继续成立。

不满足以上条件的内容保留在会话或 case note，不继续膨胀主 SOP。
