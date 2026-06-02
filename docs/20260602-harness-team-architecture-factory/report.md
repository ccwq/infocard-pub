# Harness 不是 prompts 清单，而是 Claude Code 的团队架构工厂

## 结论

这条 X 帖和它引用的仓库，核心不是“又一个 Claude Code 插件”，而是把 **agent 团队怎么组织** 这件事直接产品化了。

简化成一句话：
- **输入**：`build a harness for this project`
- **输出**：agent 团队定义、`skills`、6 种 team architecture、验证流程

## 原帖主张

原帖作者（@GoSailGlobal）把 Harness 说成解决了一个经常被忽略的问题：
> “我有 Claude Code，但我不知道怎么把它组织成一个团队。”

原帖还明确给了公开互动数据和时间：
- 发帖时间：2026-06-01 09:55
- 公开互动：8 replies / 68 reposts / 267 likes
- 书签 / 观看：312 bookmarks / 16,118 views

## 仓库是什么

主仓库：`revfactory/harness`

它的定位是：
- Claude Code 的 **team-architecture factory**
- 不是 prompts 列表，也不是单纯的 agent 模板仓库
- 关键产物是：
  - `.claude/agents/`
  - `.claude/skills/`
  - 协作模式与编排流程

README 里明确提到 6 种架构模式：
- Pipeline
- Fan-out / Fan-in
- Expert Pool
- Producer-Reviewer
- Supervisor
- Hierarchical Delegation

## 证据仓库与数据核

原帖还引用了实验仓库：`revfactory/claude-code-harness`

该仓库公开了 A/B 实验结果：
- 15 个软件工程任务
- 平均质量分：49.5 → 79.3
- 胜率：15/15
- 输出方差：-32%
- 难度越高，提升越大（Basic / Advanced / Expert 都继续拉开）

重要边界：
- 这是作者自测（author-measured）
- 样本量是 15
- README 明确保留了 “third-party replications pending”

所以这组数据可以支持“效果显著”的判断，但不适合写成“已被第三方完全证实”。

## 为什么这条帖值得做成卡

因为它不是在推一个单点工具，而是在推一个更上层的东西：

- 不是“怎么写 prompt”
- 而是“怎么把 AI 组织成可验证、可复用、可扩展的工程系统”

这正是很多 Agent 项目从“能跑”走向“能交付”的分界线。

## 适合场景

- Claude Code 用户
- 多角色协作项目
- 需要长期维护的工程项目
- 需要把分工、验证、反馈做成固定流程的项目

## 不适合场景

- 只是单次脚本或小改动
- 只需要一个简单回答，不需要团队编排
- 你想要的是 runtime/config 管理，而不是 team architecture

## 发布时保留的图像证据

本次卡片保留了三层图像证据：
- 原帖附图：X 帖里的二次解读图
- 官方仓库图：`harness_banner.png`、`harness_team.png`
- A/B 图：根据仓库数据重新整理的结果图

## 来源

- X 帖：<https://x.com/GoSailGlobal/status/2061265412051083562?s=20>
- 主仓库：<https://github.com/revfactory/harness>
- 实验仓库：<https://github.com/revfactory/claude-code-harness>
