## SEC 11 — SDK 安装与快速开始

### Python SDK（ant package）

```bash
pip install ant
```

基础初始化：

```python
from anthropic import Anthropic
import os

client = Anthropic()
# 自动读取 ANTHROPIC_API_KEY 环境变量
```

### Node.js SDK（@anthropic-ai/ant）

```bash
npm install @anthropic-ai/ant
```

```javascript
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();
```

### ant CLI

```bash
npm install -g @anthropic-ai/ant
ant --version
```

### 完整快速开始（Python，约 30 行）

```python
from anthropic import Anthropic
import os, json

client = Anthropic()
API_KEY = os.environ.get("ANTHROPIC_API_KEY")
assert API_KEY, "Set ANTHROPIC_API_KEY env var"

# 1. 创建 Agent
agent = client.beta.agents.create(
    name="Quickstart Assistant",
    model="claude-opus-5",
    system="You are a helpful coding assistant.",
    tools=[{"type": "agent_toolset_20260401"}],
)
print(f"Agent: {agent.id}")

# 2. 创建 Environment
env = client.beta.environments.create(
    name="quickstart-env",
    config={"type": "cloud", "networking": {"type": "unrestricted"}},
)
print(f"Environment: {env.id}")

# 3. 启动 Session
session = client.beta.sessions.create(
    agent=agent.id,
    environment_id=env.id,
)
print(f"Session: {session.id}")

# 4. SSE 流式事件循环
with client.beta.sessions.events.stream(session.id) as stream:
    # 打开流后立即发送用户消息
    client.beta.sessions.events.send(
        session.id,
        events=[{"type": "user.message", "content": [{"type": "text", "text": "Write hello.py"}]}],
    )
    for event in stream:
        if event.type == "agent.message":
            for block in event.content:
                if hasattr(block, "text"):
                    print(block.text, end="")
        elif event.type == "session.status_idle":
            print("\n\nAgent finished.")
            break
```

### 常见初始化错误

| 错误 | 原因 | 解决 |
|------|------|------|
| `401 Unauthorized` | API Key 错误或未设置 | 检查 `ANTHROPIC_API_KEY` 环境变量 |
| `Missing beta header` | 请求缺少 `managed-agents-2026-04-01` | SDK 自动设置，手动 curl 需手动添加 |
| `network timeout` | 网络问题或沙箱启动慢 | 增加超时或检查网络 |
| `agent not found` | Agent ID 不存在或已归档 | 重新创建或检查 ID |

---

## SEC 12 — 定价与用量限制

### 定价模型：双维度计费

Claude Managed Agents 按两个维度计费：**Token 消耗** + **Session 运行时长**。

#### Token 消耗

所有 Token 按标准模型定价收费，prompt caching 倍数相同适用：

| 模型 | 输入 $/1M tokens | 输出 $/1M tokens |
|------|-----------------|-----------------|
| claude-opus-5 | $15.00 | $75.00 |
| claude-opus-4-8 | $12.00 | $60.00 |
| claude-opus-4-7 | $9.00 | $45.00 |
| claude-sonnet-5 | $3.00 | $15.00 |

- **Web search**：Session 内触发 `$10/1,000 次搜索`
- **US 数据驻留**：Inference Geo 设为 `us` 时，Token 费用 1.1×（与 Messages API 一致）
- **Fast mode**：当 `model.speed = "fast"` 时，按快速模式附加费计费
- **Batch API 折扣**：不适用（Session 是有状态的交互式资源）

#### Session 运行时长

| SKU | 单价 | 计费方式 |
|-----|------|----------|
| Session runtime | **$0.08 / Session 小时** | `running` 状态时长，精确到毫秒 |

**计费关键**：只有 `running` 状态计费，`idle` / `rescheduling` / `terminated` 不收费。

```
示例：一个 Session 运行 30 分钟（其中 active 20 分钟，idle 10 分钟）
费用 = 20/60 × $0.08 = $0.0267
```

Session 运行时长替代了原有的代码执行容器小时计费模式。使用 Managed Agents 时不再单独收取容器小时费用。

### Rate Limits

| 操作 | 限制 |
|------|------|
| 创建端点（agents/sessions/environments） | **300 请求/分钟** |
| 读取端点（retrieve/list/stream） | **1,200 请求/分钟** |
| Organization 级消费限制 | 按用量层级（Start/Build/Scale） |

超出 Scale tier 或需定制限速，联系 Anthropic 销售团队。

### 成本优化策略

1. **prompt caching**：`read` / `glob` / `grep` 工具读取过的文件自动缓存，减少重复 token 费用
2. **effort 级别选择**：简单任务用 `low`，复杂任务用 `high`，避免不必要的高 effort 消耗
3. **compaction 机制**：对话历史超长时平台自动压缩，保留关键上下文
4. **Session 及时清理**：完成任务的 Session 及时 `DELETE`，避免意外产生费用
5. **Web search 节流**：批量任务中合并 search 查询，减少 `$10/1,000 次` 费用

---

## SEC 13 — 数据保留与合规

### 有状态 Session 的数据保留

Claude Managed Agents 是**有状态设计**的资源：

- 对话历史、沙箱状态、输出文件**持久化保存在服务器端**
- Session 可暂停后干净恢复
- **零数据保留（ZDR）不适用**：有状态 Session 需在服务端保存数据
- **HIPAA BAA 不适用**：Beta 阶段不符合条件

### 数据控制权

你保有对数据的完整控制：

- **删除 Session**：`DELETE /v1/sessions/{id}` 立即清除对话历史和沙箱状态
- **删除上传文件**：单独调用文件删除接口
- **Activity Feed**：保留 6 年（与账户数据保留策略一致）
- **Trust & Safety 标记**：即使有 ZDR/HIPAA，被 Anthropic 自动化系统标记的数据最多保留 **2 年**

### 合规适用性

| 合规类型 | Managed Agents 适用 | 说明 |
|----------|-------------------|------|
| 零数据保留（ZDR） | ❌ | 有状态设计，需服务端持久化 |
| HIPAA BAA | ❌ | Beta 阶段不支持 |
| SOC 2 / ISO 27001 | 部分 | Anthropic 主平台有认证，Managed Agents 需确认 |
| 数据驻留（US/EU） | ⚠️ | 需 Claude Platform on AWS 或自架沙盒 |
| Covered Models（Fable/Mythos） | ⚠️ | 强制 30 天数据保留，ZDR 不适用 |

### 企业级合规方案

1. **数据驻留**：使用 Claude Platform on AWS 或自架沙盒，数据留在你的云环境
2. **自架沙盒**：`type: self_hosted`，沙盒运行在你控制的 K8s 集群，满足 GDPR/数据本地化
3. **API 与数据保留**：详细对照表见 [API and data retention](https://platform.claude.com/docs/en/manage-claude/api-and-data-retention)

---

## SEC 14 — 与主流框架的集成

### CopilotKit + Managed Agents

CopilotKit 提供了 Managed Agents 的 AG-UI 协议转接器，将每个聊天对话映射到一个 Managed Session：

```python
# CopilotKit 后端：每个用户消息 → 新增 user.message 事件
await copilotSession.addMessage(
    text=message,
    sender=MessageSender.User,
    agentId=MANAGED_AGENT_ID,
    environmentId=ENV_ID
)
# 事件流自动推送到前端聊天 UI
```

适用场景：个人理財助理、代码审查助手、数据分析仪表盘。

### LangChain / LlamaIndex 包装

```python
# LangChain 自定义 Tool 包装 Managed Agents Session
from langchain.tools import StructuredTool
from pydantic import BaseModel

class ManagedAgentsInput(BaseModel):
    prompt: str

def run_managed_agent(prompt: str) -> str:
    # 调用 Managed Agents Session，返回最终结果
    ...

agent_tool = StructuredTool.from_function(
    func=run_managed_agent,
    name="claude_managed_agent",
    description="Run Claude Managed Agent for complex multi-step tasks",
    args_schema=ManagedAgentsInput,
)
```

### 实时 UI 架构

```
User Message
    │
    ▼
Frontend (React/Vue) ──► Managed Session.events.send()
    ▲                       │
    │                       ▼
    │                  Agent 执行 Tools
    │                       │
    └──────────────────── SSE events ◄──
         (agent.message / agent.tool_use / agent.tool_result)
```

### 集成注意事项

- **Beta API 稳定性**：beta 期间可能发生 breaking changes，版本 pin 重要组件
- **错误处理**：实现 `session.error` 事件监听和指数退避重连
- **Session 管理**：WebSocket 断开后用 `events.list` 补齐历史，避免重复发送

---

## SEC 15 — 排错清单（Troubleshooting）

### 常见错误码与解决方案

| HTTP 状态码 | 错误类型 | 原因 | 解决方式 |
|------------|---------|------|----------|
| 400 | `invalid_request_error` | 请求格式错误或必填字段缺失 | 检查 JSON 结构，对照 API 文档 |
| 400 | Covered Model 错误 | 使用 Fable/Mythos 模型但无 30 天保留配置 | 组织级别启用 30 天保留或换模型 |
| 401 | `authentication_error` | API Key 错误或过期 | 检查 `ANTHROPIC_API_KEY`，确认账户有效 |
| 403 | `permission_denied_error` | 缺少 `managed-agents-2026-04-01` beta 头 | 所有请求添加 `anthropic-beta: managed-agents-2026-04-01` |
| 404 | `not_found_error` | Agent/Environment/Session ID 不存在或已归档 | 重新创建或用 `list` 获取有效 ID |
| 409 | `conflict_error` | Agent `version` 不匹配（乐观并发冲突） | 重新 `GET /v1/agents/{id}` 获取最新 version 重试 |
| 429 | `rate_limit_error` | QPS 超限（创建端点 300rpm，读取端点 1200rpm） | 指数退避重试，或降低请求频率 |
| 500 | `internal_server_error` | Anthropic 平台侧问题 | 等待后重试，查看 [Anthropic Status](https://status.anthropic.com) |

### session.error 事件类型

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

| Error type | retry_status | 处理方式 |
|-----------|-------------|---------|
| `mcp_connection_failed_error` | `can_retry` | 等待 idle→running 自动重连，或检查 MCP 服务器 URL |
| `mcp_authentication_failed_error` | `cannot_retry` | 更新 vault 凭证，确保 `mcp_server_url` 与声明 URL 完全匹配 |
| `session.status_rescheduled` | 自动重试 | 无需干预，平台处理瞬态错误 |

### Session 挂起 / 无响应

1. 检查 `agent.tool_use` / `agent.tool_result` 事件流是否正常
2. 可能是工具超时（如 `bash` 命令阻塞），检查 `agent.tool_use` 中的 `timeout` 参数
3. 使用 `DELETE /v1/sessions/{id}` 终止后重建

### 流式（SSE）中断处理

```python
import time, asyncio

max_retries = 5
for attempt in range(max_retries):
    try:
        with client.beta.sessions.events.stream(session_id) as stream:
            for event in stream:
                handle_event(event)
    except Exception as e:
        wait = 2 ** attempt  # 指数退避
        print(f"Stream interrupted: {e}. Retry in {wait}s...")
        time.sleep(wait)
        # 从 events.list 补齐历史，避免重复发送
        history = client.beta.sessions.events.list(session_id)
        resume_from = len(history.data)
```

### 调试技巧

- **开启 SDK 详细日志**：设置 `ANTHROPIC_DEBUG=1` 查看 HTTP 请求/响应
- **查询事件历史**：`GET /v1/sessions/{id}/events` 查看完整事件流
- **检查 Session 状态**：`GET /v1/sessions/{id}` 查看当前 status 和 usage

---

## SEC 16 — 典型使用场景深度拆解

### 场景 A：自动化代码审查

**场景**：PR 提交后，Claude 自动审查多文件改动，给出修复建议。

```
触发：GitHub Webhook → 创建 Session
    │
    ▼
上传 PR diff 文件（write tool）
    │
    ▼
发送审查指令（"Review this PR for security issues"）
    │
    ▼
Claude 分析 → 输出 review 报告（agent.message）
    │
    ▼
写入 review 结果到文件 → 发送 GitHub Comment（通过 MCP/GitHub API）
    │
    ▼
Session 进入 idle → 触发 Webhook 通知
```

**关键优势**：文件上下文持久化，无需每次请求都传递完整 diff。

### 场景 B：研究助手

**场景**：Claude 跨多个数据源搜集信息并生成报告。

```
用户："帮我分析竞争对手 X 的产品策略"
    │
    ▼
Claude 调用 web_search → 搜集公开报道
    │
    ▼
Claude 调用 web_fetch → 抓取官网/财报页面
    │
    ▼
Claude 写入分析笔记到文件（write tool）
    │
    ▼
多轮迭代 → 汇总成 Markdown 报告
    │
    ▼
Session idle → 用户获取完整报告
```

**关键优势**：长时运行 + 有状态，可跨小时持续工作，Claude 自主判断下一步行动。

### 场景 C：数据处理流水线

**场景**：定期从 API 拉取数据，清洗后写入数据库。

```
触发：Cron Schedule（每日 09:00 UTC）
    │
    ▼
创建 Session（带预装 pip 包环境）
    │
    ▼
Claude 调用 bash → `curl` 拉取数据 API
    │
    ▼
Claude 调用 write → 写入原始 JSON
    │
    ▼
Claude 调用 bash → `python clean.py` 清洗数据
    │
    ▼
Claude 调用 bash → 写入 PostgreSQL
    │
    ▼
Session idle → 发送 Slack 通知（MCP）
```

**关键优势**：排程执行 + 沙箱隔离 + 有状态文件系统，无需自建 cron job 容器。

### 场景 D：CI/CD 集成

**场景**：PR 触发后自动运行测试套件。

```
触发：GitHub Actions workflow_dispatch
    │
    ▼
API 创建 Session（environment 带测试依赖）
    │
    ▼
Claude 调用 bash → `npm install && npm test`
    │
    ▼
Claude 分析测试失败原因
    │
    ▼
写入失败分析到 PR Comment
    │
    ▼
Session idle → Actions 获取结果
```

**关键优势**：云端沙箱无需自建 Runner，测试环境一致性高。

---

## SEC 17 — 与自建 Agent 循环的架构对比

### 自建方案 vs Managed Agents

| 维度 | Messages API 自建 | Managed Agents |
|------|-------------------|----------------|
| **基础设施** | 自建沙箱容器、K8s Job、网络隔离 | Anthropic 托管（零运维） |
| **Agent 循环** | 完全自写（轮次控制、工具调度、错误处理） | 平台处理，Client 只接收事件 |
| **状态管理** | 需自行实现（Redis/DB/文件） | Server-side 有状态，Session 自动持久化 |
| **扩展性** | 需处理并发、限速、退避 | 平台自动弹性，1,200 rpm 读取端点 |
| **开发时间** | 2–4 周（循环+工具层+沙箱） | 1–2 天（API 调用） |
| **成本模型** | Token 费用 + 容器费用 | Token 费用 + $0.08/Session 小时 |
| **调试复杂度** | 高（本地复现困难） | 中等（事件历史可查询） |
| **适用规模** | 小规模 / 成本敏感 / 需细粒度控制 | 中大规模 / 快速原型 / 需长时任务 |

### 迁移路径

```
Messages API 应用 ──► Managed Agents 混合 ──► 完全迁移
    │                        │                      │
  现有循环               关键路径迁移          自建循环替换
  保持运行              Managed Agents         为 API 调用
                       其他走原路
```

**推荐迁移顺序**：
1. 简单任务（单次工具调用）先用 Managed Agents 替换
2. 有状态任务（需跨轮上下文）迁移为核心场景
3. 保留自建：需要 Zero Data Retention 或 HIPAA 合规的任务

---

## SEC 18 — AWS Claude Platform 差异

### 功能可用性差异

Managed Agents 在 AWS Claude Platform 上是功能子集：

| 维度 | 标准 Managed Agents | AWS Claude Platform |
|------|--------------------|--------------------|
| Agent / Session / Environment API | ✅ 完整 | ⚠️ 功能子集 |
| MCP 服务器 | ✅ 支持 | ⚠️ 部分支持 |
| 多 Agent 编排 | ✅ Beta | ⚠️ 可能有差异 |
| 自架沙盒 | ✅ 支持 | ⚠️ 取决于 AWS 配置 |
| SDK | ✅ ant (Python/Node.js) | ⚠️ AWS 专用 SDK |

### AWS 专属优势

- **VPC 集成**：沙箱可接入你的 VPC，满足网络隔离需求
- **IAM 权限**：使用 AWS 凭证体系管理 API 访问
- **AWS 生态集成**：S3、DynamoDB、Lambda 等原生集成
- **数据驻留**：数据完全在你的 AWS 账户中

### 迁移注意事项

- **端点**：AWS 使用不同的 API 端点（非 `api.anthropic.com`）
- **认证**：使用 AWS Signature V4 而非 API Key
- **可用功能**：确认你的 AWS 区域支持的功能列表

详细指南：[Claude Platform on AWS](https://platform.claude.com/docs/en/claude-platform/claude-platform-on-aws)

---

## SEC 19 — 官方资源与社区

### 官方文档

| 资源 | URL |
|------|-----|
| 中文文档（主） | platform.claude.com/docs/zh-CN/managed-agents |
| 英文文档（最新） | platform.claude.com/docs/en/managed-agents |
| 定价参考 | platform.claude.com/docs/en/about-claude/pricing |
| API 与数据保留 | platform.claude.com/docs/en/manage-claude/api-and-data-retention |
| Rate Limits | platform.claude.com/docs/en/managed-agents/reference |

### SDK 仓库

| 语言 | 安装命令 | 仓库 |
|------|----------|------|
| Python | `pip install ant` | `anthropics/ant` |
| Node.js | `npm install @anthropic-ai/ant` | `anthropics/ant` |
| CLI | `npm install -g @anthropic-ai/ant` | `anthropics/ant` |

### 社区与支持

| 渠道 | 说明 |
|------|------|
| Discord | Anthropic Developers 社区（#managed-agents 频道） |
| Anthropic News | 官方博客，Managed Agents 更新公告 |
| GitHub Issues | SDK bug report 和功能请求 |
| Status Page | platform.anthropic.statuspage.io |
| 销售团队 | 定制定价 / 企业需求 / 定制 Rate Limits |

### Beta 阶段注意事项

Managed Agents 目前处于 **Beta** 阶段：

- 所有端点需要 `managed-agents-2026-04-01` beta 头
- 各版本之间可能发生 breaking changes
- Beta 期间功能可能调整，不建议在生产环境关键路径依赖
- **建议**：对 beta API 组件做版本 pin，实现优雅降级

---

## SEC 20 — 新手 5 步上手路径

### Step 1：获取 API Key，配置环境

**检查点** ✅：
```bash
export ANTHROPIC_API_KEY="sk-ant-..."
curl -s https://api.anthropic.com/v1/models \\
  -H "x-api-key: $ANTHROPIC_API_KEY" | jq '.data[0].id'
# 应返回模型 ID 列表
```

### Step 2：安装 SDK，运行 Quickstart（<10 行代码）

**检查点** ✅：
```bash
pip install ant
python -c "from anthropic import Anthropic; print('OK')"
```

运行官方 Quickstart，确认能收到 `agent.message` 事件。

### Step 3：创建自定义 Agent，理解 model/system/tools 字段

**检查点** ✅：
```bash
# 创建 Agent，验证返回 agent_xxx ID
curl ... -d '{"name":"MyAgent","model":"claude-sonnet-5","tools":[{"type":"agent_toolset_20260401"}]}'
```

尝试修改 `system` prompt，观察 Agent 行为变化。

### Step 4：处理 SSE 事件，实现基本流式 UI

**检查点** ✅：
```python
# 实现完整 SSE 事件循环
# 收到 agent.message → 打印 text
# 收到 agent.tool_use → 打印工具名
# 收到 session.status_idle → 退出
```

在 Web 前端用 SSE Client 接收事件，渲染实时聊天界面。

### Step 5：扩展到生产场景：错误处理、排程、多 Agent

**检查点** ✅：

| 能力 | 验证方式 |
|------|----------|
| 错误处理 | 模拟 429 错误，确认指数退避重试 |
| 资源清理 | Session 完成后 `DELETE`，确认无残留 |
| 排程 | 配置 cron job，每日触发 Session 创建 |
| 多 Agent | 创建 Coordinator + 子 Agent，验证委派流程 |

### 推荐学习顺序

```
Quickstart（<1h）
  → Agent 创建与配置（1-2h）
  → SSE 事件处理（2-3h）
  → MCP 集成（2-3h）
  → Skills 系统（2h）
  → 多 Agent 编排（3-4h）
  → 生产部署与监控（4h+）
```

**总时间**：有经验的开发者约 **1–2 天**可以完成端到端上手。
