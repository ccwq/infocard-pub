# OpenBB 信息卡发布报告

- 主题决策：redswiss；形态：多数据域平台 / 数据集成工作台。
- 查重：未发现同项目卡，新建 `openbb-data-platform`。
- 事实锚点：官方 GitHub/README/LICENSE；ODP v4.7.0（2026-03-09）；ODP Desktop v1.0.2；动态快照 71,882 stars / 7,402 forks；AGPLv3。
- 关键边界：provider 可能分别要求 key、协议、付费；OpenBB 不保证所有数据免费。X 链接只作为 L3 快照。
- 结构签名：hero → stats → domain-grid → route-grid → warning/table → source。
- token 签名：`--red #c8102e`, `--ink #0a0a0a`, `--bg #f5f2ec`。
- 视觉门禁：目标 390x844 与 1440x900；每个区域需记录 critical / major / minor。
- 当前状态：VISUAL_PENDING。源码 HTTP 200 已确认；既有 5588 端口占用导致标准 live-server 路径返回旧树，临时 5597 源码服务 HTTP 200，但两次独立 Chrome headless 截图均超时，未获得当前卡的真实渲染证据。因此按门禁规则不 push。
