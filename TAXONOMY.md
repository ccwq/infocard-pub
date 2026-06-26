# TAXONOMY.md — infocard-pub 数据维度规范

> **版本：1.0 | 2026-06-26 固化**

## 背景

每张信息卡的 `.meta.yaml` 必须包含完整的 `taxonomy` 字段，使首页 filter 能正确统计和过滤该卡。

---

## 1. taxonomy schema

每张卡必须有完整的 8 维结构：

```yaml
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

---

## 2. 维度定义与允许值

以 `_taxonomy.yaml` 为准；允许值在该文件中定义。

### 主维度（5个）

| 字段 | 首页标签 | 是否必须非空 |
|---|---|---|
| `domains` | 平台 / 领域 | 可空 |
| `tool_types` | 工具类型 | 可空 |
| `stages` | 使用阶段 | 可空 |
| `interaction` | 交互形态 | 可空 |
| `content_type` | 内容类型 | **必须** |

### 高级维度（3个）

| 字段 | 首页标签 | 是否必须非空 |
|---|---|---|
| `source` | 来源 | **必须** |
| `style` | 风格 | **必须** |
| `risk` | 风险 | **必须** |

---

## 3. 非空要求详解

### content_type — 必须非空

可推断来源：`title`、`desc`、`category`、`source_url`、`tags`。

| 信号 | content_type |
|---|---|
| GitHub repo | `开源项目` |
| 工具标题 / category 含 tool | `工具介绍` |
| CLI / manual / reference | `技术手册` |
| workflow / philosophy / method | `方法论` |
| investigation / 调查 | `调查报告` |
| factcheck / 核查 | `舆情核查` |
| list / awesome / 清单 | `资源清单` |
| tutorial / guide / 入门 | `教程 / 入门` |
| comparison / vs / 对比 | `对比评测` |
| risk / security | `安全风险` |
| product / 官网 | `产品分析` |
| science / wikipedia 概念 | `科普解释` |
| essay / opinion | `观点文章` |

### source — 必须非空

可推断来源：`source_url`（GitHub / X / website / Wikipedia / Paper）。

| `source_url` 模式 | taxonomy.source |
|---|---|
| `github.com` | `GitHub` |
| `x.com` / `twitter.com` | `X / Twitter` |
| `wikipedia.org` | `Wikipedia` |
| 学术 / arxiv / doi | `Paper` |
| 普通 `https://` | `Website` |
| 无 URL，用户上传 | `User-provided` / `Screenshot` |

**注意**：`source` 只能从 `source_url` / 顶层 `source` 字段自动推断，不能从 tags 或 category 污染。

### style — 必须非空

优先级：`taxonomy.style` > 顶层 `style` > HTML 内容推断。

值必须是 `_taxonomy.yaml` 中的标准 slug，不接受别名：

| 别名（不接受） | 标准值 |
|---|---|
| `hardblue-style` | `hardblue` |
| `infocard-hardblue-style` | `hardblue` |
| `redswiss-style` | `redswiss` |
| `infocard-redswiss-style` | `redswiss` |
| `graph-paper-style` | `graph-paper` |
| `infocard-darkblue-style` | `darkblue` |

### risk — 必须非空

默认值：`低风险`。

升级规则：

| 信号 | risk |
|---|---|
| 安全工具 / 红队 / 漏洞 / 绕过 | `安全敏感` |
| 舆情 / 政策 / 监管 / 争议调查 | `政策敏感` |
| 高危执行性 + 敏感主题 | `高风险` |
| 一般工具 / 开源 / 教程 | `低风险` |

---

## 4. 推断规则

### domains — 可空，允许多选（最多 2–5 个）

| 信号 | domains |
|---|---|
| Python | `Python` |
| TypeScript / JavaScript | `TypeScript` / `JavaScript` |
| Node/npm | `Node.js` |
| Rust | `Rust` |
| Go | `Go` |
| Android | `Android` |
| Agent / Claude / LLM / RAG / MCP | `AI / LLM` |
| CLI / terminal / shell | `CLI / Terminal` |
| React / Vue / DOM | `Web 前端` |
| Obsidian / wiki / note | `知识管理` |
| security / red team | `安全 / 红队` |
| design / UI / motion | `设计 / 动效` |
| video / image / audio | `多媒体 / 视频` |
| finance / investment | `金融 / 投研` |
| investigation / news | `舆情 / 调查` |

### tool_types — 可空，允许多选

| 信号 | tool_types |
|---|---|
| CLI / terminal | `CLI 工具` |
| IDE / Cursor / VS Code / Claude Code | `IDE / 编辑器` |
| build / bundler | `构建工具` |
| npm / pip / uv | `包管理器` |
| debug / trace | `调试工具` |
| automation / Playwright | `自动化工具` |
| network / proxy | `网络工具` |
| graph / canvas / diagram | `图形 / 可视化` |
| AI / LLM / prompt | `AI 辅助工具` |
| Agent framework | `Agent 框架` |
| MCP | `MCP / 协议` |
| wiki / Obsidian | `知识库工具` |
| browser / CDP / Playwright | `浏览器自动化` |
| design / UI | `设计工具` |
| data / CSV | `数据处理工具` |
| monitor / observability | `监控 / 可观测` |
| security / sandbox | `安全工具` |
| image / video | `内容生成工具` |

### stages — 可空，允许多选

| 信号 | stages |
|---|---|
| plan / spec / PRD | `需求 / 规划` |
| coding / develop | `开发` |
| build | `构建` |
| debug | `调试` |
| test / verify | `测试` |
| publish / deploy | `发布` |
| ops / runtime | `运维` |
| monitor / observability | `监控` |
| refactor | `重构` |
| performance / benchmark | `性能优化` |
| guide / tutorial | `学习 / 入门` |
| workflow / manual | `规范 / 流程` |
| research / compare | `调研 / 选型` |
| knowledge / wiki | `知识沉淀` |
| risk / security | `风险评估` |

### interaction — 可空，允许多选

| 信号 | interaction |
|---|---|
| cli / terminal / shell | `命令行` |
| gui / desktop app | `GUI` |
| api / REST / GraphQL | `Web API` |
| sdk / library | `库 / SDK` |
| daemon / service / server | `守护进程` |
| proxy / gateway | `代理 / 服务` |
| plugin / extension | `插件` |
| MCP server | `MCP Server` |
| tauri / electron / desktop | `桌面应用` |
| WebUI / website | `Web 应用` |
| Android / iOS / mobile | `移动端` |
| config / YAML / dotfile | `配置文件` |
| skill / prompt | `提示词 / Skill` |

---

## 5. 发布 SOP

### 新增卡

```bash
# 1. 写 HTML + meta.yaml（可先留空 taxonomy）
# 2. 自动补 taxonomy
npm run fix-taxonomy

# 3. 校验
npm run verify-taxonomy

# 4. 构建 + 验证
npm run build && npm run verify

# 5. 可选：filter 数据验收
node scripts/verify-filter-index.js --slug <slug>

# 6. commit + push + wiki 同步
```

### 修改卡

若修改了以下字段，必须重新运行 `fix-taxonomy`：

- `source_url`
- `source`
- `style`
- `category`
- `title`
- `desc`
- `tags`

### 已有卡刷新

保留 `slug` / `path` / `date`，只更新 `updated` 和正文，然后：

```bash
npm run fix-taxonomy
npm run build && npm run verify
```

---

## 6. 工具链

| 脚本 | 用途 | 入口 |
|---|---|---|
| `scripts/taxonomy-lib.js` | 公共库：推断 / 校验 / canonicalize | 被其他脚本引用 |
| `scripts/fix-taxonomy.js` | 自动补 taxonomy | `npm run fix-taxonomy` |
| `scripts/verify-taxonomy.js` | 发布门禁 | `npm run verify-taxonomy` |
| `scripts/verify-filter-index.js` | filter 数据验收 | 独立调用 |

---

## 7. CI 门禁

`pages.yml` 和 `index.yml` 在 `npm run verify` 后运行 `npm run verify-taxonomy`。

**CI 浅克隆注意**：CI 工作区无 `origin/main` 时，`--changed-only` 返回空数组，此时 `verify-taxonomy` 会 skip 而非退化到全量校验（见 `references/ci-shallow-clone-taxonomy-gate-skip.md`）。

---

## 8. 历史卡回填策略

按批次处理，不阻塞日常发布：

1. **第一批**：完全缺 taxonomy 的 6 张卡 → 已完成
2. **第二批**：最近 7 天高价值卡
3. **第三批**：`source` 缺失但可从 `source_url` 推断的卡
4. **第四批**：`style` 别名规范化（`*-style` → 标准 slug）

---

## 9. 常见问题

**Q: `source` 推断失败？**  
检查 `source_url` 是否存在；若 URL 不可达或无法推断，手动写入 `source: User-provided`。

**Q: `style` 有别名？**  
运行 `fix-taxonomy --dry-run` 查看 canonicalize 变更，再用 `--write` 写入。

**Q: `domains` 混了语言和领域？**  
本轮保持混合，暂不拆分维度。先确保所有卡有值，再考虑未来规范化。

**Q: CI `verify-taxonomy` 失败但本地通过？**  
检查是否是 CI 浅克隆（无 `origin/main`）；已修复 skip 逻辑。如仍失败，本地跑 `npm run verify-taxonomy --all` 确认问题范围。
