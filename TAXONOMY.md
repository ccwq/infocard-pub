# Taxonomy 数据规范

本文档定义 infocard-pub 的元数据分类体系，以及新增/修改信息卡的标准化流程。

## 目标

确保每张信息卡的 taxonomy 字段完整、规范，使首页 filter 能正确统计和过滤所有已发布卡片。

## 数据链路

```
docs/<slug>.html.meta.yaml
        ↓
scripts/build-site.js
        ↓
scripts/index-build-lib.js  (buildIndexData)
        ↓
_index.yaml  +  index.html 注入
        ↓
首页 assets/home/index.js  (normalizeCard + filter)
        ↓
filter 统计 / 筛选结果
```

## Taxonomy Schema

每张卡的 `.meta.yaml` 必须包含完整 `taxonomy` 对象：

```yaml
taxonomy:
  domains: []      # 平台 / 领域
  tool_types: []  # 工具类型
  stages: []      # 使用阶段
  interaction: []  # 交互形态
  content_type: [] # 内容类型
  source: []       # 来源
  style: []        # 风格
  risk: []          # 风险
```

允许值见 `_taxonomy.yaml`。

## 必填规则

| 维度 | 是否必须非空 | 说明 |
|---|---|---|
| `source` | 必须 | 可从 `source_url` 自动推断 |
| `style` | 必须 | 优先取顶层 `style`，fallback 到 taxonomy.style |
| `risk` | 必须 | 默认 `低风险`；敏感内容自动升级 |
| `content_type` | 必须 | 可从 `category / source_url / title / desc` 自动推断 |
| `domains` | 可空 | 允许非工具/非技术卡为空 |
| `tool_types` | 可空 | 允许纯观点/调查卡为空 |
| `stages` | 可空 | 允许人物/调查卡为空 |
| `interaction` | 可空 | 允许非工具卡为空 |

## 自动推断规则

工具链自动从以下字段推断 taxonomy 值：

- `source_url` → `source`
- 顶层 `style` → `taxonomy.style`
- `category / title / tags / note` → `content_type / domains / tool_types / stages / interaction / risk`

### source 推断

| source_url 特征 | taxonomy.source |
|---|---|
| `github.com` | `GitHub` |
| `x.com` / `twitter.com` | `X / Twitter` |
| `arxiv` / `doi.org` 等学术站点 | `Paper` |
| PDF 文件 | `PDF` |
| `youtube.com` / `bilibili.com` | `Video` |
| 普通 `https://` | `Website` |
| 其他已知来源 | 相应类型 |

### style 别名规范

| 历史写法 | 标准值 |
|---|---|
| `hardblue-style` | `hardblue` |
| `infocard-darkblue-style` | `darkblue` |
| `redswiss-style` / `infocard-redswiss-style` | `redswiss` |
| `graph-paper-style` | `graph-paper` |
| `infocard-pixelstack-style` | `pixelstack` |
| 其他 `infocard-*-style` 前缀 | 去掉前缀取标准 slug |

## 新增信息卡 SOP

### 标准流程

```bash
# 1. 创建 HTML 和 meta.yaml
# 2. 运行自动补全（可选：先留空，之后补）
npm run fix-taxonomy

# 3. 验证 taxonomy 完整（强制门禁）
npm run verify-taxonomy

# 4. 构建 + 验证
npm run build && npm run verify

# 5. 验证 filter 可达性（可选，推荐）
node scripts/verify-filter-index.js --slug <slug>

# 6. 提交 + push
git add ...
git commit -m "docs: add <slug> info card"
git push
```

### 新卡 meta 最小模板

```yaml
slug: 20260626-example
path: docs/20260626-example.html
category: tool
title: 示例标题
desc: 示例描述
date: '2026-06-26 14:30:00'
updated: '2026-06-26 14:30:00'
tags:
  - Example
source_url: https://github.com/example/example
style: hardblue
taxonomy:
  domains: []
  tool_types: []
  stages: []
  interaction: []
  content_type: []
  source: []
  style: []
  risk: []
```

写卡者可先只填基本字段（slug / path / category / title / date / source_url / style），其余留空，`fix-taxonomy` 自动补全。

## 修改信息卡 SOP

### 修改正文，不改定位

```bash
npm run verify-taxonomy
npm run build && npm run verify
```

### 修改了以下字段，必须重新跑 fix-taxonomy

- `source_url` / `source`
- `style`
- `category`
- `title` / `desc` / `tags` / `note`

```bash
npm run fix-taxonomy
npm run verify-taxonomy
npm run build && npm run verify
```

### 原地刷新已有卡

保留原 slug / path / date，更新 `updated`，然后走标准流程。

## 历史卡回填策略

按批次处理，不阻塞日常发布：

- **批次 1**：完全缺 taxonomy 的卡（已完成）
- **批次 2**：最近高价值卡（GitHub Star ≥ 500 / 调查/方法论类）
- **批次 3**：source 缺失但有 source_url 的卡
- **批次 4**：style 别名规范化

回填命令：

```bash
# 批次 2：source 推断
node scripts/fix-taxonomy.js --write --all

# 全量审计
npm run verify-taxonomy -- --all

# filter 可达性全量验证（慢）
node scripts/verify-filter-index.js --all
```

## 工具链参考

| 命令 | 用途 |
|---|---|
| `npm run fix-taxonomy` | 自动补全 taxonomy 字段（写入） |
| `npm run verify-taxonomy` | 校验 taxonomy 完整性（CI 门禁） |
| `node scripts/verify-filter-index.js --slug <slug>` | 验证卡片 filter 可达性 |
| `node scripts/audit-taxonomy.js` | 数据健康报告（覆盖率 / 别名） |

## CI 行为

CI (pages.yml / index.yml) 在 `npm run verify` 之后运行 `npm run verify-taxonomy`：

- 对新增/修改卡强制校验
- 必须字段（source / style / risk / content_type）必须非空
- 历史卡只报 warning，不阻塞发布
- 校验失败 → CI 失败，发布中止

CI **不自动修复**，修复在本地执行后再 push。

## 常见失败与修复

### "source must be non-empty"

没有 `source_url`，手动添加：

```yaml
source: Website  # 或 User-provided / Screenshot / Blog 等
```

### "invalid value X for style"

style 值不在 `_taxonomy.yaml` 允许列表中，工具已做 canonicalize 若仍失败，检查 `_taxonomy.yaml` 是否缺少该 style。

### 卡片出现在 filter 统计但无法筛选出来

运行 `verify-filter-index.js --slug <slug>` 检查每个 facet 是否 PASS。

### tags 污染警告

tags 中包含了 style slug / source 类型 / category 同义词，如 `hardblue` / `GitHub` / `tool`，应从 tags 移除，让它们进入 taxonomy。

## 规范维护

修改 `_taxonomy.yaml`（新增/删除允许值）后，需同步：

1. 同步更新本规范文档
2. 运行 `npm run verify-taxonomy -- --all` 检查是否有卡需要适配新值
3. 如有卡使用已删除的值，需人工修正
