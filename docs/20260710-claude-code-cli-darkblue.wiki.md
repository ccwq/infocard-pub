# Claude Code

> **Claude Code** 是 Anthropic 官方推出的终端 AI 编程 CLI，基于原生 Claude 模型，无工具调用次数限制，支持 200K+ 上下文窗口、MCP、Subagent、Plugin、Auto-Mode，与 GitHub Actions/CI 深度集成。

## 基础信息

| 字段 | 值 |
|------|-----|
| 开发者 | Anthropic |
| 类型 | CLI 工具 / AI 编程助手 |
| 官网 | code.claude.com |
| GitHub | github.com/anthropics/claude-code |
| 安装方式 | curl / npm / brew / Windows PowerShell |
| 模型 | 原生 Claude（ Sonnet 4 / Opus 4 / Haiku 3） |
| 上下文 | 200K+ token |
| 工具限制 | **无上限**，模型自主决定调用次数 |
| 许可证 | 官方商业产品 |

## 核心能力

### 与 Cursor / Copilot 的核心差异

| 维度 | Claude Code | Cursor / Copilot |
|------|------------|-----------------|
| 工具调用 | 无限 | 每轮 25 次上限 |
| 上下文 | 200K+，不截断 | 受 IDE 性能限制，实际会截断 |
| CI 集成 | claude -p + setup-token | 不支持 headless CI |
| MCP | 原生支持，/mcp 管理 | 有限或需插件 |
| Subagent | 原生 /agents | 不支持 |
| Plugin | /plugin + 自定义命令 | 有限 |

### 文件与代码操作
- **Edit / Write**：读取、编辑、创建任意文件，支持大文件分块写入
- **Read**：整库理解，支持 `@文件名` 快速引用，支持通配符 glob 搜索
- **Bash 执行**：`!` 命令直接执行 shell，支持测试、构建、Lint、CI

### Git 集成
- 直接创建 commit、PR，理解分支状态和 diff 内容
- `/review`：自动检测代码漏洞与优化点
- `/security-review`：安全审查当前分支，检测注入、XSS、密钥泄露

### 扩展体系
- **MCP（Model Context Protocol）**：`/mcp` 管理 MCP 服务器，连接数据库、API、文件系统增强
- **Plugin**：`/plugin` 管理插件，`/skills` 列出所有命令
- **Subagent**：`/agents` 配置子智能体，并行处理多任务
- **Auto-Mode**：`/auto-mode defaults` 查看内置分类器规则，模型自动决策执行路径

## 安装

```bash
# macOS / Linux
curl -fsSL https://claude.ai/install.sh | bash

# Windows PowerShell
irm https://claude.ai/install.ps1 | iex

# npm 全局
npm install -g @anthropic-ai/claude-code

# 验证
claude --version
```

## 常用命令速查

| 命令 | 功能 |
|------|------|
| `claude "任务"` | 启动 REPL 并带初始提示 |
| `claude -p "任务"` | 非交互模式，执行后退出（CI 用） |
| `claude -c` | 继续最近一次会话 |
| `claude -r 会话名` | 按名称恢复指定会话 |
| `claude --model opus` | 切换到指定模型 |
| `claude --effort high` | 提高思考深度 |
| `claude setup-token` | 生成 CI 长期 OAuth 令牌 |
| `/init` | 在项目根目录生成 CLAUDE.md |
| `/plan` | 启用计划模式，输出执行计划 |
| `/rewind N` | 回退 N 步的状态和对话 |
| `/compact` | 压缩上下文，保留摘要 |
| `/context` | 显示 Token 使用量 |
| `/review` | 代码审查 |
| `/security-review` | 安全审查 |
| `/mcp` | 管理 MCP 服务器 |
| `/plugin` | 管理插件 |
| `/agents` | 管理 Subagent |
| `/memory` | 编辑智能体记忆 |
| `/export` | 导出当前会话 |
| `claude update` | 升级版本 |

## CI / GitHub Actions 集成

```yaml
- name: Claude Code Review
  run: claude -p "Review PR for bugs and security issues"
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

关键优势：
- `claude -p` 专为 CI 脚本设计，非交互模式
- `setup-token` 生成长期令牌，无需人工登录
- 200K+ 上下文完整理解 monorepo
- 无限工具调用，复杂多步骤 CI 任务一气呵成

## settings.json 配置参考

```json
{
  "model": "claude-opus-4-5-reasoning",
  "effort": "high",
  "autoMode": true,
  "env": {
    "ANTHROPIC_API_KEY": "sk-ant-..."
  },
  "mcpServers": {
    "filesystem": { "command": "npx", "args": ["-y", "@anthropic/mcp-server-filesystem", "/path"] },
    "github": { "command": "npx", "args": ["-y", "@anthropic/mcp-server-github"] }
  }
}
```

## 常用 MCP 服务器

| MCP 服务器 | 用途 |
|-----------|------|
| `@anthropic/mcp-server-filesystem` | 高级文件操作（diff、批量重命名） |
| `@anthropic/mcp-server-github` | Issues、PR、Actions 操作 |
| `@anthropic/mcp-server-brave-search` | 实时网络搜索 |
| `@anthropic/mcp-server-memory` | 持久化知识库检索 |

## 相关链接

- 官网：https://code.claude.com
- GitHub：https://github.com/anthropics/claude-code
- 安装脚本：https://claude.ai/install.sh
- Claude Code 完整命令速查手册（2026 官方版）：https://blog.csdn.net/Xixi0864/article/details/159978512

## 相关卡片

- [[claude-init]]：Claude Code 中文开发套件
- [[claude-subagents]]：Claude Code Subagent 配置与管理
- [[claude-dynamic-workflows]]：Claude Code 动态工作流
- [[coralline]]：Claude Code 零 token 珊瑚状态线

---

*最后更新：2026-07-10*
*风格：darkblue*
*来源：Anthropic 官方文档 + CSDN 2026 完整指南*
