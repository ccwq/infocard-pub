# TAXONOMY.md

## 目标

infocard-pub 首页不再把 `tags[]` 当作唯一过滤模型。

新的组织原则是：

- **taxonomy = 主筛选结构**
- **tags = 搜索关键词**
- **category = 历史兼容字段，不再承担首页主分类职责**
- **style / source 不再混入 tags**

## 首页筛选规则

### 主筛选（默认展示）

1. `domains` 平台 / 领域
2. `tool_types` 工具类型
3. `stages` 使用阶段
4. `interaction` 交互形态
5. `content_type` 内容类型

### 高级筛选（折叠）

1. `source` 来源
2. `style` 风格
3. `risk` 风险等级

### 匹配逻辑

- 同一维度内：**OR**
- 不同维度间：**AND**

示例：

- `domains = [AI / LLM, Obsidian]`
- `tool_types = [AI 辅助工具]`

表示：

- 命中任一 `domains`
- 且必须命中 `tool_types`

## 元数据结构

每张卡新增：

```yaml
taxonomy:
  domains:
    - AI / LLM
  tool_types:
    - AI 辅助工具
  stages:
    - 开发
  interaction:
    - 命令行
  content_type:
    - 开源项目
  source:
    - GitHub
  risk:
    - 低风险
```

### 保留字段

- `category`: 保留，用于兼容旧卡与历史逻辑
- `tags`: 保留，但仅作为搜索关键词 / 卡片展示关键词
- `style`: 保留，用于渲染与高级筛选
- `source_url`: 保留，用于来源追溯

## tags 规则

### tags 应该放什么

- 项目名
- 人名 / 组织名
- 关键词
- 缩写
- 搜索时用户可能直接输入的词

例如：

```yaml
tags:
  - obsidian
  - claude-code
  - kepano
  - markdown
```

### tags 不该放什么

- 风格 slug（如 `hardblue`）
- 来源类型（如 `GitHub` / `X`）
- 大小写重复词（如 `Python` / `python`）
- 连字符变体重复（如 `AI Agent` / `ai-agent`）
- category 同义词（如 `工具` / `tool` / `tools`）

## 迁移策略

### Phase 1

- 新增 `_taxonomy.yaml`
- 新增审计脚本与迁移脚本
- 首页支持 taxonomy 和 legacy tags 并存

### Phase 2

- 自动为历史卡补 `taxonomy`
- 高频 / 高价值卡人工审查
- 旧 tags 不删除，只降级为搜索关键词

### Phase 3

- 新卡默认必须填写 taxonomy
- `build` 对缺失 taxonomy 给 warning
- 后续可升级为 error

## 高价值卡人工审查范围

优先审查：

- 高频标签前 100
- 最新 100 张卡
- 工具 / 工作流 / 方法论 / 调查 / 安全风险 / 技术手册类卡片
- category 明显混乱的卡片
- tags 存在重复变体的卡片

## 开发约束

1. 不允许直接手改 `_index.yaml`
2. taxonomy 变更后必须 `npm run build && npm run verify`
3. 首页筛选逻辑改为 facet 维度匹配
4. 普通 tags 不再出现在首页主筛选墙

## 后续脚本

- `scripts/audit-taxonomy.js`
- `scripts/migrate-taxonomy.js`

## 验收目标

- category 唯一值降到可控范围
- 主筛选不再展示 1000+ 扁平 tags
- style/source 从 tags 中剥离
- tags 成为搜索关键词而不是 taxonomy 垃圾桶
