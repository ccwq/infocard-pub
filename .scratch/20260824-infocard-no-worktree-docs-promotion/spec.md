# 信息卡无 Worktree 发布流程统一 Spec

**Status:** ready-for-agent
**Date:** 2026-08-24
**Scope:** infocard-pub 信息卡创作、重建、发布、主题分配与相关全局控制规则

## Problem Statement

信息卡发布规则同时存在两套互相冲突的架构：

1. 新架构已经定义 Author 在主仓库 `.docs/<run-id>/<slug>/` 保留创作过程，Publisher 按 promotion manifest 将正式 HTML、sidecar 与声明资产精确提升到 `docs/`、`assets/`，并在主 checkout 执行构建、视觉门禁、提交和推送。
2. 多个旧 Skill、参考文档和全局协调规则仍把 Git worktree 当作发布默认路径，指向 `/tmp/infocard-worktree`、`/tmp/infocard-*` 或单独 clone，并要求 detached HEAD、命名发布分支、worktree 内构建/提交/推送及延后清理。

旧规则已经导致 `/tmp/infocard-worktree` 形成 43 个目录、约 15.26 GiB 占用；每个近期工作树约 393–399 MiB。它既违反“信息卡禁止使用 worktree”的用户边界，也让磁盘和发布状态持续累积风险。

信息卡流程必须只保留一个可执行模型：**主仓库 `.docs` 生成过程 → manifest 精确 promotion 到 `docs`/`assets` → 主 checkout 构建、验收、提交、推送。**

## Solution

建立并落实一套 no-worktree 的唯一信息卡流程：

```text
Read-only discovery / research
  → .docs/<run-id>/<slug>/（作者候选稿、事实、证据、manifest、截图）
  → publisher validates manifest
  → publisher promotes only declared HTML / sidecar / assets into docs/ and assets/
  → local visual gate
  → build / verify / taxonomy / leak gate in primary checkout
  → narrowly stage declared artifacts + generated indexes
  → commit / push in primary checkout
  → cache-busted public HTTP/index/visual recheck
```

此变更必须：

- 禁止新信息卡流程创建、复用、进入或删除 Git worktree；
- 禁止用 `/tmp/infocard*`、`/tmp/infocard-worktree` 或 repo clone 作为创作/发布目录；
- 保留 `.docs` 作为过程与证据保留区，不把内部 bundle、截图、事实包、草稿或临时文件提升到公网；
- 保留 `docs/`、`assets/` 作为唯一正式发布目标；
- 让主题选择、更新/新建判断、直连发布和重建流程都使用同一 promotion 模型；
- 删除无法脱离旧 worktree/force-push 语义的 Skill，而把仍有价值的视觉重建知识合并进合适的现存 Skill；
- 让全局协调规则不再把 infocard-pub 当作 worktree 例外；
- 不在本次规范落盘时删除已有 `/tmp` worktree、恢复备份或未提交内容。清理是独立的、需要单独授权的后续操作。

## User Stories

1. 作为信息卡作者，我要只在主仓库的 `.docs/<run-id>/<slug>/` 写候选稿、事实包、视觉证据和 promotion manifest，以便创作过程可追溯且不复制整个仓库。
2. 作为 Publisher，我要只根据 manifest 精确提升声明文件到 `docs/` 和 `assets/`，以便过程文件不会被意外发布。
3. 作为信息卡作者，我要在任何单卡、批量、修复、主题迁移和内容扩充场景中都不创建 Git worktree，以便不再消耗数百 MiB 的重复仓库副本。
4. 作为 Publisher，我要在唯一主 checkout 执行 build、verify、taxonomy、leak、视觉门禁、commit 与 push，以便发布状态不会散落在 detached HEAD 或临时分支。
5. 作为主题分配执行者，我要在 `.docs` 记录 content shape、主题候选和拒绝理由，以便主题选择可审计而不依赖 worktree。
6. 作为既有卡更新执行者，我要先完成只读重复审计，再在 `.docs` 生成更新候选和 manifest，以便“更新”不会直接污染正式 `docs/` 或创建无关新卡。
7. 作为直连发布执行者，我要把单 URL/主题驱动场景纳入同一 `.docs → promotion` 流程，以便直连模式不成为跳过隔离和视觉门禁的旁路。
8. 作为重建执行者，我要保留 poster-shell 的 CSS 结构、移动端 grid/flex 陷阱和 DOM 验证知识，但不再使用 worktree、force-push 或主分支覆写，以便重建仍可复现且不破坏主线历史。
9. 作为主智能体，我要在项目 `AGENTS.md` 看到高优先级 no-worktree 边界，以便项目局部旧 Skill 不能覆盖用户规则。
10. 作为子智能体协调者，我要得到明确约束：信息卡子任务只写 `.docs`，不得调用 `git worktree`、不得创建 clone、不得 build/commit/push，以便执行权限与发布权限分离。
11. 作为维护者，我要保留通用工程项目的 worktree 能力，但将其与 infocard-pub 明确隔离，以便不会误伤非信息卡项目。
12. 作为磁盘维护者，我要能从规则文本中区分“禁止新建 worktree”和“已有 worktree 的独立清理”，以便不把流程迁移误当作删除授权。
13. 作为验收者，我要能在发布前验证 promotion manifest、正式路径、视觉证据、构建产物和 staged diff，以便 no-worktree 不是只写在文档里的口号。
14. 作为用户，我要在之后的信息卡任务中只看到 `.docs` 过程目录和精确发布文件，而不会再出现 `/tmp/infocard-worktree` 作为新工作路径。

## Implementation Decisions

### 1. Canonical workspace model

唯一正式模型为：

- **Authoring root:** `<repo>/.docs/<run-id>/<slug>/`
- **Formal public targets:** `<repo>/docs/` 与 `<repo>/assets/`
- **Promotion authority:** `.docs/<run-id>/<slug>/promotion-manifest.json`
- **Execution checkout:** 当前主仓库 checkout；不得创建、进入、复用或删除 Git worktree
- **No temporary repository roots:** `/tmp/infocard*`、`/tmp/infocard-worktree` 和临时 clone 均不可作为新信息卡流程目录

`run-id` 必须唯一；作者可并行写不同 `.docs/<run-id>/<slug>/`，但 Publisher promotion、build、Git 和 push 必须在同一主 checkout 串行执行。

### 2. AGENTS hard boundary

在 infocard-pub 的 `AGENTS.md` 增加最高优先级“信息卡工作区硬边界”：

- 禁止 `git worktree add/remove/prune`、`git clone`、`--detach`、`HEAD:main --force` 作为信息卡流程的一部分；
- 禁止新建或使用 `/tmp/infocard*` 作为信息卡工作目录；
- Author 只写 `.docs`；Publisher 只在主 checkout promotion、构建、验证、提交、推送；
- 既有 worktree 的盘点/清理不属于普通发布流程，必须独立授权；
- 该边界覆盖项目 Skill、全局 Skill 和任何历史 reference 的冲突叙述。

### 3. Project skill changes

以下项目 Skill 必须改为无 worktree 一致版本：

- `productivity/infocard-publish-sop`: 以 Protocol v3 的 no-worktree 原则为唯一解释；移除当前正文中所有新建、恢复、分支、清理 worktree 的活动指令；将超时恢复改为检查 `.docs/<run-id>/<slug>` 及 manifest。
- `productivity/infocard-direct-publish`: 从“直接写 docs”改为“主线程写 `.docs`，再 promotion”；删除 current worktree 表述、非快进 worktree 恢复和 worktree reference。
- `infocard/infocard-theme-assignment`: 主题记录保存在 `.docs` run evidence；现有卡换主题生成 `.docs` 候选，再由 Publisher promotion；删除 fresh named worktree、命名分支和 worktree push 规则。
- `infocard/infocard-update-vs-new-pattern`: 只读审计不触碰 Git 目录；更新与新卡均先在 `.docs` 建候选，删除“选择/创建干净 worktree”规则。
- `infocard/infocard-authoring-workflow`: 保留“无 worktree”，并收紧为 Author 不得直接写 `docs/`，只能写 `.docs`。
- `productivity/infocard-pub-publisher`: 明确为唯一 promotion、build、Git 和 Pages 执行者；拒绝 manifest 内外路径、worktree 路径与 `/tmp/infocard*` 输入。
- `publishing/authorized-infocard-execution`: 删除“以 fresh worktree 隔离 ambient state”路线，改为保存主 checkout ambient-status snapshot、限制 staged allowlist 和 `.docs` promotion。
- 任何发布/视觉/移动验证 Skill 中“当前 worktree”措辞，改为“当前主 checkout 候选版本”或“由 `.docs` manifest promotion 的候选版本”。

### 4. Global control changes (G)

以下全局 Skill 的**信息卡专用** worktree 指令必须处理：

- `productivity/infocard-worktree-isolated-commit`: 直接删除。该 Skill 不再是合法信息卡路径。
- `software-development/subagent-coordination`: 删除 `infocard-pub Worktree 清理` 与 worktree 发布示例；替换为 `.docs` author handoff、manifest promotion、主 checkout publisher 验收规则。
- `software-development/visual-card-delivery`: 对 infocard-pub 加明确排除规则；其通用视觉产物流程可保留，但不得创建 `/tmp/infocard-worktree` 或以 worktree 作为发布前提。
- `github/git-repository-sync`: 删除或改写 infocard 专用 worktree handoff gate；通用 Git 同步能力保留。
- `git-worktree-cleanup`: 保留为其他工程项目的通用清理 Skill；信息卡相关示例必须标注为历史迁移/已存量清理，禁止作为新发布模式。

本次不写入 Memory。该规则应以项目 `AGENTS.md`、项目 Skill 和上述全局 Skill 为可执行真相源。

### 5. Poster-shell disposition

`infocard-poster-shell-rebuild` 的仍有价值部分是：

- poster-shell card 的 grid/flex 结构；
- 编号列、stripe、body 的响应式约束；
- CSS specificity 与移动端布局陷阱；
- DOM/computed geometry 验证方法；
- “何时应重建而非持续 patch”的触发条件。

它的 worktree + force-push 部分不可保留。处理方式：

1. 将上述有用内容合并到 `infocard-authoring-workflow` 的“结构重建与响应式修复”章节或独立 reference；
2. 更新相关 `infocard-crayon-style` 交叉引用；
3. 删除 `infocard-poster-shell-rebuild` Skill 及其仅剩的 reference，避免未来被当作发布执行路径加载；
4. 删除前必须确认没有其他项目 Skill 将它列为 required/related dependency；若有，先替换引用再删。

### 6. Reference taxonomy

旧 reference 不应继续以可执行步骤的形式引导 worktree。处理分级：

- **删除:** 仅描述新建/提交/推送/force-push/清理 worktree 的执行 reference。
- **重写:** 含有仍有效的 metadata、视觉、内容或恢复知识，但以 worktree 为前提的 reference；将路径换为 `.docs` 和主 checkout。
- **保留并标为历史:** 仅用于解释现存 `/tmp` worktree 成因或存量清理证据的 incident record；正文首部必须写“不得用于新信息卡发布”。

至少审查这些已知引用：

- `infocard-direct-publish/references/worktree-isolated-commit.md`
- `infocard-direct-publish/references/topic-driven-direct-publish-pattern.md`
- `infocard-authoring-workflow/references/template-clone-guide.md`
- `infocard-authoring-workflow/references/interrupted-batch-recovery.md`
- `infocard-authoring-workflow/references/build-worktree-command-and-warning-gate.md`
- `infocard-hardblue-style/references/worktree-draft-pattern.md`
- `infocard-publish-sop/references/local-worktree-hard-gate-20260718.md`
- `infocard-publish-sop/references/publish-worktree-git-patterns.md`
- `infocard-publish-sop/references/parallel-batch-publish-20260719.md`
- `infocard-publish-sop/references/subagent-timeout-worktree-recovery.md`
- `infocard-publish-sop/references/release-local-hard-gates.md`
- `infocard-publish-sop/references/integration-recovery.md`
- `infocard-publish-sop/references/worktree-gitlink-pollution-recovery.md`

### 7. No implicit cleanup

本次变更只改未来流程与规则文本；不删除：

- `/tmp/infocard-worktree` 中任何目录；
- 未注册但可能含恢复物的 `/tmp/infocard*` 目录；
- 主仓库或旧 worktree 中的未提交内容；
- `hehome` 下数据库或恢复备份。

存量清理另立任务，必须先分类 clean / dirty / unregistered / active，再获得明确的目录级删除授权。

## Testing Decisions

### Primary acceptance seam

以一个仓库级静态策略测试作为最高验收面：扫描信息卡执行入口、项目 Skill、全局 Skill 和 active references，确认新流程不存在可执行 worktree 路径，且 `.docs → promotion manifest → docs/assets` 契约完整。

测试不应依赖“某个文档包含或不包含单词 worktree”这一实现细节；应验证对外行为与约束：

- 新卡 authoring 指令只允许 `.docs/<run-id>/<slug>/`；
- Publisher 指令只允许从 manifest promotion；
- 信息卡执行入口拒绝 `/tmp/infocard*` 和 worktree 命令；
- 主 checkout 是唯一 build/commit/push 位置；
- 存量清理没有被普通发布流程触发。

### Required checks

1. **Policy scan:** 针对信息卡执行入口和 active references 运行 allowlist/denylist 检查；允许“历史存量清理”上下文提到 worktree，但禁止任何新建/进入/发布的命令模式。
2. **Promotion manifest test:** 用 fixture 验证 source 必须在 `.docs/<run>/<slug>/`，target 只能在 `docs/` 或 `assets/`，拒绝绝对路径、`..`、`/tmp/infocard*`、重复 target 和未声明源文件。
3. **Publisher path test:** 模拟 Publisher preflight，证明它能在主 checkout promotion，并拒绝 worktree cwd、clone cwd、detached HEAD 和非主 checkout 路径。
4. **Author boundary test:** 验证 Author 不能直接写 `docs/`、`assets/`、`_index.yaml`、`index.html`、Git state 或 `/tmp`。
5. **Update/rebuild regression test:** 更新既有卡和 poster-shell 重建的文档流程都必须通过 `.docs` candidate + manifest promotion，不得使用 force-push。
6. **Visual gate regression:** 验证 promotion 后、build 前仍要求最新 desktop/mobile 截图与 HTML hash 绑定 manifest；no-worktree 迁移不能降低视觉门禁。
7. **Reference resolution test:** 删除/合并 poster-shell Skill 后，所有 `related_skills`、显式 `skill_view` 文本和项目路由表不得残留断链。
8. **No-side-effect test:** 规则更新的测试和 dry-run 不得调用 `git worktree add/remove/prune`、`git clean`、`rm -rf /tmp/infocard*`、`git push --force` 或外部发布。

### Manual verification

- 在主 checkout 创建一个虚拟 `.docs/<run>/<slug>` fixture；
- 运行 manifest validation / promotion dry-run；
- 检查仅声明的 `docs/<slug>.html` 与 `.meta.yaml` 会进入 promotion 计划；
- 检查 `git status --short` 只显示 fixture 所预期的文件；
- 检查 `git worktree list` 没有因该流程新增条目；
- 在真实新卡发布时，记录 `.docs` 路径、promotion manifest、主 checkout SHA、desktop/mobile visual evidence 和 staged allowlist。

## Out of Scope

- 不在本 spec 执行阶段清理现有 15G+ `/tmp/infocard-worktree`。
- 不删除任何已有 worktree、clone、浏览器 profile、恢复数据库或未提交内容。
- 不改变非信息卡工程项目使用 worktree 的通用能力。
- 不改变信息卡内容质量门禁、视觉门禁、build/verify/taxonomy/leak 检查或 Pages 公网验收要求。
- 不修改信息卡本身的主题 token、HTML 内容或已发布卡片，除非为验证新流程创建受控 fixture。
- 不写入 Hermes Memory；本变更的持久规则只落在项目与 Skill 文档。

## Further Notes

- 这是一项流程迁移与规则一致性修复，不是一次“清理磁盘”操作。
- 当前主仓库有 ambient dirty/untracked 文件。实现前必须记录它们，不得 reset、stash、add 或顺带提交。
- 当前分区空间紧张。实现本 spec 本身不得创建 worktree、clone、无界 screenshot profile 或大体积构建副本。
- `infocard-poster-shell-rebuild` 的删除是有条件删除：先抽取有用结构知识、替换引用、验证无活跃依赖，才允许删除。
- 规范执行后，应将历史 `/tmp` worktree 的处理拆为独立清理 spec；该清理 spec 需要明确列出候选、恢复价值、分支可达性、dirty 状态、删除顺序和回滚锚点。
