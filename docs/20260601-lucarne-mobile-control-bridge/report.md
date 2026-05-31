# Lucarne：本地 AI Agent 的微信/Telegram 移动控制桥

- 发布时间：2026-06-01 06:13:51 CST
- 来源：<https://github.com/tuchg/Lucarne>
- 中文主线：README.cn.md
- 结论：Lucarne 不是另起一个新 App，而是把本地 AI agent 的通知、审批、续接上下文和会话控制，搬到微信 / Telegram 里。

## 这项目在解决什么

本地 Agent 的常见问题不是“不会跑”，而是**没人盯**：
- 完成了没人知道
- 卡住了没人接
- 需要审批时只能守着电脑
- 想继续上下文，得回到原会话

Lucarne 的做法很直接：
1. agent 继续在本机跑；
2. 关键事件推到手机；
3. 用户在微信或 Telegram 里批准、回复、恢复会话；
4. 继续让 agent 在原上下文里干活。

## 架构总览

Lucarne 的结构不是“新 agent”，而是把现有本地 agent 的关键动作抽出来，经过一个轻量桥接层，送到微信 / Telegram，形成可移动的控制面。

1. **本机执行**：Claude / Codex / Gemini / Copilot / Pi 继续在本地跑任务，Lucarne 不改它们的工程结构。
2. **事件桥接**：完成、卡住、失败、审批请求等关键事件被汇总成可读通知，而不是一长串日志。
3. **手机操作**：用户在微信 / Telegram 里做 Approve、Deny、Reply、Status、Fork、Interrupt。
4. **原上下文续接**：回复通知即可回到对应 session，继续在原上下文里推进工作。

这就是 Lucarne 的边界：它做的是控制桥，不是重新发明一个通用聊天框，也不是把 agent CLI 全部搬进聊天机器人。

## Agent 能力矩阵

| Agent | 结构化审批 | AskUserQuestion | Resume | Fork | 适合场景 |
|---|---|---|---|---|---|
| Claude | 强 | 强 | 强 | 强 | 最完整的一档，适合高频审批和多轮续接。 |
| Codex | 强 | 强 | 强 | 强 | 代码任务和工程流转较顺，适合需要明确控制点的场景。 |
| Gemini | 强 | 强 | 强 | 中 | 适合多工具协作和跨步推进，控制体验完整。 |
| Copilot | 中 | 弱 | 弱 | 弱 | 轻量接入可用，但更偏基础通知和简单交互。 |
| Pi | 中 | 弱 | 中 | 中 | 基础可用，适合较简单的控制和续接需求。 |

矩阵结论：Lucarne 并不是“适配所有 agent 的同质 UI”；它更像一个把不同 agent 的控制能力压成统一手机操作面的桥。

## 一句话判断

如果你的目标是“**不增加新终端，不改现有 agent 工程，只把关键控制搬到手机上**”，Lucarne 的定位很清楚：它是一个 **0 侵入的本地 AI Agent 移动控制桥**。

## 代码仓库里最值得看的能力

### 能力表格

| 能力 | Lucarne 做什么 | 第一步 | 边界 |
|---|---|---|---|
| 任务通知 | 完成、卡住、失败、需要人工介入时推送通知 | 先 `lucarned init` | 只推关键节点，不是聊天替代品 |
| 审批控制 | 在手机上批准 / 拒绝命令 | 打开入口 chat 的 `/panel` | 入口 chat 需要 Topics / thread mode |
| 续接上下文 | 引用通知即可恢复对应会话 | 直接回复那条通知 | 依赖 `message_id` 或引用文本哈希 |
| 会话操作 | 查看状态、打断、分支会话 | `/status` / `/interrupt` / `/fork` | 一个 topic 对应一个 live session |
| 多渠道接入 | Telegram / WeChat 双通道 | 先选一个入口开始 | 其他渠道仍在 roadmap |

## 使用顺序

1. 先安装 `lucarned`。
2. 跑 `lucarned init`，选好 agent 和入口 chat。
3. 开启 `lucarned autostart install --start`。
4. 在 Telegram / WeChat 里打开面板并接收通知。
5. 需要时直接在手机上审批、回复或恢复会话。

## 不适合怎么用

- 不适合把它当成通用 IM。
- 不适合把它当成替代 agent CLI 的新框架。
- 不适合没有 Topics / thread 能力的入口 chat 直接硬上。

## 结论

Lucarne 的价值不是“多一个入口”，而是把本地 agent 的关键控制点变成可移动、可审批、可续接的事件流。它最适合已经在本地跑 Claude / Codex / Gemini / Copilot / Pi 的用户，把“盯电脑”改成“盯手机”。

