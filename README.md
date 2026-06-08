# infocard-pub

信息卡公开链接托管。Agent 直接 push HTML 截图到对应分类目录，GitHub Pages 自动部署。

## URL 规范

```
/docs/{YYYYMMDD}-{slug}.html
```

## 元数据文件

每张信息卡需要配套一个同名 `.meta.yaml`，格式：

```yaml
slug: 20260524-hermes-basics
category: docs
title: Hermes Agent 基本概念
date: "2026-05-24 23:15:29"
tags:
  - hermes
  - basics
```

`date` 支持 `YYYY-MM-DD`，也支持 `YYYY-MM-DD HH:MM:SS`，建议继续用引号包起来，避免 YAML 把时间误解析成别的类型。

## 索引

- `_index.yaml` 与首页注入数据由本地 `npm run build` 统一生成，不要手动编辑
- `npm run build` 会先执行 `node scripts/fix-meta-date.js --write --date-source first`，只补齐缺失的 `date`

`scripts/fix-meta-date.js` 支持两种 git 时间来源：

- `--date-source first`：使用 HTML 的首次提交时间
- `--date-source last`：使用 HTML 的最后一次提交时间
- 不加 `--force` 时仅补全缺失字段；加 `--force` 时覆盖已有字段
- `--sync-updated` 开启后，`updated` 会沿用同一时间来源策略
- 索引页：`index.html`（构建时注入数据，客户端 JS 筛选）

## 分类目录

| 目录 | 用途 |
|---|---|
| `/docs/` | 文档、教程、概念速查 |
| `/news/` | 新闻核查类信息卡 |
| `/investigation/` | 调查报道 |
| `/trends/` | 趋势、舆情 |

## 发布前必读：信息泄露检查

每次发布新信息卡之前，**必须**先运行：

```bash
npm run check-leak
```

如果输出 `🚨` 或 `❗` 标记（CRITICAL / HIGH），**必须处理后才能发布**。MEDIUM 级别为建议审查，不阻断。

如需只检查本次新增的文件：

```bash
node scripts/check-info-leak.js docs/20260608-your-slug.html
```

---

## 工作流

1. Agent 生成信息卡 HTML / `report.md`
2. **运行 `npm run check-leak`** ← 新增：信息泄露扫描
3. Agent 同步创建 `index.html.meta.yaml`
4. 运行 `npm run build`，生成 `_index.yaml` 并把同一份索引数据注入根目录 `index.html`
5. `git push` 到 `main`（不要手动编辑 `_index.yaml` 和首页注入数据）
6. workflow 只校验产物是否已按本地构建规则更新，不再代为创建或回写
7. 部署完成后 workflow 会对线上 `/_index.yaml` 做 smoke test，确认首页 list 已包含最新结果

## 防漏发布机制

- `_index.yaml` 与 `index.html` 注入数据由 `npm run build` 统一生成，`npm run verify` 只做一致性校验
- `npm run verify` 会阻止以下坏状态进入部署：
  - meta 缺字段
  - meta 指向的 HTML 不存在
  - `_index.yaml` 未按当前源码重建
  - `index.html` 中注入的索引数据未同步更新
- workflow 会检查构建后 `git diff --exit-code`，防止漏提生成产物
- 部署完成后会轮询线上 `/_index.yaml`，比对线上产物与仓库提交结果是否一致；不一致直接让 workflow 失败

