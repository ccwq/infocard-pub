---
name: infocard-color-material-style
description: |
  Color Material 风格信息卡主题。用于高密度信息卡的暖底画布、深色核心面板、彩色节点与右侧信息 rail 的版式管理与视觉规范说明。
  视觉特征：暖米纸画布、深色中央控制台、左右分栏、协议/能力彩色节点、底部生命周期、右侧深色卖点栏、少量便签/印章感标注。
---

# infocard-color-material-style · Color Material 风

## 主题定位

这是一套面向 **高密度技术产品、调查复盘、能力地图与架构说明** 的信息卡主题。
它适合把“中心控制台、能力分区、彩色节点、右侧信息 rail、底部生命周期”这一类复杂信息，组织成一张**横向架构 / 材料面板式海报**：

- 左侧：客户端 / 应用 / 接入端
- 中央：网关 / 控制平面 / 治理核心
- 右侧：协议 / 能力 / 来源 / 证据 / 组件等彩色节点
- 底部：生命周期 / 场景 / 治理能力
- 最右：卖点摘要 / 社区数据 / 生态能力

## 主题注册

- 该主题的新标准名为 `infocard-color-material-style`。
- 推荐主题 slug：`color-material-style`。
- 推荐主题预览页：`./theme/color-material.html`。
- 新建或改名时，必须同步 `_themes.yaml`、`themes.html`、主题演示页与 skill 说明。
- 细节见 `references/color-material-theme-guide.md`。
- Plannotator / plan-review pattern notes: `references/plannotator-plan-review-notes.md`。
- 重建范式与文字对比修正记录见 `references/freelancer-flexjob-color-material-rebuild.md`。

## 触发条件

当用户输入包含以下任一语义时，优先考虑这个主题：

- Color Material / color material / 彩色材料风 / 材料面板风
- 中央控制台、右侧信息 rail、彩色节点、能力地图
- AI Gateway / gateway / registry / proxy / control plane
- MCP、A2A、REST、gRPC 的统一接入
- tools、agents、protocol federation、plugin ecosystem
- centralized governance、discovery、guardrails、observability
- 企业级 AI 平台 / 协议转换 / 路由 / 统一入口
- 调查复盘、能力地图、架构总览、协议接入图、产品方案海报
- plan review / review control plane / annotate → review → feedback → share

## 主题气质

- 企业级
- 工程化
- 秩序感强
- 多协议联邦
- 安全治理优先
- 适合 landscape 版式
- 不是极简 UI，也不是插画海报

## 视觉 DNA

### 1) 画布
- 暖米白 / 浅沙色背景
- 大面积留白但不空
- 可加细网格纹理或极轻纸纹

### 2) 核心控制台
- 中央深色大面板
- 作为整张图的“网关心脏”
- 内部用 6 个功能 tile 或 2×3 模块组织能力

### 3) 协议彩色系统
- 紫：核心能力 / 主协议 / 主证据
- 绿：协作链路 / 正向信号 / 可落地项
- 蓝：API / 数据 / 系统层
- 橙：风险 / 高性能通道 / 关键约束
- 黑：主控制台 / 高优先级摘要

### 4) 卡片语言
- 圆角卡片
- 2px~3px 边框
- 轻阴影
- 图标 + 短标签 + 一句功能描述

### 5) 手工感标注
- 便签纸
- 印章/stamp
- 小标签条
- 少量手写风辅助线

## 推荐版式骨架

1. **Top-left brand bar**
   - 仓库名 / 产品名 / 主题名

2. **Main title block**
   - 大标题 + 中文副标题 + 一句话价值主张

3. **Left access panel**
   - AI 助手 / 开发者应用 / CLI / SDK / 第三方系统

4. **Center gateway panel**
   - guardrails
   - discovery
   - registry
   - routing
   - proxy
   - plugin management

5. **Governance strip**
   - authentication / RBAC / audit / rate limit / observability

6. **Right capability mapping**
   - 协议 / 能力 / 证据 / 风险 / 组件
   - 每类下放典型节点或服务类型

7. **Bottom lifecycle / scenarios**
   - 请求生命周期
   - 典型场景
   - 企业落地方式

8. **Right sidebar / summary column**
   - 5 个卖点卡片
   - GitHub stars / release / community data
   - “一切能力皆可接入，一切调用皆可治理” 这种结论句

## 设计 token

### Colors
- `--canvas`: `#f7f2e8`
- `--paper`: `#fffdf8`
- `--ink`: `#0c1220`
- `--line`: `#111111`
- `--purple`: `#6e3fd6`
- `--green`: `#2e9b4b`
- `--blue`: `#2e6be6`
- `--orange`: `#f59e0b`
- `--yellow`: `#f5d46b`
- `--soft-blue`: `#eef4ff`
- `--soft-green`: `#eefbf1`
- `--soft-orange`: `#fff4e6`
- `--soft-purple`: `#f2ecff`

### Typography
- 英文 / 数字：Inter / IBM Plex Sans / Helvetica Neue
- 中文：IBM Plex Sans SC / Noto Sans SC / PingFang SC
- 标题：800~900
- 正文：400~500
- 标签：700~800
- 适合大标题、协议缩写、短句标签
- **正文颜色优先高对比**：浅底正文回到深色；深底正文用偏暖浅色，不要把正文长期压成浅灰。

### Border / Shadow
- 外框：2px~3px 黑边
- 内框：1.5px~2px
- 阴影：轻微、偏右下
- 卡片圆角：10–18px

## Legibility rule

- Color Material 的视觉重点是“信息面板化”，不是装饰堆叠。
- 如果截图里出现“文字发灰 / 不够硬 / 首屏不清楚”，先修文本对比度，再考虑结构微调。
- 深色控制台中的正文建议用偏暖浅色（例如接近 `#ece8dc`），避免纯白过亮；浅色卡片中的正文建议用接近 `#0c1220` 的深字。
- 标签、数字、微文案必须在 1440px 和 390px 两端都可读。

## 组件库

- `hero-bar`：顶部三段式色条
- `hero-copy`：大标题 + 副标题 + badges
- `gateway-panel`：中央控制台
- `tile-grid`：2×3 功能 tile
- `capability-card`：协议/能力卡
- `gov-strip`：治理横条
- `lifecycle-stepper`：请求生命周期流程
- `summary-sidebar`：右侧卖点栏
- `sticky-note`：便签说明
- `github-stats-card`：stars / community / release

## Mobile rules

- 720px 以下必须单列堆叠
- 右侧 summary 栏下沉为底部卡片
- 协议卡从 4 列变 1 列或 2 列
- 生命周期改成垂直 stepper
- 390px 下绝不允许横向溢出
- 关键文本最小字号不要低于 12px

## 适合的内容

- 技术产品 / 开源项目能力地图
- Agent / AI 平台 / 协议网关 / 控制平面
- 调查复盘中的多来源证据与案例矩阵
- 统一入口、统一治理、统一路由类系统说明
- 产品架构说明、能力地图、生态图谱
- 需要左右分栏 + 中央汇总 + 右侧信息 rail 的高密度卡

## 不适合的内容

- 纯情绪化热点卡
- 强调手作纸感 / 贴纸感的轻编辑卡
- 纯黑头调查风
- 需要极简奢华感的品牌海报

## 平台/运行时类卡片的专门规则

当内容是 **agent runtime / orchestration platform / control plane / review console** 这一类技术项目时：

- 把“控制平面”放在视觉中心，不要退化成普通产品特性清单。
- 左侧优先讲接入、安装、连接、部署；右侧优先讲证据、截图、文档、CLI / MCP / dashboard。
- 底部必须给出运行闭环：install → connect → deploy → sync / loop / observe。
- 如果仓库有 hero / graph / timeline / dashboard / explainer 图，必须把图作为首屏或技术界面的重要锚点。
- 深色核心面板要保持足够硬的对比度，正文不要压灰。
- 一旦出现“看起来不像 Color Material”这种反馈，优先检查：
  1) 有没有真正的 central control panel
  2) 有没有 evidence imagery
  3) 有没有生命周期 / 部署闭环
  4) 有没有把内容压成普通列表

## 一句话记忆

**Color Material 风格 = 暖底 + 深色控制台 + 彩色能力节点 + 右侧信息 rail + 底部生命周期。**

## 生成要求

- 先把“中心对象 / 分区逻辑 / 节点关系”讲清楚，再谈功能细节。
- 颜色必须服务语义，不只是装饰。
- 结构必须像“材料面板式架构海报”，不是普通模块列表。
- 如果来源内容有图，必须把图作为首屏视觉锚点之一。
- landscape 优先；内容密度高时允许做成 2+1+sidebar 结构。
