# Open Design redswiss rebuild report

## 任务锁定

- 目标 URL：https://ccwq.github.io/infocard-pub/docs/20260606-open-design-hardblue.html
- 本地 HTML：`docs/20260606-open-design-hardblue.html`
- 本地 meta：`docs/20260606-open-design-hardblue.html.meta.yaml`
- 风格要求：`infocard-redswiss-style`
- 内容来源：GitHub 最新内容 `https://github.com/nexu-io/open-design`

## 本次重建依据

- GitHub API repo metadata：65.5k stars、7.3k forks、Apache-2.0、main branch、pushed 2026-06-16。
- README 当前重点：Open Design 0.10.0 all-in-one Agentic design workspace；AMR 官方模型服务；100+ skills；150 brand-grade DESIGN.md systems；261 official plugins；22 coding-agent CLIs；HyperFrames；BYOK proxy；MCP stdio server。
- Releases：latest `open-design-v0.10.1`，0.10.0 为 all-in-one Agentic design workspace。
- Tree：8077 repo files / 1958 dirs（GitHub tree recursive snapshot）。

## 结构变化

旧版 hardblue 技术手册结构已替换为 redswiss 从零骨架：

1. Diagonal red/black hero + right-side meta pills
2. Overview：一句话定位 + 新版 README 摘要
3. What changed in the new README
4. Product surface
5. Artifact modes
6. Agent compatibility
7. Ecosystem inventory
8. Architecture
9. Comparison & boundary

## 资产处理

- `repo-assets.open-design.ai` TLS 连接失败，未热链引用。
- 已从 GitHub raw 下载并本地化 4 张 README 截图：
  - `docs/assets/images/20260606-open-design-redswiss/entry-view.png`
  - `docs/assets/images/20260606-open-design-redswiss/mobile-onboarding.png`
  - `docs/assets/images/20260606-open-design-redswiss/live-dashboard.png`
  - `docs/assets/images/20260606-open-design-redswiss/magazine-deck.png`
- 当前 HTML 使用 `entry-view.png` 与 `live-dashboard.png`。

## 边界说明

- Roadmap 中未完成项已明确标注为未完成/alpha，不写成现成功能。
- 继续保留原 slug/path，不因风格变化改 URL。
