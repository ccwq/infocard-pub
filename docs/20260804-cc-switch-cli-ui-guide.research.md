# CC Switch 信息卡研究底稿

本卡对象：`farion1231/cc-switch`（产品名 CC Switch），不是其他同名 `ccswitch` 仓库，也不是后续待研究的 `BigStrongSun/ccswitchmulti`。

## 冻结结论

- CC Switch 是 Tauri 2 跨平台桌面应用：React/TypeScript 前端 + Rust 后端，管理 Claude Code、Claude Desktop、Codex、Gemini CLI、Grok Build、OpenCode、OpenClaw、Hermes Agent 的配置。
- 官方公开资料未证明存在供用户使用的独立 `ccswitch switch <provider>` CLI。它的操作面是主窗口、系统托盘与 Deep Link；被管理的 Claude/Codex/Gemini 等才是 CLI。
- 数据库 `~/.cc-switch/cc-switch.db` 是 SSOT；切换时写入每个客户端的 JSON/TOML/YAML/.env live 配置；编辑当前 provider 时支持从 live config 回填。
- 默认非路由模式多数客户端需重启；本地路由模式将 Claude/Codex/Gemini 指向 `127.0.0.1:15721`，随后通过 UI/托盘切换 provider 可无需重启 CLI。
- 通用 Provider 明确覆盖 Claude Code、Codex、Gemini CLI；不可扩大为所有八个工具。
- Hermes 适配仅可写 `custom_providers`，并更新 `model.provider` / `model.default`；`providers:` 字典中的条目为只读边界。

## 来源

1. README：https://github.com/farion1231/cc-switch/blob/main/README.md
2. UI 手册：https://github.com/farion1231/cc-switch/blob/main/docs/user-manual/zh/1-getting-started/1.3-interface.md
3. Provider / Codex 映射：https://github.com/farion1231/cc-switch/blob/main/docs/user-manual/zh/2-providers/2.1-add.md
4. Routing：https://github.com/farion1231/cc-switch/blob/main/docs/user-manual/zh/4-proxy/4.2-routing.md
5. 配置文件：https://github.com/farion1231/cc-switch/blob/main/docs/user-manual/zh/5-faq/5.1-config-files.md
6. Hermes adapter：https://github.com/farion1231/cc-switch/blob/main/src-tauri/src/hermes_config.rs
7. 最新版本元数据：https://api.github.com/repos/farion1231/cc-switch/releases/latest

详细逐条摘录、来源等级和反混淆表见本次研究包：`/tmp/infocard-runs/ccswitch-cards/research/ccswitch-cli-ui.md`、`ccswitch-architecture.md`。
