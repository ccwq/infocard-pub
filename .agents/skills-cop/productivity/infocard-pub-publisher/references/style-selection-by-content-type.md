# Style Selection by Content Type (2026-07-08 固化)

## 决策规则

根据内容类型选定主题风格，不需要等调研结果：

| 内容类型 | 推荐风格 | 原因 |
|----------|----------|------|
| WebGPU / 端侧 AI / Agent Memory | `darkblue` | 深蓝工作台，AI 工具感 |
| 大模型教程 / 学术课程 | `graph-paper` | 纸感图谱，学术气质 |
| SOP / 工作流方法论 | `redswiss` | 瑞士风，方法论清晰 |
| 开源工具 / CLI / 多工具对比 | `redswiss` | 红黑瑞士风，开源图鉴气质 |
| AI Agent 工程 / 行为协议 / 协议层 | `hardblue` | 技术手册，蓝图感 |
| 安全审计 / 监控 / 系统状态 | `darkgreen` | 深绿终端监控工作台 |
| 开发者工具 / 终端工具 | `redswiss` | 同开源工具 |
| Agent Skills 集合 | `redswiss` | 多 Skills 汇总，开源生态 |
| 技术调研报告 | `hardblue` | 技术深度，手册感 |
| 知识图谱 / 依赖关系 | `graph-paper` | 米白纸底，细线图谱 |
| 开发者工作台 / IDE | `darkblue` | 深蓝工作台 |
| 复古手作 / 像素风 | `pixelstack` | 像素堆叠 |
| 纸感书页 / 手账风 | `paper-warm` | 暖米纸背景 |

## 本次实证

| 项目 | 类型 | 选定风格 | 结果 |
|------|------|----------|------|
| Nigate (NTFS for Mac) | macOS 工具 + GUI | `darkgreen` | ✅ 11/10 |
| OPC Skills (10 Skills) | Agent Skills 集合 | `redswiss` | ✅ 11/12 |
| superfile (终端文件管理器) | 开源工具 + CLI | `redswiss` | ✅ 11/11 |
| Fable Harness (行为协议) | AI Agent 工程 | `hardblue` | ✅ 13/13 |
| AutoCVE (安全审计) | 安全 + Multi-Agent | `darkgreen` | ✅ 14/14 |

## 快速决策法

```
开源工具 / CLI / 多工具对比       → redswiss
Agent 行为 / 协议 / 工程规范      → hardblue
安全 / 监控 / 系统状态总览        → darkgreen
终端重度工具 + GUI（macOS/Linux） → darkgreen
开发者工作台 / IDE / 并行任务     → darkblue
知识图谱 / 结构拆解 / 依赖关系    → graph-paper
复古 / 像素 / 手作感              → pixelstack
```

## 常见误选及纠正

- **macOS 工具** → 不要因为"macOS"就用 blue/darkblue，要看工具本身是终端工具还是 GUI 应用。终端工具 → `darkgreen`；文档/教程 → `hardblue`。
- **Agent 技能库** → 不是 `darkblue`，是 `redswiss`（多 Skills 汇总 = 开源生态集合）。
- **安全工具** → 安全/审计 → `darkgreen`（监控工作台感），不是 `redswiss`。
