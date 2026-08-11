# Codex 的两种 Window：事实说明

## 核心结论

- **Context Window**：单次模型调用可处理的上下文容量；它承载指令、历史、文件、工具结果等当前工作信息。
- **Usage Window**：账户限额的时间周期。OpenAI 当前 Pricing 页面说明，本地消息与 cloud chats 共享 **five-hour window**，并可能有额外 weekly limit。
- 二者不相等：`5h window: 67% used` 表示本周期额度已用约 67%，不表示当前 Context 使用率为 67%。
- 但二者可间接相关：更大的 active context、复杂工具使用、检索、推理与输出，可能提高每条消息的 allowance 消耗。

## 证据边界

| 主张 | 证据层级 | 来源 |
|---|---|---|
| 本地消息与 cloud chats 共享五小时 usage window；可能有 weekly limit | 官方事实 | OpenAI Codex Pricing |
| 任务大小、context、reasoning、tool use、retrieval 与 caching 都影响 usage | 官方事实 | OpenAI Codex Pricing |
| Input、cached input、output 分别计量；cached input 费率较低 | 官方事实 | OpenAI Codex Pricing |
| Codex 配置存在 compaction prompt 相关配置 | 官方事实 | OpenAI Codex Configuration Reference |
| Hooks 覆盖 PreCompact、PostCompact 等生命周期事件 | 官方事实 | OpenAI Codex Hooks |
| “工作桌 / 工时包”及两者关系图 | 编辑解释 | 本卡为面向中文读者的费曼式结构化归纳 |

## 官方来源

1. https://developers.openai.com/codex/pricing
2. https://developers.openai.com/codex/config-reference
3. https://developers.openai.com/codex/hooks
4. https://developers.openai.com/codex/developer-commands

> 版本提醒：具体 Context 容量、计划额度、模型可用性及 `/status` 的展示字段会随模型、套餐和客户端版本变化；请以当前官方页面和本机界面为准。
