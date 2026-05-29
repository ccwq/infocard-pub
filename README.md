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
date: "2026-05-24"
tags:
  - hermes
  - basics
```

## 索引

- `_index.yaml` 由 workflow 自动维护，不要手动编辑
- Pages 部署前会现场重建 `_index.yaml`，保证上线产物与首页列表原子一致
- 索引页：`index.html`（客户端 JS 筛选）

## 分类目录

| 目录 | 用途 |
|---|---|
| `/docs/` | 文档、教程、概念速查 |
| `/news/` | 新闻核查类信息卡 |
| `/investigation/` | 调查报道 |
| `/trends/` | 趋势、舆情 |

## 工作流

1. Agent 生成信息卡 HTML / `report.md`
2. Agent 同步创建 `index.html.meta.yaml`
3. `git push` 到 `main`（不要手动编辑 `_index.yaml`）
4. `pages.yml` 在部署 artifact 前现场重建并校验 `_index.yaml`
5. `index.yml` 将同一套规则生成的 `_index.yaml` 回写到仓库，保持 repo 与线上一致
6. 部署后 workflow 会对线上 `/_index.yaml` 做 smoke test，确认首页 list 已包含最新结果

## 防漏发布机制

- `_index.yaml` 由 `scripts/rebuild_index.py` 统一生成，`index.yml` 和 `pages.yml` 共用同一逻辑，避免两套规则漂移
- `scripts/verify_index.py` 会阻止以下坏状态进入部署：
  - meta 缺字段
  - meta 指向的 HTML 不存在
  - `_index.yaml` 缺卡 / 重复 slug / 字段不一致
  - `_count` 与实际卡片数不一致
- GitHub Pages 上传前重新生成 `_index.yaml`，避免“详情页已部署但首页还是旧 list”的竞态
- 部署完成后会轮询线上 `/_index.yaml`，比对卡片数量和顶部 slug；不一致直接让 workflow 失败

