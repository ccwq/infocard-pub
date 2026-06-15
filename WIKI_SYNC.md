# Infocard → LLM Wiki 同步规范

> 本文档定义 infocard-pub 与 LLM Wiki 之间的同步规则。
> 生效日期：2026-06-15
> 维护者：Hermes Agent

---

## 1. 目标

- infocard-pub 负责**信息卡的发布与传播**
- LLM Wiki 负责**高价值知识的沉淀与复用**
- 两者同步，确保每张高价值卡不只上线 HTML，还留下结构化知识记录

---

## 2. 接入范围

**只同步高价值 infocard**，包括：

- 人物 / 组织 / 事件调查卡
- 技术深度分析 / 方法论卡
- 工具 / 框架 / 工作流卡
- 科研 / 量化 / 自动化类卡
- 重要舆论 / 争议 / 政策类卡

**不接入**：纯视觉展示卡、纯宣传卡、无新增知识的轻包装卡。

---

## 3. Wiki 存储模型

每张高价值卡生成两层：

### 3.1 Raw 记录（第一层）
- **路径**：`/home/ccwq/hehome/hermes-data/home/wiki/raw/articles/`
- **命名**：`YYYY-MM-DD-infocard-<slug>.md`
- **定位**：可追溯、可复查、保留版本证据；raw 目录视为不可变
- **必须包含**：
  - `source_url`：原始来源 URL
  - `infocard_url`：GitHub Pages 卡片 URL
  - `slug`：infocard slug
  - `ingested`：写入日期
  - `sha256`：body hash（用于检测变更）
  - 卡片核心内容摘要
  - 关键结论
  - 后续版本记录

### 3.2 Wiki 知识页（第二层）
- **路径**：根据内容类型分配
  - 人物 / 组织 / 产品 → `entities/`
  - 方法论 / 工作流 / 可复用模式 → `concepts/`
  - 一次专题调查 / 专题结论 → `queries/`
  - 对比分析 → `comparisons/`
- **命名**：小写、中划线、无空格，如 `x-ai-agent-treasure-workflow-patterns.md`
- **定位**：可复用知识，不堆 HTML 文案
- **Frontmatter 必须包含**：
  ```yaml
  title: 页面标题
  created: YYYY-MM-DD
  updated: YYYY-MM-DD
  type: entity | concept | comparison | query | summary
  tags: [from taxonomy]
  sources: [raw/articles/YYYY-MM-DD-infocard-slug.md]
  confidence: high | medium | low
  contested: false
  contradictions: []
  ```
- **正文要求**：
  - 提炼结论，不是复制 HTML
  - 至少 2 个 `[[wikilinks]]` 交叉链接
  - 包含 infocard 公网 URL
  - 包含原始 source URL
  - 明确“这张卡沉淀出的长期知识是什么”

---

## 4. 新增高价值卡发布流程

> **高价值卡发布成功 = infocard 公网验证通过 + wiki 同步完成。Wiki 同步失败 = 发布未完成。**

```
1. 调研 / 采集来源
2. 生成 HTML + meta.yaml
3. npm run build && npm run verify
4. commit + push
5. 公网验证通过
   ├── detail HTTP 200
   ├── _index.yaml 收录
   ├── 首页可搜索
   ├── 图片 HTTP 200
   └── 移动端验收
6. 写入 LLM Wiki
   ├── raw/articles/YYYY-MM-DD-infocard-<slug>.md
   ├── entities/ | concepts/ | queries/ | comparisons/
   ├── 更新 index.md
   └── 更新 log.md
7. 验证 wiki
   ├── 搜索 slug 命中
   ├── 搜索标题命中
   └── index.md / log.md 已更新
8. 报告“发布完成”
```

---

## 5. 修改同步规则

当已入库 infocard 发生修改（内容 / 风格 / 图片 / 结论）：

1. **raw 层**：新增版本文件（如 `-v2.md`），不覆盖旧 raw
2. **wiki 页层**：只保留最新版结论，在正文中追加变更记录
3. **Frontmatter**：更新 `updated`，`sources` 字段追加新版本 raw

示例正文追加：

```markdown
## 版本更新记录
- YYYY-MM-DD：更新了图片 / 主叙事 / 来源或结论。
```

---

## 6. 删除 / Archive 规则

当 infocard 下线或删除：

1. **raw 保留**，不物理删除
2. **wiki 页**：加 archive 标记，不物理删除
   ```yaml
   archived: true
   archive_reason: infocard removed from public site
   archived_at: YYYY-MM-DD
   ```
3. **index.md**：从正常区移除或移至 Archive 区
4. **log.md**：记录删除同步动作

---

## 7. 历史卡补录策略

**不一次性灌全部存量**。采用 10 张样本试运行：

1. 优先选：调查类、人物类、技术方法类、Agent/workflow 类
2. 验证：raw 模板、自动分类、wiki 摘要密度、index/log 更新
3. 样本确认后，再决定批量补录方向（按 category / 按日期 / 按热度）

---

## 8. 验收清单

每张高价值卡发布完成必须同时满足：

### Infocard 侧
- [ ] HTML + meta.yaml 存在
- [ ] `npm run build` 通过
- [ ] `npm run verify` 通过
- [ ] 已 commit + push
- [ ] detail HTTP 200
- [ ] `_index.yaml` 收录
- [ ] 首页可搜索
- [ ] 图片 HTTP 200
- [ ] 移动端无横向溢出

### Wiki 侧
- [ ] `raw/articles/...md` 已写入
- [ ] entities / concepts / queries / comparisons 页面已写入或更新
- [ ] `index.md` 已更新
- [ ] `log.md` 已更新
- [ ] 搜索 slug 能命中
- [ ] sources 指向 raw 文件
- [ ] 页面包含 infocard 公网 URL

---

## 9. 相关文件

| 位置 | 说明 |
|---|---|
| `WIKI_SYNC.md` | 本规范文档 |
| `infocard-pub-publisher` skill | 发布流程 + wiki sync gate |
| `wiki/concepts/infocard-to-wiki-sync.md` | Wiki 内部规范页 |
| `wiki/SCHEMA.md` | Wiki 结构规范 |
| `wiki/index.md` | Wiki 索引 |
| `wiki/log.md` | Wiki 操作日志 |

---

## 10. Wiki 路径

- **Wiki 根路径**：`/home/ccwq/hehome/hermes-data/home/wiki`
- **环境变量**：`WIKI_PATH`
- **Config 位置**：`/home/ccwq/utils/hermes-webui/.env`

---

*最后更新：2026-06-15 | 版本：1.0*