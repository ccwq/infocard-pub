# 采集报告：u-ichi/reviewable-html-workbench

## 基础数据（来源：GitHub REST API 2026-06-18）

| 字段 | 值 |
|---|---|
| Stars | 142 |
| Forks | 未公开 |
| Language | Python |
| License | MIT |
| Created | 2026-05-17 |
| Pushed | 2026-06-17 |
| Topics | claude-code, codex-cli, html-review, plugin, python |
| Homepage | — |

## 描述

> Claude Code / Codex CLI plugin for generating reviewable HTML documents with preview, inline review comments, and agent feedback ingestion.

## 文件结构（来源：GitHub API /contents）

- `.agents/` · `.claude-plugin/` · `.claude/` · `.codex-plugin/` · `.codex/` · `.github/`
- `AGENTS.md` (3510) · `CLAUDE.md` (11) · `CODE_OF_CONDUCT.md` · `CONTRIBUTING.md` · `LICENSE` · `README.md` (15031)
- `pyproject.toml` (339) · `.gitignore` (346)
- `bin/` · `docs/` · `plugins/` · `schemas/` · `scripts/` · `skills/` · `templates/` · `tests/`

## 3 Skills（来源：GitHub API /contents/skills）

1. `plan-preview` — Plan Mode 提案临时 HTML 预览 URL
2. `reviewable-design-doc` — 构建可直接评审的设计文档
3. `visual-html-renderer` — 结构化数据 → 可评审视觉 HTML

## README 核心工作流（来源：README.md）

1. Agent 生成 HTML 文档包（结构化章节 + 图片）
2. 打开预览，选中任意文字或图片添加评论
3. Agent 读取评论，分类（actionable / clarification / already addressed），写回复
4. Agent 更新文档，重新渲染
5. 导出单个自包含 HTML（无评审 UI，CSS/图片内嵌，自动检测 OS 主题）

## 核心特性（来源：README.md）

- Inline Review Comments：选中文字/图片，评论高亮，状态/回复/线程显示在侧边栏
- Automatic Agent Replies：Agent 读取选中内容和上下文，写回复进同一线程
- Resolution-Gated Updates：澄清线程保留在文档中，解决后才允许更新
- Plan Preview URLs：Agent 可在计划文本中嵌入临时 Reviewable HTML Workbench URL
- Review Ingestion：评论四分类（actionable / clarification / already addressed / related）
- Publish & Download：干净阅读视图 + 单文件导出（自动检测 OS light/dark）
- Document Model：Schema 驱动输入，输出 `index.html` + manifest + 资产
- Preview Server：优先 Tailscale IPv4，拒绝 `0.0.0.0` 绑定
- Dark/Light Theme：渲染文档支持浏览器端主题切换
- Diagram + Image Support：存储 Mermaid 源，渲染降级图

## 安装命令（来源：README.md）

```bash
claude plugin marketplace add u-ichi/reviewable-html-workbench
claude plugin install reviewable-html-workbench

# 或 Clone 后安装
git clone https://github.com/u-ichi/reviewable-html-workbench.git
claude plugin install ./reviewable-html-workbench
```

## 定位洞察

- 不同于纯聊天反馈：评论锚定到文档精确位置，跨迭代不丢失
- 不同于传统文档工具：Agent 直接读取评论并修改文档本身
- 不同于截图对比：Schema 驱动输出，HTML 可程序消费
- 定位人群：需要 Agent 生成报告/设计稿的开发者，有评审协作需求的技术团队
