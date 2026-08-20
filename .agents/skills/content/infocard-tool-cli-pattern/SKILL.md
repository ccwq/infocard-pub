---
name: infocard-tool-cli-pattern
description: redswiss 风格工具/CLI 类信息卡的标准版式组合与元数据规范。触发条件：用户要求创建工具、CLI、开源项目的 redswiss 风格信息卡，或要求"基于 README 写信息卡"且目标有 GitHub Stars / CLI 命令 / Agent 支持等特征。模板位于 `~/infocard-pub/theme/redswiss.html`。
category: content
tags: [infocard, redswiss, tool, CLI, GitHub, Agent, pattern]
---

# infocard-tool-cli-pattern · 工具/CLI 类 redswiss 信息卡标准模式

## 触发条件

用户要求创建以下类型的信息卡时，优先使用本模式：
- 开源工具 / CLI 应用（如 md2wechat、tangram、ollama 等）
- GitHub 仓库图鉴
- Agent 集成类工具（Claude Code、Codex、OpenClaw 集成）
- 多命令对比表类内容

**redswiss 视觉锚点**：红色斜切 hero + 纯红黑无蓝 + category-dot 色点

## 标准版式组合（工具卡）

| 组件 | 类名 | 用途 | 必选 |
|------|------|------|------|
| 顶栏 hero | `.topbar` + `.topbar-hero` + `.topbar-meta` | Stars + License + 关键指标 | ✅ |
| 一句话概述 | `.overview` + `.overview-sentence` | 核心定位 ≤50 字，红色粗体 | ✅ |
| DEMO GIF | `.demo-gif` + `img` | 展示 CLI 实际运行效果 | 推荐 |
| 统计条 | `.stats` + `.stat` | 关键指标（Stars、主题数、模块数等） | ✅ |
| 功能网格 | `.grid-2` + `.card` + `.lead` + `.card h4` + `.card p` | 4 个核心功能（2×2 布局） | 推荐 |
| 对比表 | `table`（黑头 + 斑马行） | 免费 vs 专业、vs 对比等维度 | 视内容 |
| 工作流图 | `.flow` + `.flow-item` + `.flow-arrow` | Agent 调用流程可视化 | 视内容 |
| CLI 网格 | `.cli-grid` + `.cli-card` + `.cmd` + `.desc` | 列出命令或 discovery 端点 | 视内容 |
| 命令表 | `table` | 常用命令参考 | 视内容 |
| 安装块 | `pre`（黑底浅色字） | 快速安装命令 | 推荐 |

## 顶栏结构模板

```html
<header class="topbar">
  <div class="topbar-hero">
    <div class="kicker">CLI · AGENT READY · GOLANG</div>  <!-- 技术栈标签 -->
    <h1 class="demo-title">项目名</h1>
    <p class="sub-line">核心定位一句话</p>
    <div class="tagline">关键词 · 关键词 · 关键词</div>
  </div>
  <div class="topbar-meta">
    <div class="meta-row-high">
      <div class="meta-pill-lg">3,198<span class="sub">Stars</span></div>
      <div class="meta-pill-lg">Source<span class="sub">Available</span></div>
    </div>
    <div class="meta-row-low">
      <div class="meta-pill-md">48<span class="sub">主题</span></div>
      <div class="meta-pill-md">43<span class="sub">模块</span></div>
      <div class="meta-pill-sm">Go<span class="sub">1.26.1+</span></div>
    </div>
  </div>
</header>
```

**meta-row-high** 通常放：Stars + 协议 / Forks + 语言  
**meta-row-low** 通常放：关键能力指标 / 版本 / 来源实验室

## 核心组件 CSS

### DEMO GIF

```css
.demo-gif{border:2px solid var(--line);box-shadow:var(--shadow);margin-bottom:14px;background:#fff}
.demo-gif img{width:100%;height:auto}
```

素材路径：`~/infocard-pub/assets/img/<slug>/<name>.gif`

### 功能网格（2×2）

```html
<div class="grid-2">
  <div class="card">
    <div class="lead">小标签</div>
    <h4>功能标题</h4>
    <p>功能描述文字</p>
  </div>
  <!-- 重复 4 个 card -->
</div>
```

### CLI 网格（4 列命令卡）

```html
<div class="cli-grid">
  <div class="cli-card">
    <span class="cmd">capabilities --json</span>
    <span class="desc">命令用途描述</span>
  </div>
  <!-- 重复 -->
</div>
```

```css
.cli-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.cli-card .cmd{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11.5px;font-weight:800;color:var(--ink);display:block;margin-bottom:4px}
.cli-card .desc{font-size:11px;color:#555;line-height:1.4}
```

### 工作流图

```html
<div class="flow">
  <div class="flow-item red">Step1</div>
  <div class="flow-arrow">→</div>
  <div class="flow-item">Step2</div>
  <div class="flow-arrow">→</div>
  <div class="flow-item">Step3</div>
</div>
```

### 安装命令块

```html
<div style="background:#0a0a0a;color:#d4d0c8;border:2px solid var(--line);padding:12px 14px;overflow-x:auto">
  <pre style="margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.72">npm install -g @geekjourneyx/md2wechat
md2wechat config init</pre>
</div>
```

## 移动端响应

```css
@media(max-width:720px){
  .cli-grid{grid-template-columns:repeat(2,minmax(0,1fr))}  /* 4列→2列 */
  .topbar{grid-template-columns:1fr}
  .topbar-meta{border-left:none;border-top:3px solid var(--line)}
}
```

## 元数据提取优先级

当项目有 `manifest.json` 或结构化元数据文件时，优先使用：

```json
{
  "name": "md2wechat-skill",
  "version": "1.0.0",
  "source": "https://github.com/...",
  "description": "...",
  "core_features": ["...", "..."],
  "agent_commands": ["...", "..."],
  "common_commands": ["...", "..."],
  "api_modes": { "free_ai": {...}, "pro_api": {...} },
  "supported_agents": ["Claude Code", "Hermes Agent", ...]
}
```

相比手工从 README 提取，结构化元数据字段更全更快。

## meta.yaml 格式规范

```yaml
---
title: "项目名"
description: "简短描述"
date: "YYYY-MM-DD HH:MM:SS"
updated: "YYYY-MM-DD HH:MM:SS"
category: "效率工具"
style: "redswiss"
tags:
  - "CLI"
  - "Agent"
source:
  url: "https://github.com/..."
  stars: 3198
  license: "Source Available"
  language: "Go"
---
```

### ❌ 常见错误：YAMLError expected a single document

**根因**：文件末尾有尾随的 `---`。

```yaml
quick_install:
  - "npm install ..."
  - "md2wechat config init"
---   ← 这行必须删除，YAML 只允许一个文档
```

## 输出文件命名

```
~/infocard-pub/docs/YYYYMMDD-<slug>.html
~/infocard-pub/docs/YYYYMMDD-<slug>.html.meta.yaml
~/infocard-pub/assets/img/<slug>/          # 素材目录
```

## 与 redswiss-style 的关系

本 skill 是 `infocard-redswiss-style` 的工具/CLI 子模式。redswiss-style 是 class-level umbrella，定义了完整 CSS 变量、组件库和坑点。本 skill 补充工具卡特有的组件组合逻辑。

redswiss-style 关键坑点（本 skill 使用时需注意）：
- 发布前用 390px viewport 验证 DOM computed font-size，最小字号 ≥ 11.2px
- 不得在 card/panel 背景使用蓝色（--blue 只用于 badge pill）
- meta.yaml 必须有 `updated` 字段，否则 CI verify 会失败
- meta.yaml 格式必须用 wall-clock 时间（`YYYY-MM-DD HH:MM:SS`），不接受 ISO 8601

## 参考

- `~/infocard-pub/theme/redswiss.html` — redswiss 模板完整源码
- `~/infocard-pub/docs/20260711-md2wechat-skill.html` — 本模式的具体实现参考
- `references/redswiss-rebuild-verification-20260616.md` — 发布级 DOM 审查规范（390px、min font ≥11.2px、--blue token check）
- `references/awesome-design-md-redswiss-pattern.md` — VoltAgent 卡片版式创新
- `references/md2wechat-skill-case.md` — 本次 md2wechat-skill 卡的完整字段参考
