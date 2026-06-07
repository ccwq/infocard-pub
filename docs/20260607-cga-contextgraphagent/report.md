# CGA 发布报告

## 结论

`nascousa/cga` 不是单纯的代码搜索工具，而是一个 **local-first graph context service**。它把仓库文件、符号、调用、导入和轻量数据流索引进 FalkorDB，再通过 MCP 工具、Admin Dashboard 与 3D Graph Viewer，把“先拿证据，再写代码”变成 AI 编码代理的标准动作。

## 关键信息

- **定位**：AI-assisted development 的局部证据层，而不是通用搜索引擎。
- **核心机制**：repository files / symbols / calls / imports / data flow → FalkorDB graph → MCP tools / viewer / dashboard。
- **亮点能力**：Admin Dashboard、3D Graph Viewer、MCP API、CGA-Relay、工作简报、调度自动化、运行时备份。
- **使用前提**：Docker / FalkorDB / 本地运维能力，偏本地优先工作流。
- **证据强度**：README 提供 live multi-project benchmark，102 个真实代码案例，token 平均下降 90.44%，HPS 平均下降 13.34%。

## 发布内容

- 信息卡 HTML：`docs/20260607-cga-contextgraphagent.html`
- 元数据：`docs/20260607-cga-contextgraphagent.html.meta.yaml`
- 报告：`docs/20260607-cga-contextgraphagent/report.md`
- 首屏图：`docs/assets/images/20260607-cga-hero.png`

## 适用边界

- 适合代理式编码、仓库问答、代码审查、符号定位和关系追踪。
- 不适合当成无脑通用搜索框，或把整仓库强塞进 prompt。
- Benchmark 的结果有 nuance，不是所有项目都无条件变好。

## 来源

- 仓库：<https://github.com/nascousa/cga>
- README：<https://raw.githubusercontent.com/nascousa/cga/main/README.md>
- 文档：`docs/mcp-agent-query-quickstart.md`、`docs/runtime-operations.md`、`docs/benchmarks/live-context-quality.md`
