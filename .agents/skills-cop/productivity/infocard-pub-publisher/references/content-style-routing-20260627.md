# Content → Style 路由规则（2026-06-27 验证）

## 核心原则

当用户没有指定风格时，根据内容类型自动路由。

## 路由表

| 内容类型 | 首选主题 | 关键信号 |
|---|---|---|
| 自动化流水线 / 监控台 / Agent 控制台 | `darkblue` | 终端感、多步骤流程、状态监控、并行任务 |
| 架构图 / 代码→图生成 | `graph-paper` | C4 Model、UML、架构图、节点连线、依赖关系 |
| 像素→矢量 / 手作感 / 复古插画 | `pixelstack` | 像素风、AI生成矢量、warm paper、粗黑描边 |
| 纯技术手册 / 文档转换 / PPT | `blue`（blue-technical-manual） | API手册、工具文档、文档→PPT工作流 |
| 开源工具目录 / CLI生态 | `redswiss` | 工具合集、命令行生态对比 |
| 轻量教程 / 简单解释器 | `q-style` | 单概念、快速上手 |
| 方法论 / 知识图谱 | `q-style` 或 `graph-paper` | 层级结构、思考框架 |

## 2026-06-27 验证案例

| 项目 | Stars | 内容类型 | 路由结果 | 验证 |
|---|---|---|---|---|
| LikeC4 | 3.7k | 代码→架构图、C4 Model、节点连线 | `graph-paper` | ✅ graph-paper 的纸感网格+节点连线语言最契合 |
| MediaCrawler | 53.6k | 多平台自动化、监控台、Playwright 爬虫 | `darkblue` | ✅ 深蓝工作台+终端监控台气质 |
| MoneyPrinterTurbo | 93k | 短视频自动化流水线 | `darkblue` | ✅ 自动化工作流 |
| Loop Engineering | 2.8k | Agent 编排控制台、并行任务 | `darkblue` | ✅ Agent 工作台 |
| Pixel2Motion | 1.2k | 像素→SVG动画、手作感 | `pixelstack` | ✅ warm paper+像素描边+粗黑线 |
| PPT Master | ~11k | 文档→PPT、PPT工具 | `blue`（blue-technical-manual） | ✅ 蓝色技术手册+文档工作流 |
| CoreCoder | ~1k | Agent 架构模式 | `darkblue` | ✅ 深蓝工作台+架构监控 |

## 反面案例（路由错误，已重建）

- Orca → 曾用 `redswiss`，应为 `darkblue`（Agent 工作台）
- 部分技术分享卡用了 `redswiss`，应为 `blue`

## 路由决策树

```
内容是自动化流水线/监控台/Agent控制台？
  → darkblue

内容是架构图/代码→图生成/依赖关系？
  → graph-paper

内容是像素→矢量/手作感/复古插画？
  → pixelstack

内容是纯技术手册/API文档/文档→PPT工作流？
  → blue（blue-technical-manual）

内容是开源工具目录/CLI合集？
  → redswiss

内容是轻量教程/单概念快速上手？
  → q-style

无法判断 → 选 main-style（红黑瑞士风）作为安全回退
```

## 注意事项

- `darkblue` 主题每张卡必须内联 shell CSS（见 skill pitfall `darkblue-shell-css`）
- `graph-paper` 适合技术笔记本语言，技术分享类卡不要用推广语气
- `pixelstack` 的 warm paper 背景与品牌设计工具高度契合
- 不要因为"工具卡都该用 hardblue"就拒绝更精准的路由