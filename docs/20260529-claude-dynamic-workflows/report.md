# Claude 新的 Dynamic Workflows 是什么？调查报告

**调查日期**：2026-05-30  
**协作角色**：王记者（公开信息核查） / 希尔（资料抽取） / 尼克（结论把关）

## 结论先行

**截至本次核查，Anthropic 官方公开材料里没有检到一个被正式定义、带独立文档页的产品名叫 `Dynamic Workflows`。**

更准确的判断是：

> **“Dynamic Workflows”更像是社区/传播层面对 Claude 新一轮 agent 能力升级的概括性叫法，而不是 Anthropic 已明确挂牌的单独产品名。**

它实际指向的是一组让 Claude 能动态拆解任务、并行执行、长时运行、必要时回滚的能力组合，核心包括：

1. **Subagents**：把任务拆给多个专门代理并行处理。  
2. **Hooks**：在关键节点自动触发测试、lint、检查等动作。  
3. **Background tasks**：长任务不中断主流程。  
4. **Checkpoints**：修改前自动保存状态，方便回滚。  
5. **Parallel tool use**：同一轮里并发调用多个工具。  
6. **Tool Search / Programmatic Tool Calling / Tool Runner**：把大规模工具编排下沉到代码执行或 SDK 层。  
7. **Managed Agents / long-running harness**：支持更长时、更自治的 agent 运行。

## 核查过程与证据

本次直接核查：

- `anthropic.com/news`
- `anthropic.com/engineering`
- `platform.claude.com/docs`
- `platform.claude.com/docs/llms.txt`
- `platform.claude.com/docs/llms-full.txt`
- `platform.claude.com/sitemap.xml`

结果：

- 没有找到官方单独标题为 **Dynamic Workflows** 的文档页。
- 在 `llms-full.txt` 全量文档文本中，`Dynamic Workflows` / `dynamic workflows` 也未命中。

但以下能力被官方明确公开：

### 1) Claude Code autonomy 升级
Anthropic 新闻《**Enabling Claude Code to work more autonomously**》明确强调：

- **Subagents**
- **Hooks**
- **Background tasks**
- **Checkpoints**

这说明 Claude Code 正在从“单个助手回应请求”升级为“可以并行分工、自动触发、持续运行、支持回滚的开发工作流系统”。

### 2) Parallel tool use
Claude 文档《**Parallel tool use**》明确写到：

- Claude 默认可以在一轮里调用多个工具；
- 这些调用可以并发执行；
- 若存在依赖关系，Claude 可根据错误反馈再重新调度。

这已经是典型的动态编排特征。

### 3) Advanced Tool Use
Anthropic 工程文《**Introducing advanced tool use on the Claude Developer Platform**》给出三块底座：

- **Tool Search Tool**：按需发现工具；
- **Programmatic Tool Calling**：在代码执行环境里编排工具调用；
- **Tool Use Examples**：用示例而不只靠 schema 教会工具使用方式。

这解决的是动态工作流最难的底层问题：工具太多、上下文太贵、编排太脆。

### 4) Managed Agents / Long-running harness
Anthropic 工程文《**Scaling Managed Agents: Decoupling the brain from the hands**》与《**Harness design for long-running application development**》说明，Anthropic 正在推进：

- 长会话运行
- sandbox checkpoint
- harness 重启恢复
- session log 外置持久化
- planner / generator / evaluator 多代理结构

这说明 Anthropic 在工程上已经把 agent 工作流理解为：

> **多阶段、多角色、可持续运行、具备恢复能力的执行系统。**

## 它和传统 workflow 有什么区别

Anthropic 在《Building Effective AI Agents》中区分过：

- **Workflow**：预定义代码路径驱动；
- **Agent**：模型动态决定过程与工具使用。

因此所谓 Claude 的 Dynamic Workflows，可以理解为：

### 传统 workflow
- 流程图先写死；
- 节点固定；
- 顺序固定；
- 异常路径固定；
- 重点是可预测。

### Claude 式 dynamic workflow
- 大目标给定，子步骤动态生成；
- 工具按需发现；
- 多代理并行协作；
- 遇错后基于反馈改道；
- 带检查点和恢复机制；
- 允许长时持续运行。

## 最终定义

如果要给“Claude Dynamic Workflows”下一个稳妥定义：

> **Claude Dynamic Workflows = 以 Claude Code / Claude Platform 为核心，围绕子代理、钩子、后台任务、检查点、并行工具调用、动态工具发现和长时 agent 托管所形成的“可动态编排、可持续运行、可恢复”的 agent 工作流能力集合。**

## 核心来源

1. Anthropic News — **Enabling Claude Code to work more autonomously**  
2. Anthropic Engineering — **Scaling Managed Agents: Decoupling the brain from the hands**  
3. Anthropic Engineering — **Harness design for long-running application development**  
4. Anthropic Engineering — **Introducing advanced tool use on the Claude Developer Platform**  
5. Anthropic News — **Introducing Claude 4**  
6. Anthropic News — **New capabilities for building agents on the Anthropic API**  
7. Claude Docs — **Parallel tool use**  
8. Claude Docs — `llms.txt` / `llms-full.txt` / sitemap

## 一句话总结

**所谓 Claude 的 Dynamic Workflows，本质不是一个单功能，而是 Claude 正在获得“动态拆任务、并行干活、自动触发、长时运行、随时回滚”的 agent 工作流能力。**
