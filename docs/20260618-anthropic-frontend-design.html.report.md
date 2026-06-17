# 采集报告：anthropics/skills — frontend-design

## 来源

- Repo: `anthropics/skills`
- Path: `skills/frontend-design/`
- Skill 文件: `SKILL.md` + `LICENSE.txt`
- GitHub: https://github.com/anthropics/skills/tree/main/skills/frontend-design

## 版本历史

| 日期 | Commit | 动作 |
|---|---|---|
| 2025-12-01 | `ef74077` | Move example skills into dedicated folder（仅结构迁移，无内容变更）|
| 2025-12-04 | `0075614` | Add doc-coauthoring skill + update example skills（**v1 初始内容**）|
| 2026-06-09 | `2235be7` | Update frontend-design skill #1293（**v2 重大重构**）|

## v1 (Dec 4 2025) 核心内容

**描述**: "Create distinctive, production-grade frontend interfaces with high design quality."

**设计思维（清单式）**:
- Purpose · Tone · Constraints · Differentiation
- Tone 选项：brutally minimal / maximalist chaos / retro-futuristic / organic / luxury / playful / editorial / brutalist / art deco / soft pastel / industrial / utilitarian

**前端美学指南**:
- Typography: 避免 Inter/Roboto/Arial，选用 distinctive font pairs
- Color: CSS variables, 主导色+锐利强调色
- Motion: CSS-only → Motion library for React, 页面加载编排优先
- Spatial: 不对称/重叠/负空间
- Backgrounds: 渐变网格/噪点纹理/几何图案/光影/自定义光标

**NEVER 清单**:
- 通用字体（Inter/Roboto/Arial/system）
- 紫色渐变白底
- 模板化布局

## v2 (Jun 9 2026) 核心内容

**描述**: "Guidance for distinctive, intentional visual design..."

**身份**: 主动扮演"以设计总监身份工作的小工作室"

**新增 "Ground it in the subject"**:
- 在 brief 不明确时自己 pin down 主题：具体产品/受众/单一任务
- 用项目自身世界的材料（工具/器物/词汇）来设计

**进化设计原则**:
- Hero = Thesis：最 characteristic 元素做开头
- Typography = Personality：字体传递性格，不是中性工具
- Structure = Information：结构编码真实内容，不是装饰
- Motion = Deliberate：时机、场景、一致性

**进化 AI 聚类处理**:
- NEVER 清单 → 校准参考
- 3种聚类：奶油底 / 深黑 / 报纸格
- 是默认值，不是错误
- 扩展收敛判定：Space Grotesk 也是信号

**新增整节 "More on writing in design"**:
- 文字是设计材料
- Active voice：Save changes → 不说 Submit
- 用户视角命名（管理通知，而非 webhook 配置）
- 错误即方向：错误说明发生了什么+如何修复，不道歉

**新增 "Restraint and self-critique"**:
- 大胆只放一处
- 截图审查
- 香奈儿原则：出门前拿掉一件配饰

**Process 流程（两轮）**:
- 第一轮：Brainstorm → Plan（Token系统 + ASCII wireframe + Signature）
- Critique before build：对照 brief，检查是否有成为通用答案的部分
- Build：遵循计划，小心 CSS specificity
- 第二轮：Critique + Screenshot

## v1 → v2 核心变化总结

| 变化类型 | v1 | v2 |
|---|---|---|
| +NEW | Ground it in the subject | 项目自身材料=独特性来源 |
| +NEW | 写作指南（整节） | v1 完全缺失 |
| +NEW | Restraint + self-critique | 大胆只放一处，截图审查 |
| +NEW | Process: brainstorm → plan → critique → build → critique again | v1 无此流程 |
| EVOLVED | Design Thinking 清单式 | Design Principles 意图式 |
| EVOLVED | NEVER 清单 | 校准参考（3种聚类） |
| EVOLVED | 具体字体禁止列表 | 原则性描述（Space Grotesk 也是信号） |
| REMOVED | 具体字体列表 | 不再列举，改原则 |
| REMOVED | Motion 库罗列 | Motion 改为方向性描述 |

## 定位洞察

- 不同于通用代码生成：强调视觉决策的意图性和可论证性
- 不同于设计规范工具：主动引入"工作室身份"，不是规则清单
- 不同于纯美学指南：包含完整的 Agent 协作流程（两轮 Plan-Build-Critique）
- v2 的写作指南使该技能超出 UI 设计范畴，成为产品文案的参考框架
