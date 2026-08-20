# 过程文件驱动写卡工作流（2026-07-09 实录）

## 适用场景

用户提供了完整调研过程记录文件（路径格式 `/tmp/infocard-process-YYYYMMDD-HHMMSS.md`），
且明确说"只写 HTML + meta + wiki 草稿，**不做 build/commit/push**"。

## 完整工作流

```
用户 → /tmp/infocard-process-YYYYMMDD-HHMMSS.md + "不做 build/commit/push"
  → 读取过程文件，提取核验结论
  → 主线程直接写 3 个文件：
    1. docs/<slug>.html          （darkblue 主题，适合工具/开源/Agent 类）
    2. docs/<slug>.html.meta.yaml
    3. wiki/raw/articles/<date>-infocard-<slug>.md   （WIKI_PATH 根）
    4. wiki/concepts/<slug>.md   （WIKI_PATH 根）
  → 验证文件落盘（ls -lh）
  → 不执行 build / commit / push
```

## 过程文件结构解析

典型过程文件包含以下节：

| 节 | 内容 | 用在 HTML 的 |
|----|------|-------------|
| `## 1. 仓库定位` | repo 名、stars、语言、许可证 | hero 右侧 visual-grid |
| `## 2. 核验结果` | ✅/⚠ 各能力项 | shell 面板 / compare |
| `## 3. 项目结构` | 目录树 | card → Project Structure |
| `## 4. 技术栈汇总` | 技术选型表 | shell Tech Stack panel |
| `## 5. 遇到的问题` | 已知局限 | compare bad 侧 |
| 过程元信息行 | 调研时间、目标 | footer meta |

## 主题选择规则

| 内容类型 | 推荐主题 | CSS class 前缀 |
|----------|----------|---------------|
| 工具 / 开源项目 / Agent | darkblue | infocard-darkblue-style |
| 技术方法论 / 框架 | blue-technical-manual | infocard-blue-technical-manual-style |
| 开源图鉴 / CLI 集合 | redswiss | infocard-redswiss-style |

过程文件中若有"贾维斯风格"、"Tony Stark IP"、"深夜工作台"等关键词 → 强制选 **darkblue**。

## HTML 模板填充检查清单

- [ ] `<title>` 与 `meta description` 一致
- [ ] `hero-copy` killer-row: kicker（来源标签）+ source（GitHub URL）
- [ ] `hero-visual` orb 放项目名缩写（2字母）
- [ ] `visual-grid` 4 张 mini-card：stars / platform / LLM / voice
- [ ] `shell` 3 panels: Downloads / MCP Tools（2列 grid）/ Tech Stack
- [ ] `grid3` 3 cards：Architecture / Persona / Project Structure
- [ ] `code-block` quick start 命令
- [ ] `compare` bad + good 对照
- [ ] `download` 按钮：官方下载页 + GitHub
- [ ] `footer` brand + links + meta
- [ ] html2canvas 引入 + Ctrl+Shift+S 保存
- [ ] `@media print` / `@media (max-width:720px)` 响应式

## meta.yaml 规范

```yaml
slug: 20260709-<slug>
path: docs/<slug>.html
title: <标题>
desc: <单行纯文本，不含换行符>
date: 'YYYY-MM-DD HH:MM:SS'   # 来自过程文件元信息
updated: 'YYYY-MM-DD HH:MM:SS'
tags: [项目名, 技术栈关键词, AI, ...]
category: knowledge           # 工具/开源类默认 knowledge
source: github
source_url: https://github.com/<owner>/<repo>
author: <owner>
style: infocard-darkblue-style  # 与 HTML 主题一致
taxonomy:
  domains: [AI / LLM, ...]
  tool_types: [AI 助手, MCP 工具集]
  stages: [使用 / 运行]
  interaction: [语音, 命令行]
  content_type: [工具介绍, 开源项目]
  source: [GitHub]
  style: [darkblue]
  risk: [低风险]
version: 1.0.0
```

**desc 必须是单行纯文本**，不允许换行符。若过程文件 desc 为多行，先压缩成一行。

## Wiki 同步路径（基于 WIKI_PATH env）

```
WIKI_PATH = ~/hehome/hermes-data/home/wiki

raw:       WIKI_PATH/raw/articles/<date>-infocard-<slug>.md
concept:   WIKI_PATH/concepts/<slug>.md
entity:    WIKI_PATH/entities/<slug>.md   （人物/事件类）
```

**不要**写到 `~/wiki/` 或不含 `hermes-data/home/wiki` 的路径。

## 不做 build/commit/push 时的产出验证

```bash
# 验证 4 个文件全部落盘
ls -lh docs/<slug>.html docs/<slug>.html.meta.yaml \
  ~/hehome/hermes-data/home/wiki/raw/articles/<date>-infocard-<slug>.md \
  ~/hehome/hermes-data/home/wiki/concepts/<slug>.md
```

验证通过后报告：文件路径 + 文件大小 + 无 build/commit/push 提示。
