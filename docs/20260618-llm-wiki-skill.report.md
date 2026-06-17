# LLM Wiki Skill 信息卡采集报告

- Source: https://hermes-agent.nousresearch.com/docs/user-guide/skills/bundled/research/research-llm-wiki
- Card: `docs/20260618-llm-wiki-skill.html`
- Meta: `docs/20260618-llm-wiki-skill.html.meta.yaml`
- Theme: infocard-white-purple-style

## 信息来源

hermes-agent.nousresearch.com/docs 直接访问被 TLS 阻断。内容基于：
1. Hermes Agent 内置 skill 文件：`skills/research/llm-wiki/SKILL.md`（本地已安装）
2. Web 搜索：CSDN 博客《Hermes Agent LLM Wiki 技术应用》

## 已核实内容

- Skill 名：research-llm-wiki（bundled research skill）
- 来源：Hermes Agent 官方文档
- 核心概念：Karpathy's LLM Wiki 模式，替代 RAG
- 三层架构：Raw Sources / Wiki Pages / Schema Config
- 三个操作：Ingest / Query / Lint
- 关键约定：raw/ 只读不写、sha256 drift 检测、wikilink 交叉引用
- 与记忆/skill 的边界：memory=偏好、skill=流程、wiki=知识网络

## 卡片叙事

- 主题：infocard-white-purple-style（白紫轻科技工作台风）
- 视觉重点：白底、紫色强调、三层架构图、三操作流程图
- 叙事主线：LLM Wiki 是 RAG 的替代方案；知识一次性整理进 Wiki，后续直接引用，矛盾在摄入时标记

## 限制说明

hermes-agent.nousresearch.com 直接访问被 TLS 阻断，详情页内容基于本地 skill 文件和公开搜索结果整理。
