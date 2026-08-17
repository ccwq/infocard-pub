# livid/exe 信息卡研究报告

## 结论

`livid/exe` 是一个面向个人使用的 VM cloud / harness：当前 `main` 以 macOS Virtualization.framework 为核心，用单个 Go 二进制管理持久 Debian 13 arm64 VM、Web/API、SSH gate、Ollama VM Agent、ChatGPT/Codex OAuth Chat 窗口以及 Cloudflare Tunnel 发布。

## 证据边界

- L1：官方 README、当前 `main` 源码、GitHub API。
- L3：作者 X Article 文章快照（71 likes、6 retweets、8 replies、13,897 views、92 bookmarks），只用于定位与语境，不替代仓库事实。
- 旧 `master` 的 Linux Firecracker / Windows QEMU-WHPX 证据被限定为历史文档/源码，不表述为当前 `main` 的无条件能力。

## 核心事实

- Web/API 默认 `127.0.0.1:7777`；SSH gate 默认 `:2222`；reverse proxy 默认 `:8090`。
- VM Agent 使用 Ollama；Chat 窗口另有 ChatGPT subscription / Codex OAuth backend，不能混写成 VM Agent 使用 Codex subscription。
- Workspace、Mesh、Notes/Todo app-data 可在配对节点间同步，并有签名、路径、容量与冲突约束。
- Cloudflare Tunnel 需要 remotely-managed tunnel 与指定权限；`unexpose` 当前不会完整清理 DNS/ingress。
- 当前仓库没有发现根许可证声明；GitHub license 为 null；Releases 与 tags 为空。

## 主题记录

- content_shape：AI harness / personal software / system architecture
- theme_primary：darkblue
- theme_fallback：wood
- theme_reject：hardblue（非单一 CLI 手册）；redswiss（非多工具图鉴）
- 真实主题签名：深蓝渐变背景、`--cyan/#58c3ff`、`--blue/#4a78ff`、`--purple/#8459ff` token；渐变 hero bar；玻璃面板；orb；status chips；workbench shell。

## 来源

1. https://github.com/livid/exe
2. https://raw.githubusercontent.com/livid/exe/main/README.md
3. https://github.com/livid/exe/blob/main/internal/vmm/manager_darwin.go
4. https://github.com/livid/exe/blob/main/internal/agent/agent.go
5. https://github.com/livid/exe/blob/main/internal/peer/engine.go
6. X Article（文章入口；文章 ID 与互动快照记录于事实包）
