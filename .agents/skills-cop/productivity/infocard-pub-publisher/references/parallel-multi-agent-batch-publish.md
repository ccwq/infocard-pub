# 并行多智能体批量发布模式

> 2026-06-23 验证：4 张卡并行创建，总耗时约 15 分钟（含 Pages 部署等待）。

## 核心模式

当一轮要发布 3+ 张信息卡时，用 `delegate_task` 并行分发子智能体，而不是顺序逐张写。

### 角色分工

| 角色 | 数量 | 职责 | git 操作 |
|---|---|---|---|
| **Pipeline Agent** | 1 | 第一张卡的完整链路：采集 → HTML → meta → build → push → Pages 验收 → wiki 同步 | ✅ 全权 |
| **Writer Agent** | N | 后续每张卡：采集 → HTML → meta，只写文件 | ❌ 禁止 |
| **Parent** | 1 | 等所有 Writer 完成后，批量 build + push + wiki 同步剩余卡 | ✅ 统一 |

### 为什么这样分

- **git 冲突规避**：如果多个子智能体同时 `npm run build` + `git push`，`_index.yaml` 和 `index.html` 会产生 add/add 冲突。
- **并行效率**：Writer Agent 只写 HTML + meta，不碰 git，可以完全并行。Pipeline Agent 独占 git 操作。
- **批量 build**：Parent 在所有 Writer 完成后，一次性 `npm run build && npm run verify`，然后单次 commit + push 所有剩余卡。

### 执行顺序

```
1. dispatch Pipeline Agent（第一张卡，含全链路）
2. dispatch Writer Agent A（第二张卡，只写文件）
3. dispatch Writer Agent B（第三张卡，只写文件）
4. dispatch Writer Agent C（第四张卡，只写文件）
   ↓ 所有 Agent 并行运行 ↓
5. Pipeline Agent 完成第一张卡的 push
6. Writer Agents 完成文件写入
7. Parent 接手：批量 build → commit → push 剩余卡
8. Parent 验证所有卡 HTTP 200
9. Parent 批量 wiki 同步剩余卡
```

### 关键约束

- **Writer Agent 的 context 必须明确写"不要运行 npm run build，不要 git add/commit/push"**，否则子智能体可能自行 build 导致 `_index.yaml` 冲突。
- **Writer Agent 的 context 必须传入参考卡路径**（如 `docs/20260606-curl-md-hardblue.html`），让子智能体复制 CSS 骨架而不是从零写。
- **Writer Agent 的 context 必须传入时间戳获取命令**（`TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M:%S'`），避免子智能体用错误时间。
- **Parent 在批量 build 前不需要等待 Pipeline Agent 完成**——只要 Writer Agent 的文件都落盘了，就可以开始 build。Pipeline Agent 的 push 和 Parent 的 push 是两个独立 commit，不会冲突（因为 Pipeline Agent 只提交第一张卡，Parent 只提交剩余卡）。
- **但如果 Pipeline Agent 和 Parent 同时 push**，可能产生 non-fast-forward。安全做法：Parent 在 build 前先 `git pull --rebase`，或者等 Pipeline Agent 完成后再 push。

### 本次会话的实测数据

- 4 张卡：mihomo-toolkit（Pipeline）、deer-flow / gstack / karpathy-skills（Writer）
- Pipeline Agent 独立完成：采集 → SVG 占位图 → build → push `e841831` → wiki
- 3 个 Writer Agent 并行写文件，总耗时约 10 分钟
- Parent 批量 build（352 cards）→ commit `9c2b28d` → push → 4 张卡全部 HTTP 200
- Wiki 批量同步：raw + concept + index + log，commit `f0aec93`

### 适用场景

- 一轮发布 3+ 张信息卡
- 卡之间无依赖关系（各自独立来源）
- 需要尽快完成全部发布而不是逐张排队

### 不适用场景

- 卡之间有内容依赖（如卡 B 引用卡 A 的结论）
- 只发 1-2 张卡（并行开销大于收益）
- 需要严格视觉一致性审查的批次（并行写入可能导致风格漂移，需 Parent 事后抽查）

## 2026-07-07 新增：子智能体超时 + 并发写冲突处理

### 场景：子智能体超时但文件已写完
**现象**：子智能体 dispatch 后超时（600s），但文件（HTML + meta.yaml）已写入本地仓库。

**判断标准**：
```
curl HTTP 200 → 子智能体已完成 push，跳过
curl HTTP 404 → push 失败，需接手
```

**接手流程**：
1. `git status` 检查 untracked 文件
2. 如果只有目标卡文件 → 直接 build → commit → push
3. 如果有其他 untracked → 检查是否相关，不相关先 stash

### 场景：子智能体写的时间戳错误
**现象**：meta.yaml 中 `date: "2026-07-07 23:29:23"`（子智能体 session 时钟，与主会话不同步）。

**修复**：
```bash
current_ts=$(TZ=Asia/Shanghai date "+%Y-%m-%d %H:%M:%S")
# patch meta.yaml: date → current_ts, 确保 updated 字段存在
```

### 场景：主会话和子智能体同时写同一文件
**现象**：`write_file` 报警告 `was modified by sibling subagent`。

**处理**：
1. 先 `read_file` 读取子智能体版本
2. 判断质量：合格 → 接受子智能体版本；不合格 → 读取后再覆盖
3. 检查 meta.yaml 时间戳

### 场景：CI 报错 `missing required updated`
**根因**：2026-07-07 起 CI 要求 changed/new cards 必须有 `updated` 字段。

**修复**：meta.yaml 加一行 `updated: "<与 date 同值>"`。
