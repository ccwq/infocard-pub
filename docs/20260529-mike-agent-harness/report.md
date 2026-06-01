# Agent harness workers 长帖报告

## 核心判断
这是一篇**把 agent harness worker 化**的架构论证长帖。

## 关键事实
- 生产级 harness 约有 15 项职责。
- 长帖主张把这些职责拆成独立 workers，而不是放在一个 monolith 框架里。
- 关键组件包括 turn-orchestrator、approval-gate、llm-budget、auth-credentials、provider、session、context-compaction 等。
- 统一的 WebSocket / trigger 协议让每层都可以替换。

## 结论
它的核心价值是把“选择一个框架”改写成“按需组装自己的 harness”。