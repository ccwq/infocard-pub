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
- 索引页：`index.html`（客户端 JS 筛选）

## 分类目录

| 目录 | 用途 |
|---|---|
| `/docs/` | 文档、教程、概念速查 |
| `/news/` | 新闻核查类信息卡 |
| `/investigation/` | 调查报道 |
| `/trends/` | 趋势、舆情 |

## 工作流

1. Agent 生成信息卡 HTML → 截图
2. Agent 同步创建 `卡名.html.meta.yaml`
3. `git push` 到 `main`
4. GitHub Actions 检测新的 `.meta.yaml` → 更新 `_index.yaml`
5. GitHub Pages 自动更新# temp

