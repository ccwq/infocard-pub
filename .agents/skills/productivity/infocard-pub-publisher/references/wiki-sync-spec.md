# Infocard → LLM Wiki 同步规范（精简版）

> 完整规范见 `infocard-pub/WIKI_SYNC.md` 或 `wiki/concepts/infocard-to-wiki-sync.md`

## Wiki 路径
`/home/ccwq/hehome/hermes-data/home/wiki`（`WIKI_PATH` in `~/.hermes/.env`）

## 高价值卡定义
- 人物 / 组织 / 事件调查卡
- 技术深度分析 / 方法论卡
- 工具 / 框架 / 工作流卡
- 科研 / 量化 / 自动化卡
- 重要舆论 / 争议 / 政策卡

## 存储模型

每张卡两层：

| 层 | 路径 | 说明 |
|---|---|---|
| raw | `raw/articles/YYYY-MM-DD-infocard-<slug>.md` | 不可变，修改时追加版本文件 |
| 知识页 | `entities/` / `concepts/` / `queries/` / `comparisons/` | 根据内容类型分配 |

### 分类规则
- 人物 / 组织 / 产品 → `entities/`
- 方法论 / 工作流 → `concepts/`
- 专题调查 / 专题结论 → `queries/`
- 对比分析 → `comparisons/`

### raw 必含字段
```yaml
source_url: <原始来源>
infocard_url: <GitHub Pages URL>
slug: <slug>
ingested: YYYY-MM-DD
sha256: <body hash>
```

### 知识页 frontmatter
```yaml
title: 标题
created: YYYY-MM-DD
updated: YYYY-MM-DD
type: entity | concept | comparison | query | summary
tags: [from taxonomy]
sources: [raw/articles/YYYY-MM-DD-infocard-slug.md]
confidence: high | medium | low
contested: false
contradictions: []
```

### 知识页正文要求
- 提炼结论，不是复制 HTML
- 至少 2 个 `[[wikilinks]]`
- 包含 infocard 公网 URL + source URL

## 流程

```
1. 调研/采集来源
2. 生成 HTML + meta.yaml
3. npm run build && npm run verify
4. commit + push
5. 公网验证通过
6. 写入 wiki（raw + 知识页 + index.md + log.md）
7. 验证 wiki（搜索 slug/标题 / index / log）
8. 报告完成
```

⚠️ **wiki 写入失败 = 发布未完成**

## 修改同步
- raw：追加新版本文件（如 `-v2.md`）
- 知识页：更新 `updated`，正文追加变更记录，`sources` 追加新版本 raw

## 删除同步
- raw：保留
- 知识页：加 `archived: true`，从 `index.md` 正常区移除
- log.md：记录删除动作

## 验收清单

### Infocard 侧
- [ ] HTML + meta.yaml 存在
- [ ] `npm run build` 通过
- [ ] `npm run verify` 通过
- [ ] 已 commit + push
- [ ] detail HTTP 200
- [ ] `_index.yaml` 收录
- [ ] 图片 HTTP 200
- [ ] 移动端无横向溢出

### Wiki 侧
- [ ] raw 文件已写入
- [ ] 知识页已写入或更新
- [ ] `index.md` 已更新
- [ ] `log.md` 已更新
- [ ] 搜索 slug 能命中
- [ ] 页面含 infocard URL + source URL