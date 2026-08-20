# meta.yaml 格式规范（经验教训 2026-07-25）

## 触发背景

华为停产舆情信息卡发布时，GitHub Actions `Build site artifact` 步骤失败。本地 build 报错：

```
Error: Index build failed:
- expected a single document in the stream, but found more
```

调查发现真实根因：**meta.yaml 缺少必填字段**（`slug`/`category`/`path`/`desc`），index-build-lib 在处理前先调用 `fix-meta-shape`，修复后仍然缺失 category，导致 build 抛出 `missing fields` 类型的错误信息，而非格式错误。

## 正确格式（single-doc YAML，无前导 `---`）

```yaml
slug: 20260725-xhs-huawei-supply-chain-panic
title: "小红书「完蛋了华为要停产」舆情调查"
desc: "描述文字，用于首页展示和搜索索引。"
date: "2026-07-25 00:55:00"
updated: "2026-07-25 00:55:00"
tags:
  - 华为
  - 供应链
category: 舆情调查        # 必须；有效值参考已有卡片（如"调查核查"、"舆情调查"）
author: Hermes Agent
source: 小红书
source_url: https://www.xiaohongshu.com/explore/6a6372320000000011012ac6
style: hardblue
path: docs/20260725-xhs-huawei-supply-chain-panic.html
```

## 必须字段（index-build-lib.js line 196）

```
slug, path, category, title, date, tags, desc
```

缺失任意一个 → 整张卡被跳过 → index build 失败。

## 已知有效 category 值

```
调查核查 / 舆情调查 / 工具 / 工具图鉴 / 方法论 / 技能 /
技术调研 / 观点 / 公司调查 / 安全工具 / 本地LLM / 财经科普 / ...
```

## 教训

1. meta.yaml **不是任意字段集合**，必须包含 index-build-lib 必填字段。
2. `path` 必须在顶层（不在 `---` 分隔符后的第二 doc 中）。
3. `category` 必须是非空中文分类名，不能为空字符串。
4. `desc` 必须有实际内容（`trim()` 后非空）。
5. 每次新建卡片后，**先在主仓库本地跑 `npm run build`** 验证通过再 push，等 GitHub Actions 是浪费时间。
