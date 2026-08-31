# 从调研文件直接写信息卡（不做 build/commit/push）

## 场景

用户提供了**完整调研过程文件**（如 `/tmp/infocard-process-YYYYMMDD-*.md`），要求：
- 写 HTML 信息卡
- 写 `.meta.yaml`
- 写 wiki 草稿（raw + concepts 两层）
- **不做 build / commit / push**

典型触发语：
- "基于 X 写信息卡"
- "不做 build/commit/push"
- "只写 HTML + meta + wiki 草稿"

## 工作流

```
1. 读取调研文件（process md）
2. 加载 infocard-style-man-skill（确定风格，如 redswiss）
3. 主线程直接写：
   - docs/<slug>.html          ← redswiss 风格 HTML
   - docs/<slug>.html.meta.yaml ← taxonomy 填充
   - wiki/raw/articles/YYYY-MM-DD-infocard-<slug>.md
   - wiki/concepts/<slug>.md   ← concepts 层
4. 报告完成，告知用户手动 build/commit/push 的下一步
```

## 风格选择

| 内容类型 | 推荐风格 |
|---------|---------|
| 工具/框架/CLI | redswiss / blue-technical-manual |
| 人物/事件调查 | redswiss |
| 技术方法论 | blue-technical-manual / hardblue |
| 知识整理/科普 | q-style / paper-warm |
| 系统监控/终端 | darkgreen / darkblue |

## meta.yaml 关键字段

```yaml
slug: YYYYMMDD-project-slug
path: docs/YYYYMMDD-project-slug.html
title: 项目标题
date: "YYYY-MM-DD HH:MM:SS"
updated: "YYYY-MM-DD HH:MM:SS"
category: agent-tool  # 或 docs / person / investigation
desc: 一句话描述（单行，不含换行）
source_url: https://github.com/...  # 主要来源
tags:
  - tag1
  - tag2
taxonomy:
  domains: [...]
  tool_types: [...]
  stages: [...]
  interaction: [...]
  content_type: [...]
  source: [...]
  style: [redswiss]
  risk: 低风险
```

## wiki 两层结构

### raw 层
路径：`wiki/raw/articles/YYYY-MM-DD-infocard-<slug>.md`
必须包含：source_url、infocard_url（占位符或上线后补）、slug、ingested、矛盾点列表

### concepts 层
路径：`wiki/concepts/<slug>.md`
必须包含：一句话定位、核心判断（3-5 条）、适用/不适用场景、选型对比、相关链接

## 本次实例（2026-07-09）

- 调研文件：`/tmp/infocard-process-20260709-084827.md`
- 目标：MinerU PDF 提取工具信息卡
- 风格：redswiss
- 产出：HTML + meta.yaml + wiki raw + wiki concepts
