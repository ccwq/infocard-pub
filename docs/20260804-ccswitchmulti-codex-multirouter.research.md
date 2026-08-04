# CCSwitchMulti 信息卡研究底稿

对象：`BigStrongSun/ccswitchmulti`，不是 `farion1231/cc-switch`。

## 冻结结论

- CCSwitchMulti 是 Tauri 桌面控制面；核心差异是 Codex MultiRouter：Codex 保持连接本机代理，路由器按请求体 `model` 选择官方 OAuth、第三方兼容 API 或本地模型源。
- 官方登录缓存放在 `~/.codex/auth.json`；第三方 endpoint、model_provider 与 scoped token 进入 `~/.codex/config.toml`。保留官方账号显示或登录态，不等于第三方请求使用 OpenAI 订阅额度：第三方请求按第三方 API Key、账单和政策处理。
- MultiRouter 是按模型分流，不是跨模型故障转移池：官方 `gpt-*` 出错不能静默降级为 DeepSeek/Qwen。
- 原生 Responses 上游可直连；Chat / Messages / Anthropic 类上游按需由本地 router 转换 Responses、SSE、reasoning、tool calls。DeepSeek 新预设在 v3.19.1 后可直连 Responses；不能泛化为所有 DeepSeek 必须转换。
- Qwen、vLLM、Ollama 等是可配置模型源，不随应用安装或托管。外部 OpenAI-compatible sidecar 默认是 127.0.0.1:15722，与 Codex takeover 默认 15721 分离。
- 路由器可配置非 loopback 监听，入站请求是不可信输入；不要暴露 auth.json/API Key，也不应把 OAuth reverse proxy 描述为无账号/条款风险。

## 对比锚点：CC Switch

- 两者均为 Tauri GUI/托盘而非用户切换 CLI，均有 SQLite SSOT / live-config 投影。
- CC Switch 的主轴是多客户端配置管理；CCSwitchMulti 的增量在 Codex 的模型级路由、官方登录态保留、独立 external OpenAI-compatible sidecar 和多协议路由 schema。
- 不要将 CCSwitchMulti 的 MultiRouter/OAuth/sidecar 归给 CC Switch；也不要把 CC Switch 的 Hermes 特性当作本卡 MultiRouter 功能。

## 核心一手来源

1. https://github.com/BigStrongSun/ccswitchmulti
2. https://raw.githubusercontent.com/BigStrongSun/ccswitchmulti/main/README_ZH.md
3. https://raw.githubusercontent.com/BigStrongSun/ccswitchmulti/main/docs/guides/codex-local-model-routing-design.md
4. https://raw.githubusercontent.com/BigStrongSun/ccswitchmulti/main/docs/guides/codex-official-auth-preservation-guide-zh.md
5. https://raw.githubusercontent.com/BigStrongSun/ccswitchmulti/main/docs/guides/codex-deepseek-routing-guide-zh.md
6. https://raw.githubusercontent.com/BigStrongSun/ccswitchmulti/main/src-tauri/src/proxy/providers/codex.rs
7. https://raw.githubusercontent.com/BigStrongSun/ccswitchmulti/main/SECURITY.md

完整逐条证据见：`/tmp/infocard-runs/ccswitchmulti-cards/research/ccswitchmulti-core.md` 与 `ccswitchmulti-vs-ccswitch.md`。
