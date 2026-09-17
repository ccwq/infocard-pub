## SEC 01 — 背景：为什么需要 Managed Agents

### 传统 Messages API 的局限

| 维度 | Messages API | 影响 |
|------|-------------|------|
| 请求模式 | 单次 HTTP 请求，无状态 | 无法跨越多轮交互保留上下文 |
| Agent 循环 | 需开发者自行实现 | 轮次控制、工具执行、错误处理全由你写 |
| 状态持久化 | 不保存文件系统/对话历史 | 每次请求都是全新上下文 |
| 基础设施 | 完全由你负责 | 沙箱、网络隔离、工具执行层均需自建 |

### Managed Agents 解决的核心问题

- **有状态**：对话历史、文件系统状态在 Session 期间全程保留，Agent 可跨多轮访问之前的输出
- **长时运行**：任务可持续数分钟至数小时，Agent 自主决策并执行多步骤工作流
- **免基础设施**：无需自建 Agent 循环、沙箱或工具执行层，Anthropic 提供完整托管框架

### 适用场景

| 场景 | 说明 |
|------|------|
| 复杂多步骤任务 | 代码生成 + 单元测试 + PR 创建的完整流水线 |
| 非同步工作 | 人类审批环节介入的 Agent 工作流 |
| 排程执行 | 按 cron 周期自动运行的定时任务 |
| 云端隔离沙箱 | 需安全执行环境（不信任目标网站代码） |

### 与自建 Agent 的 TCO 对比

| 维度 | Messages API 自建 | Managed Agents |
|------|-------------------|----------------|
| 基础设施 | 自建沙箱容器 | Anthropic 托管（零运维） |
| 开发时间 | 2–4 周（Agent 循环+工具层） | 1–2 天（API 调用） |
| 运维成本 | 容器管理、网络、防火墙 | 零 |
| 扩展性 | 需自行处理并发 | 平台自动弹性 |
| 有状态支持 | 需自行实现 | 开箱即用 |

---

## SEC 02 — 核心概念：四个构件

Claude Managed Agents 围绕四个核心概念构建：

### Agent（代理）

可复用、带版本控制的配置单元。一次定义，可在多个 Session 中通过 ID 引用。

```json
{
  "id": "agent_01HqR2k7vXbZ9mNpL3wYcT8f",
  "name": "Coding Assistant",
  "type": "agent",
  "version": 1,
  "model": { "id": "claude-opus-5", "effort": { "type": "high" } },
  "system": "You are a helpful coding agent.",
  "tools": [{ "type": "agent_toolset_20260401" }],
  "created_at": "2026-04-03T18:24:10.412Z"
}
```

### Environment（环境）

定义 Agent 运行所在的沙盒配置。云端沙盒（Anthropic 托管）或自架沙盒（满足合规/数据驻留）。

- 多个 Session 可共享同一个 Environment，但每个 Session 获得独立 Linux 容器
- Environment 没有版本控制，频繁更新需自行记录变更历史

### Session（会话）

运行中的 Agent 实例，带持久化文件系统 + 对话历史。Agent 自主执行工具，结果通过 SSE 实时推送。

### Event（事件）

Client 与 Agent 之间交换的消息，通过 Server-Sent Events（SSE）流式传输。

### 概念关系图

```
Client App
    │
    ├─► POST /v1/sessions  (创建 Session)
    │       │
    │       ▼
    │   Session  ────────────────────►  Agent  ──►  Environment
    │   (运行实例)                     (配置)         (沙盒配置)
    │
    └─► SSE events.stream()           Agent 执行
            │                         Tool 调用
            ▼                         实时推送事件
        agent.message / agent.tool_use / session.status_idle
```

---

## SEC 03 — Agent 创建与配置详解

### 核心字段

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | ✅ | 人类可读名称，字符串 |
| `model` | ✅ | Claude 模型 ID 或对象形式（支持 speed/effort） |
| `system` | — | System prompt，定义 Agent 行为角色 |
| `tools` | — | 工具集配置（agent_toolset/MCP/自定义） |
| `mcp_servers` | — | MCP 服务器声明列表 |
| `skills` | — | Agent 可引用的 Skills 列表 |
| `description` | — | 人类可读描述 |
| `metadata` | — | 自定义键值对 |

### model 字段详解

**字符串形式（固定速度）：**

```json
"model": "claude-opus-5"
```

**对象形式（精细控制）：**

```json
"model": {
  "id": "claude-opus-5",
  "speed": "standard",
  "effort": { "type": "high" }
}
```

支持的 model ID：`claude-opus-5`、`claude-opus-4-8`、`claude-opus-4-7`、`claude-sonnet-5`、`claude-sonnet-4-7` 等。

### effort 级别对工具调用行为的影响

| 级别 | 行为特征 |
|------|----------|
| `low` | 最少工具调用，快速响应 |
| `medium` | 平衡模式（默认） |
| `high` | 更多迭代、测试、验证 |
| `xhigh` | 极度谨慎，大量自检 |
| `max` | 最强制性检查 |
| `{ "type": "high", "budget_tokens": 5000 }` | 指定工具调用的 Token 上限 |

**注意**：`speed` 和 `effort` 只能在 Agent 级别设置，无法在 Session 级别覆盖。

### tools 类型

| 类型 | type 值 | 说明 |
|------|---------|------|
| 预建工具集 | `agent_toolset_20260401` | 内置工具：bash/read/write/edit/glob/grep/web_search/web_fetch |
| MCP 工具 | 通过 `mcp_servers` 配置 | 连接外部 MCP 服务器获取工具 |
| 自定义工具 | `custom` | 用户定义工具名 + JSON Schema，由你的应用执行后返回结果 |

**工具输出截断阈值**：当工具输出超过 **100,000 字符**（约 25,000 token）时，自动写入沙箱文件，Agent 收到截断预览 + 文件路径。

### version 机制：乐观并发控制

```bash
# 更新 Agent（带 version 实现乐观锁）
curl -X PUT https://api.anthropic.com/v1/agents/$AGENT_ID \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d '{
    "version": 1,
    "system": "Updated system prompt"
  }'
# 成功返回 200；version 不匹配返回 409 Conflict
```

### 完整 curl 示例：创建 Agent

```bash
agent=$(curl -sS --fail-with-body https://api.anthropic.com/v1/agents \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d @- <<'EOF' | jq -r '.id'
{
  "name": "Coding Assistant",
  "model": "claude-opus-5",
  "system": "You are a helpful coding agent. Write clean, well-documented code.",
  "tools": [{"type": "agent_toolset_20260401"}]
}
EOF
)
echo "Agent ID: $agent"
```

---

## SEC 04 — Environment 配置详解

### 云端沙箱 vs 自架沙箱

| 维度 | 云端沙箱（type: cloud） | 自架沙箱（self-hosted） |
|------|------------------------|------------------------|
| 管理方 | Anthropic | 你自己（Docker/K8s） |
| 预装包 | Python/Node.js/Bash/网络 | 自定义镜像 |
| 数据驻留 | Anthropic 数据中心 | 你的基础设施 |
| 适用场景 | 通用快速开始 | 合规/数据主权/定制环境 |

### packages 预装字段

支持的包管理器：`apt`、`cargo`、`gem`、`go`、`npm`、`pip`。

```bash
environment=$(curl -fsS https://api.anthropic.com/v1/environments \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  --data @- <<'EOF' | jq -r '.id'
{
  "name": "data-analysis",
  "config": {
    "type": "cloud",
    "packages": {
      "pip": ["pandas==2.2.0", "numpy", "scikit-learn"],
      "npm": ["express@4.18.0"]
    },
    "networking": {"type": "unrestricted"}
  }
}
EOF
)
echo "Environment ID: $environment"
```

### networking 网络配置

| 模式 | 描述 |
|------|------|
| `unrestricted` | 完全出站网络访问（默认） |
| `limited` | 限制到 `allowed_hosts`，需设 `allow_package_managers` 和 `allow_mcp_servers` |

```json
{
  "networking": {
    "type": "limited",
    "allowed_hosts": ["api.github.com", "pypi.org"],
    "allow_package_managers": true,
    "allow_mcp_servers": true
  }
}
```

### 生命周期

```
创建 Environment（POST /v1/environments）
  → 关联 Session（每个 Session 获得独立沙箱容器）
  → 运行中（Agent 在沙箱内执行工具）
  → 终止/归档（手动删除或过期自动清理）
```

**关键约束**：

- 环境没有版本控制，频繁更新需自行记录变更历史
- 归档后现有 Session 继续运行，新 Session 无法引用
- 删除前必须先归档，且无活跃 Session 引用

---

## SEC 05 — Session 生命周期

### 创建 Session

**最小请求：**

```bash
session=$(curl -fsSL https://api.anthropic.com/v1/sessions \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "anthropic-beta: managed-agents-2026-04-01" \
  -H "content-type: application/json" \
  -d @- <<'EOF' | jq '{id: .id, status: .status}'
{
  "agent": "$AGENT_ID",
  "environment_id": "$ENVIRONMENT_ID",
  "title": "Quickstart session"
}
EOF
)
SESSION_ID=$(jq -r '.id' <<< "$session")
echo "Session ID: $SESSION_ID"
```

### Session 状态机

| 状态 | 说明 |
|------|------|
| `initializing` | Session 创建，Agent 加载配置中 |
| `running` | Agent 正在处理任务（**计费时段**） |
| `idle` | Agent 等待输入，`stop_reason` 说明原因 |
| `rescheduling` | 瞬态错误，平台自动重试（不收费） |
| `terminated` | 终态，Session 结束 |

**计费说明**：只有 `running` 状态计费。`idle` / `rescheduling` / `terminated` 不计 Session 运行时长。

### 有状态特性

- **文件系统持久化**：`write` 工具创建的文件在 Session 生命周期内保留
- **对话历史保留**：每次 `events.send` 后追加到历史，Agent 感知上下文
- **工具调用上下文**：Agent 可读取前序 `write` 的文件作为下一步的输入

### Session 限制（按用量层级）

| 操作 | 限制 |
|------|------|
| 创建端点（agents/sessions/environments） | 300 请求/分钟 |
| 读取端点（retrieve/list/stream） | 1,200 请求/分钟 |
| 并发 Session 数 | 按账户计划（Start/Build/Scale tier） |
| Session 最大运行时长 | 按计划（可联系销售定制） |

### Session 清理

- **手动删除**：`DELETE /v1/sessions/{id}`，事件流立即终止
- **过期自动清理**：按账户级别的数据保留策略
