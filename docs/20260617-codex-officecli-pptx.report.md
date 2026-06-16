# Codex + OfficeCLI 信息卡发布报告

- slug: `20260617-codex-officecli-pptx`
- style: `infocard-blue-technical-manual-style`
- created_at: `2026-06-17 06:36:55` Asia/Shanghai
- primary source: https://github.com/officecli/officecli
- supporting source: https://github.com/openai/codex
- npm: https://www.npmjs.com/package/officecli, https://www.npmjs.com/package/@openai/codex

## 核心结论

Codex + OfficeCLI 的价值不应表述为“秒杀一切 AI”，而应表述为：AI Agent 到可编辑 Office 交付物的链路被打通。Codex 负责理解任务、拆解动作、调用命令；OfficeCLI 负责生成 PPTX、DOCX、XLSX、workbook-backed Report 和 img 等真实文件。

## 证据快照

- `officecli/officecli` GitHub 描述：AI document generation CLI for PPTX, DOCX, XLSX, Reports, and Images。
- OfficeCLI README：可从终端、脚本、CI、本地自动化流程生成可编辑 Office 文件；支持 hosted trial 和 External Mode。
- OfficeCLI 中文 README 命令示例：`officecli new pptx "Q3 Business Review" --prompt "..."`。
- npm `officecli`：最新查到 `0.2.106`，提供 `officecli` / `officecli-dev` bin。
- `openai/codex` GitHub：Lightweight coding agent that runs in your terminal；约 91K stars。
- npm `@openai/codex`：最新查到 `0.140.0`。

## 表达边界

- 可说：它把 Agent 写 PPT 从“内容生成”推进到“可编辑文件交付”。
- 可说：很多只生成大纲、网页或截图的 AI PPT 工具在这个维度会被压缩。
- 不宜说：秒杀一切 AI、全面替代 Gamma / Canva / PowerPoint Copilot。
- 风险：OfficeCLI binary 分发、hosted trial / external mode、设计质量、企业协作和模板生态仍需独立验证。

## 交付文件

- HTML: `docs/20260617-codex-officecli-pptx.html`
- Meta: `docs/20260617-codex-officecli-pptx.html.meta.yaml`
- Report: `docs/20260617-codex-officecli-pptx.report.md`
