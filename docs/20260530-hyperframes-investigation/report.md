# HyperFrames 调研报告

## 一句话结论
HyperFrames 是一个面向 agent 和内容自动化流程的开源视频框架：把 HTML / CSS / media / seekable animations 渲染成确定性的 MP4，并且同时提供 CLI、AI coding agent skills、预览与渲染链路。

## 官方定位
仓库首页的定位非常直接：**“Write HTML. Render video. Built for agents.”**

README 进一步说明它不是传统视频编辑器，而是：
- 用 HTML 定义视频
- 用 CSS / 动画轨道描述时间与动效
- 用 CLI 或 agent skill 进行预览与渲染
- 让自动化流水线生成可复现的视频输出

## 公开信息证据链
### 1) GitHub README
可见的首页内容显示：
- 项目名称：`heygen-com/hyperframes`
- 标语：`Write HTML. Render video. Built for agents.`
- 关键描述：
  - open-source framework
  - turning HTML, CSS, media, and seekable animations into deterministic MP4 videos
  - local CLI usage
  - AI coding agent skills
  - hosted authoring workflows

### 2) 安装与使用入口
README 明确给出两种主路径：
- **AI coding agent**：先安装 HyperFrames skills，再让 agent 按需求生成视频
- **CLI**：`npx hyperframes init` / `preview` / `render`

### 3) 能力范围
README 展示了它可支持的内容类型：
- 产品发布视频
- PR walkthrough / 代码差异讲解
- 数据可视化 / chart race / 地图动画
- 社媒短视频 / 运动字幕 / 背景音乐
- docs-to-video / PDF-to-video / website-to-video
- 可复用 motion graphics

### 4) 运行约束
README 中可见的硬要求包括：
- Node.js 22+
- FFmpeg

## 这项目解决什么问题
传统视频制作往往有两个痛点：
1. 难以和代码 / 内容自动化流水线结合
2. 产物不够可复现，手工调参多

HyperFrames 的思路是把视频变成一种“可编程 UI”：
- 画面结构由 HTML 组织
- 运动由 seekable animation 驱动
- 输出由渲染器统一生成 MP4
- agent 可以直接参与计划、写代码、预览、修正、再渲染

## 最适合的使用场景
### 适合
- 研发团队自动生成产品发布视频
- 需要 PR 讲解、代码 diff 动画、演示视频的团队
- 想把网页 / 文档 / PDF 批量转视频的工作流
- 希望 agent 直接写视频工程的人

### 不太适合
- 只想“点几下就剪视频”的轻量剪辑需求
- 需要大量传统时间线手工剪辑控制的场景
- 不愿意接触 HTML / 前端结构的人

## 与一般视频工具的差异
HyperFrames 更像“视频工程框架”，不是传统剪辑软件：
- 它强调代码化定义视频
- 适合自动化、可复现、可模板化的内容生产
- 对 agent 友好，能放进 CI / pipeline / content generation flow

## 风险与注意点
- 需要 Node.js 22+
- 需要 FFmpeg
- 用户需要理解 HTML / CSS / 动画轨道的基本组织方式
- 如果团队更偏手工剪辑，学习成本会偏高

## 推荐判断
如果你的目标是：
- 让 agent 自动生成视频
- 把视频纳入工程化流水线
- 做批量、可复现、可迭代的内容生产

那么 HyperFrames 是值得关注的。

如果你的目标只是：
- 做常规短视频剪辑
- 手工做简单包装

那它可能偏重。

## 结论
HyperFrames 的价值在于把“视频”抽象成一套可编程、可渲染、可由 agent 驱动的系统。它很适合 agent 时代的内容自动化，但也因此更偏工程化工具，而非轻剪辑工具。
