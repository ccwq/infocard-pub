# Superlog 技术分享卡复盘

## 结论
Superlog 是开源 agentic telemetry 系统，核心卖点是"可观测性 + AI Agent → 自愈闭环"。它不只是又一个日志看板，而是把 telemetry 数据（traces/logs/metrics）变成 Agent 可执行的诊断和修复动作。Y Combinator P26 项目，Apache 2.0，open-core 模型。

## 取材依据
- GitHub API：716 stars, TypeScript, Apache 2.0, topics: ai, llm, observability, opentelemetry, react, self-hosted, skills, typescript
- README 定位：open-source agentic telemetry system；ingests traces, logs, metrics; groups noisy signals into incidents; AI agent watches infra while you sleep
- Quick Start：Node.js 20+, pnpm 9+, Docker；`docker compose up -d` + `db:migrate` + `pnpm dev`
- 本地服务：Web localhost:5173, API localhost:4100, OTLP localhost:4101
- 安装方式：`npx skills add superloglabs/skills --all`（支持 coding agent 一键安装）
- Open-core：社区版完全开源（Apache 2.0），Cloud 版为可选托管服务
- Monorepo：apps/web(Vite/React), apps/api, apps/proxy(OTLP), apps/worker, packages/db(Drizzle), packages/fingerprint

## 卡片结构
1. 核心定位：agentic observability vs 传统日志看板
2. 技术架构：monorepo + OTLP + ClickHouse + Postgres
3. 安装与入口：skills 机制 / Docker / 源码
4. Quick Start：三步起量
5. Open-core 模型：社区版 vs Cloud 版
6. 适合 / 不适合

## 风格判断
- 采用蓝技手册风格（与 Obscura 同风格系）
- Hero 用 YC P26 badge 作为视觉锚点
- 架构图展示 telemetry → Superlog Core → Agent Runner 的三段流
- 重点强调"自愈闭环"而非"数据可视化"

## 来源链接
https://github.com/superloglabs/superlog