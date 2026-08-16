# Obsidian Skills 更新研究报告

- **对象**：`kepano/obsidian-skills`
- **旧卡**：`docs/20260624-obsidian-skills.html`（原地更新，不新建重复卡）
- **研究日期**：2026-08-17
- **主题**：`hardblue`；沿用暖灰 42px 网格、黑色 3px 边框、红/蓝/黑 hero-bar、96px 编号块。

## 官方事实（Research A）

主来源：

1. GitHub 仓库：https://github.com/kepano/obsidian-skills
2. README（main）：https://raw.githubusercontent.com/kepano/obsidian-skills/main/README.md
3. GitHub API：https://api.github.com/repos/kepano/obsidian-skills
4. Agent Skills 规范：https://agentskills.io/specification

README 明确列出五类 skill：`obsidian-markdown`、`obsidian-bases`、`json-canvas`、`obsidian-cli`、`defuddle`；并给出 Marketplace、`npx skills`、Claude Code、Codex、OpenCode 的安装方式。README 明确说这些 skill 遵循 Agent Skills specification，可被 Claude Code、Codex、Open Code 等兼容 agent 使用。

GitHub API 动态快照（抓取于 2026-08-17）：

- stars：46,371
- forks：3,325
- license：MIT
- default branch：`main`
- repository updated_at：2026-08-16T21:12:47Z
- latest `main` commit：`a1dc48e68138490d522c04cbf5822214c6eb1202`
- latest commit date：2026-06-08T16:12:01Z

> Stars/forks 是动态指标，仅代表抓取时快照；不能视为永久值。

## 五类 skill 边界

- **obsidian-markdown**：Obsidian Flavored Markdown（`.md`），包括 wikilinks、embeds、callouts、properties 等专有语法。
- **obsidian-bases**：Obsidian Bases（`.base`），包括 views、filters、formulas、summaries。
- **json-canvas**：JSON Canvas（`.canvas`），包括 nodes、edges、groups、connections。
- **obsidian-cli**：通过 Obsidian CLI 操作 vault，并覆盖 plugin/theme development 场景。
- **defuddle**：用 Defuddle CLI 从网页抽取干净 Markdown，移除 clutter 以节省 tokens；其官方 skill 文本建议标准网页优先使用，`.md` URL 直接读取即可。

## 安装与使用

- Marketplace：`/plugin marketplace add kepano/obsidian-skills` 后执行 `/plugin install obsidian@obsidian-skills`。
- 通用 CLI：`npx skills add https://github.com/kepano/obsidian-skills`。
- Claude Code：把仓库内容放入 Obsidian vault 根目录的 `/.claude`（或当前 Claude Code 项目目录）。
- Codex：把 `skills/` 复制到通常的 `~/.codex/skills`。
- OpenCode：clone 整个仓库到 `~/.opencode/skills/obsidian-skills`；不要只复制内层 `skills/`，重启后自动发现，无需修改 `opencode.json`。
- Hermes Agent：本仓库没有 Hermes 专用安装器；Hermes 可按自身 skill discovery 规则加载包含 `SKILL.md` 的 skill。使用前应确认当前 Hermes 配置的 skill 路径，并把五类目录放入该路径；不要把“兼容 Agent Skills 规范”误写成“仓库提供 Hermes 原生插件”。

## X 来源快照（Research B / provenance）

- source URL：`https://x.com/i/status/2088081549803573601`
- meta 中记录的作者：AI超元域（`@AISuperDomain`）
- status id：`2088081549803573601`
- 本次更新的事实主线以 GitHub README/API 为准；X 作为发现与传播来源保留，不用 X 的点赞、转发或未复核描述推导 stars、skill 数量和兼容性。
- 访问边界：本次工作未把登录墙或搜索摘要当作 X 正文证据；无法独立复核的社交平台细节不升级为官方事实。

## Hermes 与 Agent 兼容结论

兼容性的可核查基础是仓库 README 对 Agent Skills specification 的声明，以及五个目录内的 `SKILL.md` 文件形态。Hermes 侧应按本地版本的 skills discovery 配置加载；具体可用命令、作用域和优先级以 Hermes 官方文档与当前配置为准。卡片只承诺“可作为规范化 SKILL.md 资源接入”，不承诺 Hermes 自动安装、自动授予 vault 写权限或自动启用 Obsidian CLI。

## 研究限制

- stars/forks、仓库更新时间会变化，卡片正文标为抓取时快照。
- GitHub API 的 `pushed_at` 与最新 commit 时间可能因仓库元数据刷新而不同；卡片采用 API 与 commit 两层记录，不把它们混为同一字段。
- 本卡不执行任何本地 Obsidian vault 写操作、不安装 npm 包、不配置 Hermes。
