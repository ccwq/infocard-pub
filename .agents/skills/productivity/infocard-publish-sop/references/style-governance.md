# 信息卡风格治理参考

本文档沉淀风格选择的判断规则，供写卡时查阅。

## 风格与主题对应表

| 风格 | 主题场景 | 示例项目 |
|------|---------|---------|
| **darkblue** | AI Agent 工具、开发者工作台、LLM 应用、架构方法论、AI 同事 | Archify、TencentDB Agent Memory、Rabbithole、Sleep-time Compute、Rowboat |
| **paper-warm** | 博客文章、技术分析、观点评论、深度解读 | Matt Rickard Clone Bottleneck |
| **darkgreen** | 网络安全、服务器加固、监控、零信任 VPN | How-To-Secure-A-Linux-Server、Tailscale |
| **hardblue** | 技术手册、Skill、算法类、安全/审计、科研方法论 | Humanize AI Detection、Apple Design、bazi-ziwei-skill、Supervisor-Skills |
| **redswiss** | 开源 CLI 工具、开发者工具 | Shifu、OfficeCLI |
| **graph-paper** | 学术教程、知识网络、代码图谱 | Dive into LLMs |
| **green** | Supabase 类品牌平台、工具 | Supabase |
| **main-style** | 默认瑞士风（工具合集、X 推文、资源推荐） | Claude Code Templates、Agent Trending |
| **white-purple** | 教程/笔记类 | emilkowalski-skills |

## 非 GitHub 内容的风格判断

| 内容类型 | 推荐主题 | 说明 |
|---------|---------|------|
| 博客文章 / 架构方法论 | darkblue 或 paper-warm | 有深度技术内容选 darkblue（深色工作台）；短评/分析选 paper-warm（纸感阅读） |
| 设计原则 / WWDC 教程 | hardblue（技术手册） |  |
| 安全加固类文章 | darkgreen（监控台） |  |
| 科研方法论 | hardblue（技术手册） |  |
| AI 同事 / 本地模型 / 知识图谱 | darkblue（工作台） |  |
| 工具合集 / 资源推荐 / X 推文 | main-style | 红黑瑞士编辑手册风格，适合集合类内容 |
| 品牌平台（Supabase 等） | green | 品牌绿为主色 |

## 协议标签规则

| 协议 | 颜色 | CSS 类 |
|------|------|--------|
| MIT | 绿色 | `badge-green` |
| Apache-2.0 | 蓝色 | `badge-blue` |
| CC BY-NC-SA 4.0 | 紫色 | `badge-purple` |
| GPL-3.0 | 红色 | `badge-red` |
| 不明确 | 灰色 | `badge` |

## Stars 数存疑标记

GitHub API 限流时，Stars 数标注 `【存疑：待从 GitHub 核实】`，不写虚构数字。

**备用来源优先级：**
1. `browser_navigate` GitHub HTML 页面提取
2. 第三方工具（如 gitstarclub.com）
3. 用户描述值（需标注"用户提供"）

**实测案例：** bazi-ziwei-skill 用户描述 530★，HTML 提取 626★，以 HTML 为准。

## 图片来源优先级

1. 仓库 assets/ 目录（克隆后复制到 `~/infocard-pub/assets/img/<slug>/`）
2. 仓库 docs/ 或 website/public/ 目录
3. 文章 OG image（`curl` 提取 og:image meta）
4. 无图则不嵌，不留空占位符

**资产管理：** 克隆仓库用 `--depth=1`，图片复制到 infocard-pub assets 后需 `git add` 一起 commit。

## 主题复用硬规则（2026-07-12 对齐）

**所有信息卡必须从仓库既有主题中选择一个；不得为单张卡新建独立主题、手写一套未注册的视觉系统，或仅在 `meta.yaml` 贴主题标签而 HTML 不符合该主题。**

### 当前允许引用的主题

主题来源是 `infocard-pub/theme/*.html`；当前注册主题为：

`archive-green`、`bigwhite`、`black`、`blue`、`codex-notebook`、`color-material`、`darkblue`、`darkgreen`、`graph-paper`、`green`、`handline`、`hardblue`、`main`、`pixelstack`、`q`、`redswiss`、`sage-swiss`、`scrapbook`、`white-purple`、`wood`。

### 合规写卡方式

1. 写卡前必须读取所选 `theme/<theme>.html`，使用其设计 token、hero 结构、主要布局与至少一个核心组件；不允许凭记忆仿写。
2. 允许因内容需求新增流程图、命令块、对比表等**增量组件**，但它们必须继承所选主题的颜色 token、字体/间距、边框/阴影和响应式规则。
3. 禁止新增第二套页面背景、主色系统、hero 体系、卡片体系；禁止以“内容需要”为由把卡做成另一个未注册主题。
4. HTML `<html>` 元素必须写 `data-theme="<theme>"`；同名 `.meta.yaml` 的 `style` 必须完全一致，并记录实际引用的主题。
5. 发布阻断验收必须同时通过：
   - `meta.yaml.style` 与 HTML `data-theme` 一致；
   - 主题 CSS 签名校验（token + hero/主要组件）；
   - 使用无缓存浏览器上下文截图并人工视觉复核。截图未完成或与主题不符，不能宣称发布完成。
6. 需要一个新主题时，必须先单独创建、注册并加入 `themes.html`，让用户预览验收；该主题获批前不得用于信息卡发布。

## HTML 写作规范

- 中文字体：始终 `PingFang SC, "Microsoft YaHei", sans-serif`，不动中文本体
- 英文字体：pixelstack 系列需下载 Pixelify Sans + JetBrains Mono 到仓库 assets/fonts/，其他风格用 Inter/system-ui
- 图片路径：`../assets/img/<slug>/<imagename>.<ext>`
- 标题格式：`<title>项目名 — 一句话描述</title>`
- 移动端：表格用 `overflow-x:auto` 包裹，grid 在 480px 断点切单列
