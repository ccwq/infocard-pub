# Color Material Theme Guide

## Design intent

Color Material 是一种高密度材料面板式信息卡风格。它围绕暖色画布、深色中央控制台、彩色能力节点、右侧信息 rail 与底部生命周期组织复杂内容。

它不再限定为单一协议网关主题；可用于技术产品、能力地图、调查复盘、架构说明、证据矩阵等需要“中心对象 + 分区节点 + 信息 rail”的横向海报。

## Core tokens

- Canvas: `#f7f2e8`
- Paper: `#fffdf8`
- Ink: `#0c1220`
- Line: `#111111`
- Purple: `#6e3fd6` — 核心能力 / 主协议 / 主证据
- Green: `#2e9b4b` — 协作链路 / 正向信号 / 可落地项
- Blue: `#2e6be6` — API / 数据 / 系统层
- Orange: `#f59e0b` — 风险 / 高性能通道 / 关键约束
- Yellow note: `#f5d46b` — 便签 / 注释 / 弱提示

## Layout skeleton

1. Top brand bar
2. Big title + subtitle + badges
3. Left access / source / actor panel
4. Central control / synthesis panel
5. Governance / criteria / evidence strip
6. Right capability / evidence / risk mapping
7. Bottom lifecycle / timeline / scenario chain
8. Right dark sidebar with stacked value cards

## Typography

- Title: 48–64px landscape hero; 700–900 weight
- Section heads: 18–22px
- Body: 14–16px
- Micro labels: 10–11px; keep readable on 390px

## Components

- `hero-bar` three-color strip
- `control-panel` dark central synthesis panel
- `capability-card` colorful node boxes
- `criteria-strip` governance / evaluation badges
- `stepper` lifecycle / timeline chain
- `summary-sidebar` stacked feature / conclusion cards
- `sticky-note` note / pin callout

## Mobile rules

- Stack hero and panels under 720px
- Sidebar becomes bottom stack
- Color node cards collapse to 1–2 columns
- Lifecycle becomes vertical
- No horizontal overflow at 390px

## Content fit

Best for:
- Technical product / open-source capability maps
- AI / Agent platform architecture
- Protocol gateway / registry / proxy / control-plane systems
- Investigation cards with many evidence nodes or case clusters
- Product architecture, capability maps, ecosystem diagrams

Not best for:
- paper / hand-crafted / Q-style cards
- black-head investigative posters
- ultra-minimal brand posters

## Registry note

- Standard skill name: `infocard-color-material-style`
- Recommended theme slug: `color-material-style`
- Recommended demo page: `./theme/color-material.html`
- When this style changes, keep `_themes.yaml`, `themes.html`, demo page, and skill description synchronized.
