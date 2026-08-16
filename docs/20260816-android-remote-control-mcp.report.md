# Android Remote Control MCP 研究报告

## 主题与主题决策

- **Content shape**：单一技术工具 / Android Agent 操作手册
- **Theme primary**：`hardblue`
- **Theme fallback**：`blue-technical-manual`
- **Theme reject**：`redswiss`（多工具对比/工具目录），`darkblue`（架构叙事为中心），`q-style`（轻量纸感教程）
- **Implementation check**：HTML 使用 `data-theme="hardblue"`；正式 hardblue token：`--bg:#f6f4ef`、`--paper:#fffdf8`、`--ink:#111`、`--blue:#1f63ff`、`--red:#d80018`；结构签名含 42px 网格、三色 `hero-bar`、3px 黑边、96px 编号块、matrix/risk 模块。

## 事实边界

本报告仅依据已完成的 Android Remote Control MCP 官方事实包及其指定来源整理，未执行本地安装、Android 设备连接或 MCP 调用实测。正文将事实分为：

- **L1 官方项目事实**：仓库身份、版本、许可证、技术栈、Android 版本要求、权限/服务要求、部署拓扑与配置字段。
- **L2 可复现实测**：本卡不声称存在本地运行实测；因此不写吞吐、延迟或成功率。
- **L3 社区/原帖快照**：原帖作者与互动快照仅作为发现背景；“57 tools”与 UI 树规模按事实包标注为 L3/L2，不能当作本地验证结果。

## 核心事实包

- 项目：`danielealbano/android-remote-control-mcp`
- 最新稳定版：`v1.11.1`，发布于 `2026-08-14 21:06 UTC`
- GitHub 快照：329 stars / 50 forks；MIT 许可证
- 技术栈：Kotlin / Python / TypeScript
- Release APK：FOSS `175,919,916 bytes`；GMS `176,921,611 bytes`
- 系统边界：Android 13+
- 必需能力：Accessibility Service
- 可选能力：camera、microphone、location、notifications、storage
- 运行拓扑：MCP Server 在手机/模拟器上运行
- 连接配置：IP / port / token
- 连接方式：LAN、Android emulator、官方 Remote Access Tunnel
- 仓库附带 Claude Code plugin
- 原帖作者：LawrenceW_Zen；快照 99 likes / 16 retweets / 9 replies / 12,991 views / 186 bookmarks
- 事实边界：原帖中的“57 tools”和 UI 树约 4000 字符 / 1000 tokens 标注为 L3/L2；未做本地运行实测

## 读者操作路径

1. 确认 Android 13+ 与目标设备/模拟器。
2. 选择 FOSS 或 GMS APK，并核对版本与文件大小。
3. 安装后开启 Accessibility Service；摄像头、麦克风、定位、通知、存储按需授权。
4. 让 MCP Server 在手机或模拟器上运行。
5. 在 Agent 端配置手机 IP、服务端口与 token。
6. 优先从 LAN 或 Android emulator 验证；跨网络时再考虑官方 Remote Access Tunnel。
7. 把能力边界与安全风险写进 Agent 工作流：Accessibility 权限意味着 UI 操作能力，token 与网络暴露必须最小化。

## 未核验与不应过度推断

- 本卡不声称在本机、真机或模拟器上成功安装或调用。
- 不把“57 tools”写成经过本地验证的精确工具清单。
- 不把 UI 树约 4000 字符 / 1000 tokens 写成稳定性能指标。
- 不推断可选权限一定全部启用；实际授权取决于用户场景。
- 不把 Remote Access Tunnel 与普通 LAN 连接混为同一网络条件。

## 来源

- GitHub repository: https://github.com/danielealbano/android-remote-control-mcp
- GitHub releases: https://github.com/danielealbano/android-remote-control-mcp/releases
- Research handoff: Android Remote Control MCP 官方事实包（本任务上下文提供）

## 发布验收记录

- Local preview: `http://127.0.0.1:4173/docs/20260816-android-remote-control-mcp.html?preview=20260816` → HTTP 200; URL/title/readyState verified (`complete`).
- CDP: existing Chrome `9222`, agent-browser `0.34.0`; viewport screenshots captured at `390x844` and `1440x900`.
- Visual review: **VISUAL_PENDING**. Mobile screenshot review found no critical issue; major: first viewport clips the next section at the viewport boundary and metadata tags wrap with a lone GMS row. Desktop review found no critical/major issue, minor: viewport naturally clips the long page below the fold. No visual PASS claimed.
- Static gates: `npm run build` passed (repository emitted historical slug warnings); `npm run verify` passed (`784 cards`); `npm run verify-taxonomy` skipped changed-card audit because no base ref was available; `node scripts/check-info-leak.js docs/20260816-android-remote-control-mcp.html` passed (`0 issue(s)`).

报告更新时间：2026-08-16 UTC
