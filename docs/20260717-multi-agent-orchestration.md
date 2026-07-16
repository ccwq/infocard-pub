# 三条多智能体编排路线：AutoGen / CrewAI / LangGraph

## 调查范围

本卡基于事实包 `/home/ccwq/infocard1_factpack_autoagent.md` 写作，仅使用其中列出的官方仓库、官方文档、官方公告与论文等已验证事实。卡面不使用未核实的趋势外推；对事实包明确标注为未核实的内容，保留“未核实”提示。

## 核心结论

三者并非简单的“谁更强”关系，而是三种编排抽象：

- **AutoGen**：对话优先。多个 Agent 通过自然语言协作，支持群聊、分层交互与代码执行。
- **CrewAI**：团队分工优先。用 Agent、Task、Crew、Process 表达角色与流水线，适合快速原型和清晰的业务分工。
- **LangGraph**：状态图优先。用节点、边与共享状态表达循环、检查点和复杂工作流，控制力更强但学习成本也更高。

选型顺序应是：先判断任务的协作形态与状态治理需求，再选择框架。

## 三条架构路线

### AutoGen：Agent 对话网络

事实包记录的核心机制包括：可定制 Agent、自然语言对话、多种对话模式、内置 CodeExecution，以及 v0.4 的异步事件驱动架构。适合复杂多轮对话、代码生成与开放式协作。需要注意 v0.4 与 0.2.x API 有较大变化。

### CrewAI：角色化团队流水线

事实包记录的核心抽象为 Agent、Task、Crew、Process、Tool，并支持 Sequential / Hierarchical 流程、委托、记忆、人类介入与多模型。它更偏角色扮演范式，适合快速表达“研究员 → 写手”等业务分工。

### LangGraph：可控的状态机

事实包记录其图结构编排、循环、checkpointing、共享状态协作与人工介入机制。多个 Agent 可作为图节点，通过状态转移完成复杂工作流。事实包未提供可直接复制的安装片段，因此卡面明确标注具体包名与版本未核实。

## 能力与场景对比

| 维度 | AutoGen | CrewAI | LangGraph |
| --- | --- | --- | --- |
| 核心抽象 | 多 Agent 对话 / 群聊 | 角色、任务、团队、流程 | 图节点、边、共享状态 |
| 人类介入 | 原生支持 | 原生支持 | 原生支持 |
| 代码执行 | 内置 CodeExecution | 需自定义 | 需自定义 |
| 状态与恢复 | v0.4 异步事件驱动；具体性能数值未核实 | 短期 / 长期记忆 | checkpointing / 断点续跑 |
| 适用场景 | 复杂多轮对话、代码生成 | 快速原型、角色分工流水线 | 有状态多 Agent、循环与复杂工作流 |

## 安装片段

### AutoGen

```bash
pip install autogen-agentchat autogen-ext[openai]
```

### CrewAI

```bash
pip install crewai
```

事实包还记录了可选依赖示例：`pip install langchain langchain-openai duckduckgo-search`。

### LangGraph

事实包未提供可直接复制的安装命令，因此不在报告中补写未经核实的包名或版本。

## 限制与未核实项

- AutoGen：旧版与 v0.4 API 差异明显；Microsoft Agent Framework 具体发布时间在事实包中标为未核实。
- CrewAI：相较 AutoGen 更偏角色扮演范式，对复杂定制化对话流的支持被事实包标注为相对弱；精确最新 PyPI 版本号未核实。
- LangGraph：图结构与状态治理要求使用者承担更多流程设计；事实包未提供直接安装片段。
- 事实包中的 CrewAI “预计超过 40k Stars”属于合理推断，本卡未使用。
- AutoGen v0.4 带来的具体性能提升数值未核实，本卡未使用。

## 来源

- AutoGen 官方仓库：https://github.com/microsoft/autogen
- AutoGen 官方文档：https://microsoft.github.io/autogen/
- AutoGen 论文：https://arxiv.org/abs/2308.08155
- AutoGen v0.4 官方公告：https://www.microsoft.com/en-us/research/blog/autogen-v0-4-reimagining-the-foundation-of-agentic-ai-for-scale-extensibility-and-robustness/
- CrewAI 官方仓库：https://github.com/crewAIInc/crewAI
- CrewAI 官方网站：https://www.crewai.com
- LangGraph 官方仓库：https://github.com/langchain-ai/langgraph
- LangChain 官方仓库：https://github.com/langchain-ai/langchain

核查日期：2026-07-17。
