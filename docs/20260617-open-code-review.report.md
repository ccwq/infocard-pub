# Open Code Review 信息卡采集报告

- Source: https://github.com/alibaba/open-code-review
- Card: `docs/20260617-open-code-review.html`
- Meta: `docs/20260617-open-code-review.html.meta.yaml`
- Theme: darkgreen（用户要求随机主题，本次选择深绿色监控工作台风格）

## 已核实事实

采集方式：通过 CDP 浏览器读取 GitHub 仓库页面和 README 可见内容。

- 仓库：`alibaba/open-code-review`
- GitHub 标题描述：Open-source & free；battle-tested at Alibaba's scale；hybrid architecture code review tool；deterministic pipelines + LLM Agent；precise line-level comments；built-in fine-tuned ruleset (NPE, thread-safety, XSS, SQL injection)；OpenAI & Anthropic compatible。
- Stars：7.4k
- Forks：446
- Watchers：25
- Issues：20
- Pull requests：20
- Branches：3
- Tags：55
- Commits：141
- Latest visible release：v1.3.13
- License：Apache-2.0
- Topics：agent、code-review、harness、repository-level-context、code-review-assistant
- Language distribution：Go 76.3%、TypeScript 13.1%、JavaScript 3.3%、CSS 3.1%、Shell 2.0%、HTML 1.8%、Makefile 0.4%。
- 根目录可见结构：`.claude-plugin`, `.claude/commands`, `.github`, `bin`, `cmd`, `examples`, `imgs`, `internal`, `pages`, `plugins/open-code-review`, `scripts`, `skills/open-code-review`, 多语言 README/CONTRIBUTING, `go.mod`, `package.json` 等。

## README 核心信息

- Open Code Review 是 AI-powered code review CLI tool。
- 起源于 Alibaba Group internal official AI code review assistant，过去两年服务 tens of thousands of developers，identified millions of code defects。
- 工作方式：读取 Git diffs，把 changed files 交给带 tool-use capabilities 的 configurable LLM agent，生成 line-level precision 的 structured review comments。
- Agent 能读取 full file contents、search codebase、inspect other changed files for context。
- 通用 agent review 痛点：Incomplete coverage、Position drift、Unstable quality。
- 核心设计：Deterministic Engineering × Agent Hybrid。
- 确定性工程负责：precise file selection、smart file bundling、fine-grained rule matching、external positioning and reflection modules。
- Agent 负责：scenario-tuned prompts、scenario-tuned toolset、dynamic decisions and context retrieval。
- 安装：`npm install -g @alibaba-group/open-code-review` 或 GitHub Release binary 或源码构建。
- 配置：`ocr config provider`、`ocr config model`、`ocr llm test`。
- 审查模式：workspace、branch range、single commit。
- Agent 集成：skills registry、Claude Code plugin、Codex plugin、直接复制 command file。
- CI/CD：`ocr review --from origin/main --to <commit_sha> --format json`。
- viewer：`ocr viewer`，默认 localhost:5483，并有 Host-header allowlist 安全说明。

## 限制

- 本轮未下载仓库图片；卡片使用自绘 SVG 架构图和 CSS 面板表达。
- GitHub 页面数值会随时间变化，本报告记录的是采集时可见值。
