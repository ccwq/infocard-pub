## SEC 06 — Events 与 SSE 流

Claude Managed Agents 通过 **Server-Sent Events (SSE)** 实时推送会话事件。客户端先调用 `events.stream` 打开流，再调用 `events.send` 发送用户消息，Agent 的每一次思考、工具调用、回复块都会以事件形式推送到客户端。

### 事件类型完整列表

#### 用户事件（User Events）

| Type | Description |
| --- | --- |
| `user.message` | 用户消息，包含 text / image / document 内容块 |
| `user.interrupt` | 中断 Agent 执行 |
| `user.custom_tool_result` | 响应 Agent 发起的自定义工具调用 |
| `user.tool_confirmation` | 审批或拒绝 Agent / MCP 工具调用（配合 permission_policy） |
| `user.define_outcome` | 定义 Agent 追求的目标 |
| `user.tool_result` | 仅限 self_hosted 环境，由集成方提供 agent_toolset 结果 |

#### Agent 事件（Agent Events）

| Type | Description |
| --- | --- |
| `agent.message` | Agent 响应内容块（text / image / tool_use / tool_result） |
| `agent.thinking` | Agent 正在进行 extended thinking 的进度信号，不含思考内容 |
| `agent.tool_use` | Agent 调用预建工具（bash、文件操作等），携带 evaluated_permission |
| `agent.tool_result` | 预建工具执行结果 |
| `agent.mcp_tool_use` | Agent 调用 MCP 服务器工具，携带 evaluated_permission |
| `agent.mcp_tool_result` | MCP 工具执行结果 |
| `agent.custom_tool_use` | Agent 调用自定义工具，需客户端通过 `user.custom_tool_result` 响应 |
| `agent.thread_context_compacted` | 对话历史被压缩以适应上下文窗口 |
| `agent.thread_message_received` | 多 Agent 场景：子 Agent 向协调器发回报告或提问 |
| `agent.thread_message_sent` | 多 Agent 场景：协调器向子 Agent 发送任务或追问 |

#### 会话事件（Session Events）

| Type | Description |
| --- | --- |
| `session.status_running` | Agent 正在处理任务 |
| `session.status_idle` | Agent 完成当前任务并等待输入，包含 stop_reason |
| `session.status_rescheduled` | 发生瞬态错误，Session 自动重试 |
| `session.status_terminated` | Session 结束（不可恢复错误或被归档） |
| `session.deleted` | Session 被删除，事件流终止 |
| `session.updated` | Session 更新请求变更了字段，下一回合生效 |
| `session.error` | 处理时发生错误，包含 typed error 对象和 retry_status |
| `session.usage` | Session 累计用量快照（token 计数和成本追踪） |
| `session.thread_created` | 多 Agent 场景：创建了新线程 |
| `session.thread_status_running` | 线程开始执行（主线程和子线程均会触发） |
| `session.thread_status_idle` | 线程完成回合并等待输入，含 stop_reason |
| `session.thread_status_rescheduled` | 线程遇瞬态错误自动重试 |
| `session.thread_status_terminated` | 线程被归档或遇到终态错误 |

#### Span 事件（Span Events）

| Type | Description |
| --- | --- |
| `span.model_request_start` | 模型推理调用开始 |
| `span.model_request_end` | 模型推理完成，包含 model_usage（token 计数） |
| `span.outcome_evaluation_start` | 结果评估开始 |
| `span.outcome_evaluation_ongoing` | 结果评估进行中的心跳 |
| `span.outcome_evaluation_end` | 评估周期完成；`needs_revision` 继续下一轮，其余为终态 |

#### 系统事件（System Events）

| Type | Description |
| --- | --- |
| `system.message` | 在当前及后续回合追加特权级系统上下文（需 Claude Fable 5.1 / Mythos 5.1 / Opus 5 / Opus 4.8 等模型支持） |

### SSE 事件格式

每个 SSE 事件以 `event: <type>` 行开头，后跟 `data: <JSON>`：

```
event: agent.message
data: {"type":"agent.message","content":[{"type":"text","text":"Hello!"}]}

event: agent.tool_use
data: {"type":"agent.tool_use","name":"bash","input":{"command":"ls -la"}}

event: session.status_idle
data: {"type":"session.status_idle","stop_reason":{"type":"end_turn"}}
```

### Python SDK 处理 SSE（完整可运行示例）

```python
from anthropic import Anthropic

client = Anthropic()

session_id = "session_xxx"  # 替换为实际 session ID

with client.beta.sessions.events.stream(session_id) as stream:
    # 打开流后立即发送用户消息
    client.beta.sessions.events.send(
        session_id,
        events=[
            {
                "type": "user.message",
                "content": [
                    {
                        "type": "text",
                        "text": "List the files in the current directory",
                    }
                ],
            }
        ],
    )

    # 处理流式事件
    for event in stream:
        match event.type:
            case "agent.message":
                for block in event.content:
                    if hasattr(block, "text"):
                        print(block.text, end="")
            case "agent.tool_use":
                print(f"\n[Using tool: {event.name}]")
            case "agent.tool_result":
                print(f"\n[Tool result: {event.content[:80]}...]")
            case "session.status_idle":
                print("\n\nAgent finished.")
                break
            case "session.error":
                print(f"\n\nError: {event.error}")
                break
```

### Node.js SDK 处理 SSE（完整可运行示例）

```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();
const sessionId = "session_xxx"; // 替换为实际 session ID

async function main() {
  const stream = await client.beta.sessions.events.stream(sessionId);

  // 打开流后发送用户消息
  await client.beta.sessions.events.send(sessionId, {
    events: [
      {
        type: "user.message",
        content: [
          {
            type: "text",
            text: "List the files in the current directory",
          },
        ],
      },
    ],
  });

  // 处理流式事件
  for await (const event of stream) {
    if (event.type === "agent.message") {
      for (const block of event.content) {
        if (block.type === "text") {
          process.stdout.write(block.text);
        }
      }
    } else if (event.type === "agent.tool_use") {
      console.log(`\n[Using tool: ${event.name}]`);
    } else if (event.type === "agent.tool_result") {
      console.log(`\n[Tool result received]`);
    } else if (event.type === "session.status_idle") {
      console.log("\n\nAgent finished.");
      break;
    } else if (event.type === "session.error") {
      console.error(`\n\nError:`, event.error);
      break;
    }
  }
}

main().catch(console.error);
```

### stream=true vs stream=false 行为差异

| 行为 | stream=true（默认） | stream=false |
| --- | --- | --- |
| 响应方式 | SSE 流式推送事件 | 非流式，返回完整响应对象 |
| 实时性 | 实时接收 tool_use / tool_result 事件 | 等待 Agent 完全完成后一次性返回 |
| 适用场景 | 需要实时展示 Agent 思考过程或工具调用 | 只需最终结果，简化客户端逻辑 |
| SDK API | `client.beta.sessions.events.stream()` | `client.beta.messages.create()` 或 `client.beta.sessions.events.send(..., stream=False)` |
| 错误处理 | `session.error` 事件在流中出现 | 异常在 HTTP 响应中返回 |

### 错误处理：网络中断重连策略与超时

**`session.error` 事件结构：**

```json
{
  "type": "session.error",
  "error": {
    "type": "mcp_connection_failed_error",
    "mcp_server_name": "github",
    "retry_status": "can_retry"
  }
}
```

| Error type | Meaning | retry_status |
| --- | --- | --- |
| `mcp_connection_failed_error` | MCP 服务器网络不可达（超时或 HTTP 失败） | `can_retry` |
| `mcp_authentication_failed_error` | MCP 服务器拒绝了 vault 凭证 | `cannot_retry`（需换凭证） |
| `session.status_rescheduled` | 瞬态错误，平台自动重试 | 自动处理 |

**重连策略建议：**

1. **监听 `session.error` 事件**：捕获错误类型，决定是换凭证还是继续等待
2. **`mcp_connection_failed_error` 自动重试**：连接在 `session.status_idle` → `session.status_running` 转换时自动重试，客户端无需主动重连
3. **SSE 流断开**：使用指数退避重新连接 `events.stream`，从上次已处理的 event 位置继续消费（Session 事件历史可通过 `events.list` 补齐）
4. **超时处理**：建议 SSE 连接设置 5–10 分钟读超时；Agent 长时间无响应可能意味着工具阻塞，检查 `agent.tool_use` / `agent.tool_result` 事件流是否正常

---

## SEC 07 — 预建工具集（Agent Toolset）详解

`agent_toolset_20260401` 是 Claude Managed Agents 提供的一套预构建工具集，启用 bash、文件系统操作、网页搜索等核心能力。

### 工具列表

| 工具名 | 功能 | 主要参数 |
| --- | --- | --- |
| `bash` | 在沙箱中执行 shell 命令 | `command`（必填）、`timeout`（可选，秒）、`cwd`（可选，工作目录） |
| `read` | 读取文件内容 | `file_path`（必填）、`limit`（可选，行数限制） |
| `write` | 写入或覆盖文件 | `file_path`（必填）、`content`（必填） |
| `edit` | 对文件进行定向编辑（find-and-replace） | `file_path`、`old_string`、`new_string` |
| `glob` | 按 glob 模式搜索文件 | `pattern`（必填） |
| `grep` | 在文件中搜索内容 | `pattern`（必填）、`file_path`（必填） |
| `web_search` | 执行网页搜索 | `query`（必填）、`recency_days`（可选） |
| `web_fetch` | 抓取并解析网页内容 | `url`（必填）、`char_limit`（可选） |

### permission_policy：权限策略

每个工具可独立配置权限策略，控制是否需要人工审批：

| Policy 类型 | 行为 |
| --- | --- |
| `always_allow` | 工具调用自动批准，无需人工确认 |
| `always_ask` | 每次工具调用前需发送 `user.tool_confirmation` 审批 |
| `auto` | 服务端智能判断：低风险调用自动放行，高风险调用要求确认，无法判断时降级为 ask |

**配置示例：全局 always_ask，bash 单独 always_allow：**

```json
{
  "type": "agent_toolset_20260401",
  "default_config": {
    "enabled": true,
    "permission_policy": { "type": "always_ask" }
  },
  "configs": [
    {
      "name": "bash",
      "enabled": true,
      "permission_policy": { "type": "always_allow" }
    },
    {
      "name": "web_search",
      "enabled": true,
      "permission_policy": { "type": "always_ask" }
    }
  ]
}
```

### 工具配置字段详解

| 字段 | 位置 | 描述 |
| --- | --- | --- |
| `type` | 顶层 | 固定值 `"agent_toolset_20260401"` |
| `default_config.enabled` | 全局 | 是否默认启用所有工具，默认 `true` |
| `default_config.permission_policy` | 全局 | 默认权限策略 |
| `configs[].name` | 工具级 | 工具标识符（bash / read / write / edit / glob / grep / web_search / web_fetch） |
| `configs[].enabled` | 工具级 | 是否启用该工具 |
| `configs[].permission_policy` | 工具级 | 该工具的权限策略，覆盖默认值 |

### 工具超时限制与重试策略

| 工具 | 默认超时 | 可配置 | 重试 |
| --- | --- | --- | --- |
| `bash` | 60 秒 | 通过 `timeout` 参数指定，最大值由环境配置决定 | 瞬态错误（exit_code != 0 且非致命）可重试 1 次 |
| `read` | 30 秒 | 否 | 失败后不可重试，Agent 会尝试其他方式 |
| `write` | 30 秒 | 否 | 失败后不可重试 |
| `edit` | 30 秒 | 否 | 失败后不可重试 |
| `glob` | 15 秒 | 否 | 失败后不可重试 |
| `grep` | 15 秒 | 否 | 失败后不可重试 |
| `web_search` | 30 秒 | 否 | 网络错误可重试 1 次 |
| `web_fetch` | 30 秒 | 否 | 网络错误可重试 1 次 |

**bash 工具超时配置示例：**

Agent 在 system prompt 中可通过指令控制 bash 默认超时，或在调用时由服务端注入超时参数。自定义超时需在 agent 配置或 session 级别设置环境约束。

### 提示缓存优化

`agent_toolset_20260401` 下的所有工具（尤其是 `read`、`glob`、`grep`）会自动利用 prompt caching 优化成本。当 Agent 读取大文件或重复读取相同文件时，平台会将已缓存的内容以 `cache_control` 标记计入，降低重复 token 费用。建议将 Agent 需要反复访问的文件放在固定路径，减少缓存未命中。

---

## SEC 08 — MCP 服务器集成

### MCP（Model Context Protocol）概念

MCP 是 Anthropic 推出的标准化协议，用于将第三方工具和数据源接入 Agent。与 agent_toolset 的预建工具不同，MCP 允许 Agent 通过标准化的 `mcp_toolset` 接入任意实现了 MCP 协议的服务端点（如 GitHub API、Linear、Notion、Slack 等）。

**MCP 配置分为两个步骤：**

1. **Agent 创建时**：声明 Agent 连接哪些 MCP 服务器（名称 + URL，无认证信息）
2. **Session 创建时**：通过 `vault_ids` 传入预注册的凭证，平台自动为每个 MCP 服务器注入对应凭据

### 在 Agent 级别配置 mcp_servers

```json
{
  "name": "GitHub Assistant",
  "model": "claude-opus-4-8",
  "mcp_servers": [
    {
      "type": "url",
      "name": "github",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  ],
  "tools": [
    { "type": "agent_toolset_20260401" },
    {
      "type": "mcp_toolset",
      "mcp_server_name": "github",
      "default_config": {
        "enabled": true,
        "permission_policy": { "type": "always_ask" }
      }
    }
  ]
}
```

### 在 Session 级别覆盖 MCP 配置

Session 创建时可通过 `agent` 字段的对象形式覆盖 Agent 级别的 `mcp_servers` 和 `tools` 配置：

```json
{
  "agent": {
    "type": "agent",
    "id": "agent_01HqRxxx",
    "mcp_servers": [
      { "type": "url", "name": "github", "url": "https://api.githubcopilot.com/mcp/" },
      { "type": "url", "name": "slack", "url": "https://slack-mcp.example.com/" }
    ]
  },
  "environment_id": "env_01ABCxxx",
  "vault_ids": ["vault_xxx"]
}
```

### MCP 服务器配置字段

| 字段 | 必填 | 描述 |
| --- | --- | --- |
| `type` | 是 | 固定值 `"url"`（远程 MCP 服务器）或通过 MCP tunnels 连接私有服务器 |
| `name` | 是 | 唯一名称（1–255 字符），用于在 `tools` 数组和事件流中引用 |
| `url` | 是 | MCP 服务器 HTTP 端点（最多 2048 字符） |

**约束：**

- 每个 Agent 最多声明 20 个 MCP 服务器
- 每个 `mcp_servers` 条目必须在 `tools` 数组中有对应的 `mcp_toolset` 引用
- 每个 `mcp_toolset` 必须引用一个已声明的 MCP 服务器
- API 会拒绝无引用声明或悬挂工具集

### 完整 curl 示例：创建带 MCP 的 Agent

```bash
AGENT_ID=$(
  curl -sS --fail-with-body https://api.anthropic.com/v1/agents \
    -H "x-api-key: $ANTHROPIC_API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -H "anthropic-beta: managed-agents-2026-04-01" \
    -H "content-type: application/json" \
    -d @- <<'EOF' | jq -r '.id'
{
  "name": "GitHub Assistant",
  "model": "claude-opus-4-8",
  "mcp_servers": [
    {
      "type": "url",
      "name": "github",
      "url": "https://api.githubcopilot.com/mcp/"
    }
  ],
  "tools": [
    { "type": "agent_toolset_20260401" },
    {
      "type": "mcp_toolset",
      "mcp_server_name": "github",
      "default_config": {
        "enabled": true,
        "permission_policy": { "type": "always_ask" }
      }
    }
  ]
}
EOF
)

echo "Created agent: $AGENT_ID"
```

### 精细化 MCP 工具选择

默认 MCP toolset 启用服务器暴露的所有工具。可通过 `configs` 选择性启用或禁用：

**只启用部分工具（其余默认禁用）：**

```json
{
  "type": "mcp_toolset",
  "mcp_server_name": "github",
  "default_config": { "enabled": false },
  "configs": [
    { "name": "get_issue", "enabled": true },
    { "name": "list_issues", "enabled": true },
    { "name": "add_issue_comment", "enabled": true }
  ]
}
```

**禁用部分工具（其余默认启用）：**

```json
{
  "type": "mcp_toolset",
  "mcp_server_name": "github",
  "configs": [
    { "name": "delete_repository", "enabled": false }
  ]
}
```

### MCP 大输出自动分流

当 MCP 工具输出超过 100,000 tokens 时，内容自动写入沙箱文件，Agent 收到截断预览和文件路径，可通过 `read` 工具读取完整内容。

### MCP 连接失败处理

Session 创建不验证 MCP 连通性。若服务器不可达或凭证被拒，Session 仍会启动并发送 `session.error` 事件：

| Error type | 含义 | 处理方式 |
| --- | --- | --- |
| `mcp_connection_failed_error` | 网络错误或超时 | 等待下次 idle→running 自动重试，或检查服务器 URL |
| `mcp_authentication_failed_error` | 凭证被拒 | 需更新 vault 凭证，确保 `mcp_server_url` 与 `mcp_servers[].url` 完全匹配（协议+主机+端口+路径归一化后一致） |

---

## SEC 09 — Skills 技能系统

### Skills 的作用

Skills 是可复用、基于文件系统的资源，为 Agent 提供特定领域的专业知识、工作流和最佳实践。与在 system prompt 中堆叠大量上下文不同，Skills 通过**渐进式披露**（progressive disclosure）机制工作：Agent 只在任务匹配时加载相关技能的内容，避免上下文污染。

### Skills vs System Prompt

| 维度 | System Prompt | Skills |
| --- | --- | --- |
| 作用域 | 全局，每轮都生效 | 按需触发，只在相关时加载 |
| 复用性 | 需复制到多个 Agent | 一次上传，多个 Agent 引用 |
| 版本控制 | 与 Agent 版本耦合 | 独立版本化，可 pin 指定版本 |
| 更新影响 | 修改后立即影响所有 Agent | 可选择何时升级（pin `latest` 或指定版本） |
| 格式 | 纯文本指令 | SKILL.md + 支持文件（scripts、templates） |
| 上下文成本 | 每次都占满上下文 | 仅在触发时增量加载 |
| 适用场景 | Agent 核心人格和通用行为 | 领域专业知识、工作流程规范 |

### 官方预建 Skills

Anthropic 提供一套开箱即用的文档类 Skills，short name 直接在 `skill_id` 中使用：

| skill_id | 功能 |
| --- | --- |
| `pptx` | PowerPoint .pptx 文件创建与编辑 |
| `xlsx` | Excel .xlsx 文件创建与数据分析 |
| `docx` | Word .docx 文件创建与编辑 |
| `pdf` | PDF 文件处理与生成 |

使用方式：

```json
{
  "skills": [
    { "type": "anthropic", "skill_id": "xlsx", "version": "latest" }
  ]
}
```

### 自定义 Skill 构建：SKILL.md 格式

自定义 Skill 是一个目录，包含一个 `SKILL.md` 文件及可选的支持文件。上传到工作区后返回 `skill_*` ID。

**SKILL.md 结构示例：**

```markdown
---
name: code-review
description: 执行代码审查并输出结构化报告
triggers:
  - "审查代码"
  - "code review"
  - "检查 PR"
---

# Code Review Skill

## 执行步骤

1. 使用 `read` 工具读取代码文件
2. 使用 `grep` 工具定位关键模式（TODO、FIXME、安全敏感 API）
3. 重点检查：安全性、性能、可维护性、测试覆盖
4. 输出结构化报告到 `review_report.md`

## 输出格式

```markdown
## 文件：{filename}
### 评分：{1-10}
### 问题：{列表}
### 建议：{列表}
```

## 注意事项

- 不修改原始代码，只报告问题
- 对于不确定的问题，标注为 "建议人工确认"
```

**上传自定义 Skill（curl）：**

```bash
curl -X POST "https://api.anthropic.com/v1/skills" \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -F "files[]=@example_skill.zip"
```

返回：

```json
{
  "id": "skill_01AbCdEfGhIjKlMnOpQrStUv",
  "latest_version_id": "v1",
  "name": "example_skill"
}
```

**Agent 引用自定义 Skill：**

```json
{
  "skills": [
    { "type": "custom", "skill_id": "skill_01AbCdEfGhIjKlMnOpQrStUv", "version": "latest" }
  ]
}
```

### Skills 的两种加载方式

| 方式 | 配置位置 | 说明 |
| --- | --- | --- |
| **Attached Skills** | Agent 创建时的 `skills` 数组 | 上传到工作区或使用官方预建 Skill，每个 session 最多 500 个（去重后） |
| **Repository Skills** | Session 创建时挂载 `github_repository` 资源 | 扫描仓库 `.claude/skills/` 目录，自动发现 SKILL.md；无需上传到 Agent 定义 |

**Repository Skills 发现路径：**

```
your-repo/
└── .claude/
    └── skills/
        ├── code-review/
        │   └── SKILL.md
        └── release-process/
            ├── SKILL.md
            └── scripts/
                └── run_checks.sh
```

仅支持仓库根目录下 `.claude/skills/<name>/SKILL.md` 一层嵌套；更深嵌套或无目录包裹的 SKILL.md 不被发现。

### 触发机制：自动注入 vs 按需调用

- **自动触发**：Agent 评估任务意图后自动加载相关 Skill 的内容到上下文中。Agent 会读取 SKILL.md 并执行其中定义的工作流。
- **手动调用**：在 system prompt 中指令 Agent 在特定条件下调用特定 Skill。

### 最佳实践

1. **粒度控制**：每个 Skill 聚焦单一职责，避免大而全的 Skill；多个小 Skill 按需组合优于一个大 Skill
2. **避免上下文污染**：不要在 Skill 中放入 Agent 每次都用得到的内容；只放任务相关的专业知识
3. **版本 pin 策略**：生产环境建议 pin 固定版本而非 `latest`，防止 Skill 更新意外破坏 Agent 行为
4. **信任边界**：Repository Skills 是 Agent 指令的一部分，挂载不受信任的仓库存在安全风险；只挂载内部、受控的代码库
5. **沙箱启动时间**：挂载的 Skills 越多，沙箱初始化越慢；只挂载每个 Agent 真正需要的 Skill
6. **脚本和资源**：Skill 可包含 scripts 和 templates 文件，Agent 通过 `read` / `bash` 工具访问，扩展了工作流能力

---

## SEC 10 — 多 Agent 编排（Multi-Agent）

### 概念与架构

Multi-Agent 编排让一个 **Coordinator（协调器）** Agent 能够在单一 Session 内协调多个专门 Agent（子 Agent）完成复杂任务。每个子 Agent 运行在独立的 **Session Thread（会话线程）** 中，拥有隔离的上下文和独立配置。

**核心约束：**

- 所有 Agent 共享同一沙箱的文件系统和 vault 凭证
- 但工具、MCP 服务器和上下文互不共享
- 协调器只能委托一层深度（depth > 1 被忽略）
- `multiagent.agents` 最多列 20 个不同 Agent（同一 Agent 可创建多个副本）

### multiagent.agents 字段

`multiagent` 配置声明协调器的子 Agent 名册：

```json
{
  "multiagent": {
    "type": "coordinator",
    "agents": [
      { "type": "agent", "id": "agent_xxx" },
      { "type": "agent", "id": "agent_yyy", "version": 3 },
      { "type": "self" }
    ]
  }
}
```

**agents 条目类型：**

| Type | 描述 |
| --- | --- |
| `{"type": "agent", "id": "xxx"}` | 按 ID 引用已创建的 Agent，版本 pin 到协调器创建时的最新版本 |
| `{"type": "agent", "id": "xxx", "version": N}` | 按 ID + 版本号引用，固定到指定版本 |
| `{"type": "self"}` | 允许协调器生成自身的副本（适用于需要并行执行相似任务的场景） |
| `{"type": "advisor", "model": "claude-opus-5"}` | 咨询入口：在协调器 turn 中引入更强的模型提供建议（无工具，不可 spawn，最多一个 advisor） |

### 协调器模式详解

1. **任务分解**：协调器分析用户请求，将复杂任务拆分为多个子任务
2. **并行/串行委派**：独立子任务并行委派（`session.thread_created`），有依赖关系的串行执行
3. **结果收集**：子 Agent 通过 `agent.thread_message_received` 事件将结果汇报给协调器
4. **综合输出**：协调器整合所有子 Agent 的结果，生成最终回答

**协调器系统提示模板：**

```
You coordinate engineering work.
1. Send code review to reviewer agent.
2. Send test writing to test_writer agent.
3. Wait for both reports.
4. Synthesize findings into a final summary.
```

### Agent 版本固定机制

协调器的配置（含 `multiagent.agents` 名册）在协调器**创建或更新时**被快照。被引用的 Agent 固定为该时刻解析的版本，**不会自动跟随被引用 Agent 的更新**。

```
协调器创建时：
  └─ agent_xxx version 2  ←─ 固定在此版本

后来 agent_xxx 更新到 version 5：
  └─ 协调器仍使用 version 2

若要使用新版本：
  └─ 需更新协调器，让其 agents 数组引用新版本
```

### 适用场景

| 场景 | 说明 |
| --- | --- |
| **复杂代码审查** | 协调器分解审查维度（安全性 / 性能 / 风格），委派给专门的审查 Agent |
| **并行研究** | 多个研究 Agent 同时搜索不同来源，协调器汇总 |
| **数据处理流水线** | 清洗 Agent → 分析 Agent → 可视化 Agent 顺序执行 |
| **专业分工** | 不同领域（财务 / 法律 / 技术）Agent 各司其职，协调器统筹 |
| **质量门禁** | 编写 Agent → 测试 Agent → 审查 Agent，形成 CI/CD 闭环 |

### 完整示例：Coordinator + Coder + Reviewer

**Step 1：创建 Coder Agent**

```json
{
  "name": "coder",
  "model": "claude-sonnet-4-6",
  "system": "You write clean, efficient Python code. After completing a task, send a summary to the coordinator using send_to_parent.",
  "tools": [
    {
      "type": "agent_toolset_20260401",
      "configs": [
        { "name": "read", "enabled": true },
        { "name": "write", "enabled": true },
        { "name": "edit", "enabled": true },
        { "name": "glob", "enabled": true },
        { "name": "bash", "enabled": true }
      ]
    }
  ]
}
```

**Step 2：创建 Reviewer Agent**

```json
{
  "name": "reviewer",
  "model": "claude-haiku-4-5",
  "system": "You review code for bugs, security issues, and style violations. Respond to the coordinator via send_to_parent.",
  "tools": [
    {
      "type": "agent_toolset_20260401",
      "configs": [
        { "name": "read", "enabled": true },
        { "name": "grep", "enabled": true },
        { "name": "glob", "enabled": true }
      ]
    }
  ]
}
```

**Step 3：创建 Coordinator**

```json
{
  "name": "engineering-lead",
  "model": "claude-opus-4-8",
  "system": "You coordinate engineering tasks. Delegate coding to the coder agent and review to the reviewer agent. Wait for both reports, then produce a final summary.",
  "tools": [
    { "type": "agent_toolset_20260401" }
  ],
  "multiagent": {
    "type": "coordinator",
    "agents": [
      { "type": "agent", "id": "CODER_AGENT_ID" },
      { "type": "agent", "id": "REVIEWER_AGENT_ID" }
    ]
  }
}
```

**Step 4：创建 Session 并运行**

```python
session = client.beta.sessions.create(
    agent=coordinator.id,
    environment_id=environment.id,
)

with client.beta.sessions.events.stream(session.id) as stream:
    client.beta.sessions.events.send(
        session.id,
        events=[{
            "type": "user.message",
            "content": [{"type": "text", "text": "Implement a REST API endpoint and review it"}]
        }]
    )

    for event in stream:
        if event.type == "session.thread_created":
            print(f"[spawn] {event.agent_name}")
        elif event.type == "agent.thread_message_received":
            print(f"[report] {event.from_agent_name}: {event.content[:100]}")
        elif event.type == "session.status_idle":
            print("[done] Coordinator finished.")
            break
```

### 多 Agent 线程事件

| 事件 | 说明 |
| --- | --- |
| `session.thread_created` | 子线程被创建，含 `session_thread_id` 和 `agent_name` |
| `session.thread_status_running` | 线程开始执行 |
| `session.thread_status_idle` | 线程完成，等待输入，含 `stop_reason` |
| `session.thread_status_terminated` | 线程被归档或终态错误 |
| `agent.thread_message_received` | 子 Agent 向协调器发回结果（primary thread 上可见） |
| `agent.thread_message_sent` | 协调器向子 Agent 发送任务（primary thread 上可见） |

### Beta 阶段限制说明

1. **beta 头必传**：所有 Managed Agents API 请求需携带 `anthropic-beta: managed-agents-2026-04-01`
2. **MCP 服务器按 Agent 隔离**：每个 Agent 独立声明自己的 MCP 服务器；vault 凭证在 Session 级别共享给所有线程
3. **Advisor 限制**：每个名册最多一个 advisor 条目，advisor 无工具且不可 spawn
4. **子 Agent 深度限制**：协调器只能委派一层，不支持嵌套协调器（depth > 1 被忽略）
5. **并发限制**：最多支持 25 个并发线程（协调器可对同一 Agent 创建多个副本）
6. **技能计数**：整个 Session（所有 Agent）最多 500 个去重后的 Skills
7. **工具总数**：所有 toolsets 合计最多 128 个工具
8. **自托管限制**：Repository Skills 发现仅在云沙箱中支持；自托管沙箱不支持 GitHub repository 资源挂载

### 小结

多 Agent 编排将复杂任务分解为专门的子 Agent，实现了**上下文隔离**（每个 Agent 独立上下文）、**并行加速**（独立任务同时执行）和**专业分工**（不同模型/工具集的 Agent 各司其职）。协调器模式是核心范式，需要在协调器的 system prompt 中清晰定义委派策略和结果汇总逻辑。当前处于 Beta 阶段，API 头、并发数、工具数等均有明确上限，生产部署前需关注官方文档的版本更新。
