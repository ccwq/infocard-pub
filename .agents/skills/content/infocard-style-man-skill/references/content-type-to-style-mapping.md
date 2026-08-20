# Style → Content-Type 映射规律（2026-06-27 提炼）

## 核心规律

内容类型决定视觉风格，而非标题或标签。

| 内容特征 | 推荐风格 | 原因 |
|---|---|---|
| 代码架构、知识图谱、依赖关系 | **graph-paper** | 纸感图谱 + 节点连线 + 等宽字体，工程手册气质 |
| 自动化工具、终端/监控、短视频 | **darkblue** | 深蓝渐变 + 玻璃面板 + 科技感 |
| 开源工具、CLI 生态、AI 工具集合 | **hardblue** 或 **redswiss** | 红色强调 + 高密度数据模块 |
| 技术手册、提示词工程、方法论 | **blue-technical-manual** | 冷蓝 + 等宽字体，手册节奏 |
| 调查/观点拆解、工具卡 | **black-head** | 黑头 + 红主强调，严肃技术叙事 |
| Agent 工作流、桌面工作台 | **darkblue** 或 **darkgreen** | 深色工作台 + 终端绿/蓝 |
| GStack/Agentic Engineering | **wood** | 木感 + 等宽字体，Simon Willison 气质 |
| 手绘草图、并行调度、思考过程 | **handline** | wired-elements 边框 + rough 骨架 |
| 像素/复古/游戏/堆叠 | **pixelstack** | 像素小人 + 金字塔方块 |

## 本次验证案例

1. **CoreCoder**（Claude Code 核心架构，7 模式节点图）
   → graph-paper：代码图谱 + 节点关系 + 纸感图谱手册感，契合度最高

2. **MoneyPrinterTurbo**（93k Stars 短视频自动化工具）
   → darkblue：自动化工具 + 终端监控感 + 科技深蓝，契合度最高

## 2026-07-12 实测补充

| 内容特征 | 推荐风格 | 案例 |
|---|---|---|
| 技术图生成工具、14种UML图、8种视觉风格 | **color-material** | fireworks-tech-graph（8,580 Stars，暖米纸+紫绿蓝调色板） |
| Coding Agent 教学项目、三层架构、Python | **hardblue** | tau-hf（1,435 Stars，红蓝顶栏+硬阴影） |
| Agentic RAG、LangGraph 状态图、模块化教程 | **hardblue** | agentic-rag-for-dummies（3,645 Stars，红蓝顶栏+硬阴影） |
| 多Agent系统设计、上下文工程、读写边界 | **hardblue** | langchain-multi-agent（红黑蓝手册+红色顶栏） |

color-material 的视觉锚点：暖米纸背景（#f7f2e8）、紫色主调（#6e3fd6）、绿色（#2e9b4b）、蓝色（#2e6be6）、橙色（#f59e0b）、硬8px阴影（8px 8px offset）、网格纹理背景。适合高密度工具图鉴、多特性对比、流程拆解类内容。

## 决策树

```
内容是否涉及代码架构/知识网络/依赖关系？
  是 → graph-paper
  否 ↓
内容是否涉及自动化/终端/AI 工具?
  是 → darkblue
  否 ↓
内容是否需要高密度数据/对比表格？
  是 → hardblue / redswiss
  否 ↓
参考 style registry，按视觉关键词匹配
```

## 参考规则

- `infocard-style-man-skill/SKILL.md` — Style Skill Schema 与 Live Registry
- `infocard-style-man-skill/references/graph-paper-style-session-note.md` — graph-paper 设计 DNA
- `infocard-darkblue-style/SKILL.md` — darkblue 设计 DNA