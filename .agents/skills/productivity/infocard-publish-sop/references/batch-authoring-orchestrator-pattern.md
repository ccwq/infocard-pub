# Batch Authoring：`content.json` 单一权威与确定性渲染

## 问题：子智能体批量超时（5/5 实测）

**症状**：5 个 Authoring 子智能体全部在 600s 超时，子智能体报告完成但文件未落地（或报告超时但文件已写入）。

**根因**：子智能体 goal 中包含"读取 theme template（29KB HTML）+ bundle + facts"，三项 I/O 加起来可能消耗 300-400s API 调用时间，内容生成 budget 不足。

**2026-07-19 实测记录**：
- 第一批 3 个（SkillSpec/Agent Apprenticeship/ToolPort）：全部 timeout
- 第二批 2 个（Juggler/Agent Talk）：Juggler 报告完成但文件未落地；Agent Talk timeout
- 5 个子智能体 0 产物，最终由主线程直接生成

## 当前标准模式：Author 只交付 `content.json`

本文件原先采用“主线程准备 HTML shell，子智能体填占位符”的过渡方案。该方案仍让 Author 与主线程写同一 HTML，并不能彻底消除超时后的重复生成和多写者问题，现已被 `batch-content-json-authoring.md` 取代。

### Author 职责

- 只读取冻结 bundle 与精简 facts；
- 立即写入最小合法的 run-local `content.json`，再增量补充章节；
- 不读取 theme template；
- 不写 HTML、Markdown、meta YAML、时间戳、索引或 Git 状态；
- 完成时返回路径、大小、mtime、状态及缺失字段。

### 主线程职责

- 创建唯一 integration/publish worktree；
- 校验全部 `content.json` 与 bundle claim IDs；
- 以 `content.json + bundle + registered theme` 确定性生成 HTML、Markdown、meta 和 manifest；
- 全批次只统一 build、审计、提交和 push 一次；
- Author 超时后先取证，只补缺失内容，不重新生成已存在章节。

完整 schema、恢复树和 renderer 契约见 `batch-content-json-authoring.md`。

## Worktree Detached HEAD Push 异常

### 症状
```
git add + git commit → 本地 commit 创建成功
git push origin main → "Everything up-to-date"（实际未推送）
```

### 根因
`git worktree add --detach` 创建的 worktree，HEAD 是 detached，不属于任何本地分支。`git commit` 创建的 commit 属于 detached HEAD，不在任何分支上。`git push origin main` 尝试推送当前 HEAD（detached commit）到 `origin/main`，但 Git 检测到 `origin/main` 没有落后，push 被静默忽略。

### 正确策略

多卡发布只使用唯一 integration/publish worktree；禁止因 detached HEAD 问题退回脏主仓库直接写入和提交。

1. 从最新 `origin/main` 创建有名发布分支及对应 worktree，或在现有发布 worktree 中显式创建分支；
2. 主线程把确定性渲染产物写入该 worktree；
3. 在该 worktree 内统一 build、门禁和提交；
4. 推送时使用明确 refspec，例如：

```bash
git push origin HEAD:main
```

5. 若 `origin/main` 已前进，按 `integration-recovery.md` 在同一发布 worktree 中执行一次 fetch/rebase、重建和复验；不得 force-push。

Author 不创建提交，因此正常的 `content.json` 模式不应再产生 detached Author commit。

## verify-index.js 依赖 HEAD 而非 index

### 症状
```
[verify-index] ERROR: docs/20260719-foo.html.meta.yaml exists on disk, but not in 'HEAD'
```

### 根因
`verify-index.js` 调用 `git show HEAD:<path>` 验证新文件存在。该命令在文件 staged 但未 commit 时失败。

### 正确序列

若 live `verify-index.js` 使用 `git show HEAD:<path>`，新文件在首次内容提交前无法通过该特定 HEAD 检查；仅 staging 不会让文件进入 HEAD。不得把“已 stage”误报成“已在 HEAD”。

采用仓库当前发布协议的两阶段门禁：

```text
1. 渲染全部声明源产物
2. 运行 prebuild/local structure gate（不依赖新文件已在 HEAD）
3. npm run build
4. 审计 diff 和 allowlist，运行 postbuild gate
5. 精确 stage 卡片源产物 + _index.yaml + index.html
6. 创建内容 commit
7. 在 commit 后运行依赖 HEAD 的 verify-index / pre-CDN gate
8. 失败则在同一发布 worktree 修复、重建、复验并 amend 或追加修复 commit
9. git push origin HEAD:main
```

`npm run build` 会重写 `_index.yaml` 和 `index.html`，必须在 build 后重新 stage。具体命令以仓库当前 validator 和 Protocol v3 为准。

## Author timeout evidence flow

When an Author reports timeout, inspect the one authoritative handoff instead of searching for HTML side effects:

```bash
CONTENT=/tmp/infocard-runs/<run-id>/<slug>/author/content.json
stat "$CONTENT"
python3 -m json.tool "$CONTENT" >/dev/null
```

Record:

1. whether the file exists;
2. byte size and mtime;
3. JSON parse result;
4. `status` (`PARTIAL` or `COMPLETE`);
5. required sections present and missing;
6. unresolved bundle claim IDs.

Recovery:

- valid + `COMPLETE` → render normally;
- valid + `PARTIAL` → main thread minimally completes missing fields;
- invalid JSON → recover the last atomic valid form if present, otherwise salvage only unambiguous fields;
- no file → main thread generates from the frozen facts; do not re-dispatch by default.

Never infer completion from a subagent summary alone, and never start another writer for the same path before the first writer is fenced or finished.

## 2026-07-19 新增教训：主线程先提取内容，子智能体只写卡

**症状**：两次并行发布任务，子智能体均报 `status=timeout, 600s`，但仓库中已有对应 commit（第一次 `8cd00da` 含 Loop→Graph 卡，第二次 `72d4cac` 含 finding-unknowns 卡）。

**根因**：子智能体 goal 中塞入完整 Protocol v3 流程（~20KB 的 skill references、protocol docs）后，API I/O 消耗大量时间，内容生成 budget 不足。子智能体实际已完成工作，只是 API 调用耗尽导致报告超时。

**正确模式**：
1. 主线程先提取来源内容（browser/curl，5-10 分钟）
2. 子智能体只接收精简 facts + 写作指令（单次 API 调用内可完成）
3. 子智能体超时后，主线程先查 `git log --oneline` 和 worktree list：
   - 有 commit → 直接 merge + push（子智能体已完成）
   - 无 commit → 主线程直接写卡发布

```bash
# 超时后立即检查
git log -1 --oneline
git worktree list
# 有产物 → merge → push
# 无产物 → 主线程接管
```

**不要**：超时后等待子智能体、重新派发、或默认"无产物"而放弃。

## 触发条件

当用户要求"并行创建和发布 N 张信息卡"（N ≥ 2）时激活本模式。

## 相关文档

- `bundle-to-authorstage-pattern.md` — bundle 冻结后到独立 author-stage 的流程
- `light-route-url-driven-pattern.md` — 单卡轻量发布
- `integration-recovery.md` — worktree push 冲突处理
