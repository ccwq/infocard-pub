# Homepage taxonomy refactor plan (2026-06-25)

Use this when the user complains that `infocard-pub` homepage tags/categories are redundant, duplicated, or not strategically designed.

## Diagnosis from the 365-card snapshot

- Cards: 365
- Unique `category`: 56
- Unique `tags`: 1645
- Tag instances: 2763
- Singleton tags: 1328 (~80.7% of unique tags)
- Normalized duplicate groups: 148
- Style tokens in `tags`: 39 instances (`hardblue`, `redswiss`, `archive-green`, etc.)
- Source tokens in `tags`: 92 instances (`X`, `GitHub`, `website`, etc.)

Root cause: `category`, `source`, `style`, topic keywords, project names, languages, and interaction modes are all mixed into flat `tags[]`. The homepage then counts and renders all tags as one global button wall, so filtering is noisy even when the UI works.

## Current code seam

Primary files:

- `assets/home/index.js`
  - `normalizeCard()` sets `__category` from `card.category` and `__tags` from `card.tags`.
  - `tagCounter` counts every item in `card.__tags`.
  - `sortedTags` sorts flat tags by frequency.
  - `filteredCards` checks `selectedTags.some(tag => card.__tags.includes(tag))`.
- `scripts/index-build-lib.js`
  - required fields include `category` and `tags`.
  - build currently copies metadata through without taxonomy normalization.
- `docs/**/*.meta.yaml`
  - source of all metadata.

## Recommended default: B — dual-track migration

When asked to fix this class of issue, recommend and implement the dual-track path unless the user explicitly chooses otherwise:

1. Add structured `taxonomy` for canonical filtering.
2. Keep legacy `tags` for search and card-level keyword display.
3. Do not immediately delete or rewrite all historical tags.
4. Auto-migrate historical cards, then manually review high-frequency/high-value cards.

Avoid one-shot destructive replacement of `tags[]`; it risks breaking search, homepage behavior, and historical cards.

## Canonical taxonomy v1

```yaml
taxonomy:
  domains: []        # 平台 / 领域
  tool_types: []     # 工具类型
  stages: []         # 使用阶段
  interaction: []    # 交互形态
  content_type: []   # 内容类型
  source: []         # 来源
  style: []          # 信息卡视觉风格 / 高级筛选
```

### domains — 平台 / 领域

Android, Web 前端, Node.js, JavaScript, TypeScript, Python, Rust, Go, Kotlin, 3D / 图形, GIS / 地图, AI / LLM, Agent / 自动化, DevOps, CLI / Terminal, 操作系统, 游戏开发, Windows, macOS, Linux, Obsidian, 知识管理, 安全 / 红队, 数据 / 分析, 设计 / 动效, 多媒体 / 视频, 金融 / 投研, 教育 / 科普, 舆情 / 调查

### tool_types — 工具类型

CLI 工具, IDE / 编辑器, 构建工具, 包管理器, 进程管理, 版本控制, 调试工具, 自动化工具, 网络工具, 图形 / 可视化, 动画引擎, 地理引擎, AI 辅助工具, Agent 框架, MCP / 协议, 脚本工具, 多仓库管理, 知识库工具, 浏览器自动化, 设计工具, 数据处理工具, 监控 / 可观测, 安全工具, 内容生成工具

### stages — 使用阶段

需求 / 规划, 开发, 构建, 调试, 测试, 发布, 运维, 监控, 重构, 性能优化, 学习 / 入门, 规范 / 流程, 调研 / 选型, 知识沉淀, 风险评估

### interaction — 交互形态

命令行, GUI, Web API, 库 / SDK, 框架, 守护进程, 代理 / 服务, 插件, 浏览器扩展, MCP Server, 桌面应用, Web 应用, 移动端, 配置文件, 提示词 / Skill

### content_type — 内容类型

开源项目, 工具介绍, 技术手册, 方法论, 调查报告, 舆情核查, 人物 / 组织, 资源清单, 教程 / 入门, 对比评测, 安全风险, 产品分析, 科普解释, 观点文章

### source — 来源

GitHub, X / Twitter, Website, Blog, PDF, Paper, Wikipedia, Screenshot, User-provided, News, Video

### style — 高级筛选

hardblue, redswiss, q-style, wood, black-head, graph-paper, pixelstack, archive-green, darkblue, darkgreen, scrapbook, white-purple, color-material

## Implementation plan

### Phase 1 — audit only

Add `scripts/audit-taxonomy.js` that outputs:

- category distribution
- normalized duplicate tag groups
- style/source tokens mixed into `tags`
- singleton tags
- per-card suggested taxonomy

Suggested output files:

- `tmp_taxonomy_audit.json`
- `tmp_taxonomy_suggestions.yaml`

### Phase 2 — source of truth

Add `_taxonomy.yaml` with:

- `version`
- `dimensions`
- canonical values
- `aliases` mapping variants to canonical tags

Example aliases:

```yaml
aliases:
  claude-code: Claude Code
  Claude-Code: Claude Code
  ai-agent: AI Agent
  AI-Agent: AI Agent
  open-source: 开源
  Open Source: 开源
```

### Phase 3 — build compatibility

Modify `scripts/index-build-lib.js` so build output keeps both:

- `taxonomy` / `filter_facets` for structured filtering
- `tags` / `legacy_tags` for old keyword display and search

Build should warn when a new card lacks taxonomy; after migration stabilizes, consider making missing taxonomy an error for new files only.

### Phase 4 — homepage UI

Modify `assets/home/index.js`:

- Replace the global flat tag wall with facet filters.
- Main visible filters: domains, tool_types, stages, interaction, content_type.
- Advanced collapsed filters: source, style, risk if added later.
- `tags[]` remains searchable and can still render on each card as small chips, but should not drive the top-level filter wall.

Filtering should move from:

```js
card.__tags.includes(tag)
```

to dimension-aware matching:

```js
card.__facets[dimension].includes(value)
```

### Phase 5 — migration

Add `scripts/migrate-taxonomy.js --write`:

1. Infer taxonomy from `tags`, `category`, `source_url`, `style`, `title`, `desc`.
2. Canonicalize aliases.
3. Move source/style/category-like tokens into taxonomy fields.
4. Keep ambiguous one-off tokens in legacy `tags`.
5. Do not remove old tags in the first migration pass.

Manual review should focus on:

- high-frequency tags (`claude-code`, `AI Agent`, `MCP`, `Python`, `X`, `GitHub`)
- recent/high-value cards
- cards with generic categories: `docs`, `knowledge`, `tool`, `tools`, `工具`

## Grill-me defaults

If the user asks for `grill-me` on this refactor, ask at most 3 rounds:

1. Scope: audit only / dual-track taxonomy / destructive tag replacement. Default: dual-track taxonomy.
2. Historical migration: new cards only / auto-migrate + manual review / full auto migration. Default: auto-migrate + manual review.
3. Homepage surface: 4 main dimensions / 5 main + advanced collapsed / all dimensions visible. Default: 5 main + advanced collapsed.

## Success checks

- `npm run build && npm run verify` passes.
- `_index.yaml` contains `taxonomy` or `filter_facets` for migrated cards.
- Homepage no longer renders 1000+ flat tag buttons by default.
- Category count should drop from 56 to a small controlled list or become secondary.
- Duplicate normalized tag groups should trend down from 148.
- A sample of cards can be filtered by each main dimension.
