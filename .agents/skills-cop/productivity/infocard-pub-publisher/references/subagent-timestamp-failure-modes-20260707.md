# Subagent Meta Timestamp Failure Modes (2026-07-07)

## Failure Mode A: Future/Wrong Timestamp from Subagent Clock
**现象**：子智能体创建 meta.yaml，`date` 字段为 `2026-07-07 23:29:23`（子智能体 session 内部的执行时间，与主会话时间不同步，且可能是未来时间）。

**根因**：子智能体 prompt 写了 `TZ=Asia/Shanghai date` 但未在 prompt 中约束格式正确性，子智能体可能在不同上下文执行。

**识别**：
- `date` 值与实际 push 时间差 >1 小时
- `date` 可能是未来时间（子智能体 session 时钟漂移）

**修复**：
1. `read_file` 查看现有 meta.yaml
2. `patch` 替换 `date` 为当前正确时间（用主会话的 `TZ=Asia/Shanghai date`）
3. 如果 CI 报错 `missing required updated`，也加上 `updated` 字段（值与 `date` 相同）
4. `npm run build && npm run verify` 确认通过

**预防**：主 Agent 接手后用自己的 `TZ=Asia/Shanghai date` 回填，不依赖子智能体生成的时间。

## Failure Mode B: `updated` Field Required for New Cards (CI Gate)
**现象**：`npm run verify` 报错 `docs/YYYYMMDD-xxx.html.meta.yaml: missing required updated`

**根因**：2026-07-07 CI 升级，`verify-meta-timestamps.js` 开始检查 changed/new cards 必须同时有 `date` 和 `updated` 字段。

**修复**：
```yaml
date: "2026-07-07 07:10:00"
updated: "2026-07-07 07:10:00"
```

**注意**：旧卡（未修改的不算 changed/new）不需要补 `updated`。仅限本轮新建或修改的卡需要。

## Concurrent Subagent Warning
**现象**：历史现场值（不可复制执行）：`write_file` 报错 `_warning: /home/ccwq/infocard-pub/docs/20260707-react-bits.html was modified by sibling subagent`

**根因**：两个子智能体（主会话派发的 + 子智能体自己派发的）同时写同一文件。

**处理**：
1. 先 `read_file` 确认子智能体版本内容
2. 如果子智能体版本质量合格 → 接受子智能体版本，放弃主会话版本
3. 如果子智能体版本有问题 → 用 `read_file` 读取后再 `write_file` 覆盖（避免警告）
4. 检查 meta.yaml 是否也由子智能体创建，如有需检查时间戳

**预防**：派发子智能体后不要在主会话直接写同名文件。
