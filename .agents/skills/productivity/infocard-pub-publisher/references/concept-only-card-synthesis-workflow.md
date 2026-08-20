# 纯概念/无外部来源信息卡合成工作流

## 触发条件

用户提供了完整的核心理念、论点、方法论，但没有 GitHub URL、没有公开网页、没有可抓取的外部来源——此时不能等待"找到链接"，而应直接用**文本合成**方式生成信息卡。

典型信号：
- 用户粘贴完整的"Token 最大化 / 人置于环路 / 伪技能"等条目
- 用户说"调查下面的换点 进行调查补充 创建信息卡"
- 内容是思想/方法论/理念，不是工具/仓库

## 合成策略

### 1. 先做补充调研

先用 web search 查背景：

```
GStack AI workflow collaborative coding agents 2025 2026
Claude Cline Codex token optimization AI coding workflow 2026
Garry Tan gstack YC virtual engineering team
```

从搜索结果中提炼：
- 量化数据（Garry Tan 的 810× 基准）
- 人物/项目关联（Andrej Karpathy 引言）
- 工具生态（nanostack、Cline、Codex）
- 最新时间戳（确保时效性）

### 2. 确定主题

合成卡的主题**不能是 hardblue（工具手册）**，因为内容是方法论，不是工具。

按内容匹配：
- 效率方法论 / AI 协作理念 → `wood`（长文编辑风）或自定义深色方法论风
- 量化数据密集 → `darkblue`（工作台仪表盘）
- 工具链操作流程 → `hardblue`

本例（GStack）：自定义深色方法论风（深黑底 + 蓝 accent + 金色强调），对应 gstack 的"AI 虚拟工程团队"气质。

### 3. HTML 结构要求

合成卡的结构模板（6-section 法）：

```
HERO       → 标题 + 核心主张 + 量化成果引言
Section 01 → 核心理念 A（Token 最大化）
Section 02 → 核心理念 B（人置于环路）+ 流程图
Section 03 → 核心理念 C（伪技能 + 逻辑密度）
Section 04 → 工具分工（Cline vs Codex）
Section 05 → 主权保障 / 基础设施
Section 06 → 量化成果数据（810× / 240× / 逻辑行）
```

**必须包含的增强元素**：
- 对比表（传统 vs 新方法）：用 `compare-box` 类
- 引言框（Karpathy / Garry Tan 的原话）
- 流程节点（`flow-step` 类）
- 量化数字突出展示

### 4. 无外部图片时的处理

合成卡**不需要** OG 图。如需视觉锚点：
- 用 CSS/SVG 自绘图代替真实截图
- 嵌入数据图标的 CSS badge 代替实物图
- hero 用大字体数字（810×）代替图片

### 5. Wiki 同步的 source URL 字段

当没有原始 source URL 时：
- `source_url` 写搜索发现的主要来源（如 github.com/TMFNK/gstack-OpenCode）
- 如果纯粹是用户提供的理念，source_url 写"用户提供的核心理念 + 补充调研"
- **不能**留空 `source_url`

## 验证清单

- [ ] 合成内容有补充调研数据支撑，不是纯用户原文
- [ ] 量化数字有来源（搜索结果中找到）
- [ ] HTML 有 6+ 个 section，不是单段落罗列
- [ ] 有对比表或流程图等结构化表达
- [ ] 无外部图片时，CSS/SVG 视觉锚点正常显示
- [ ] `source_url` 填搜索发现的主要来源
- [ ] build + verify 通过，390px 无溢出

## 相关坑点

- **不要**等找到外部 URL 才写卡：用户说"调查补充"就说明他知道内容不够完整，正确行为是先搜索补充再写
- **不要**把用户原文当全部内容：合成卡要有调研增值（Garry Tan 810× 数据是搜索发现的，不是用户原文有的）
- **不要**用 hardblue 套所有内容：GStack 是方法论不是工具，硬套工具风会降低可读性
