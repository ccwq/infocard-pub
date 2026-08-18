# Universal Skills MCP 研究记录

- 路线：new
- 主题：hardblue
- canonical repo：<https://github.com/klaudworks/universal-skills>
- X 来源：<https://x.com/AI_SuperDomain/status/2089296330204004693>
- X 作者/时间：AI超元域（@AI_SuperDomain），2026-08-17 10:20:37 UTC
- engagement snapshot：本次可复核范围内没有可靠互动数，未填充推测数字。

## 核实事实

1. GitHub API 快照：181 stars、12 forks、MIT、主语言 Shell、default branch `main`；Release URL 为 `null`，因此写作“GitHub 未发现正式 Release”。
2. 官方 README：Universal Skills 将 Anthropic Skills 通过 MCP 暴露给支持 MCP 的 AI coding agent；给出 Codex、Claude Code、OpenCode 的配置示例；Cursor/其他 MCP agent 仅表述为理论可用、尚未测试。
3. 自动发现目录：项目 `.agent/skills/`、项目 `.claude/skills/`、`~/.agent/skills/`、`~/.claude/skills/`，支持 `--skill-dir` 与 `npx universal-skills install`。
4. npm Registry 当前存在 `universal-skills` 包，查询到版本 3.1.0；因此不把 X 帖子的“npm install”作为唯一安装结论。
5. README 开头明确建议：多数 Agent 已支持某种 Skills，优先使用原生实现。

## 边界

- 未执行主体工具安装、宿主配置修改或端到端客户端测试。
- X 帖子作为传播语境与来源保留；官方能力以 README、GitHub API、npm Registry 为准。
- GitHub “无 Release”不等于项目不存在 npm 包，也不等于项目不存在可安装版本。
