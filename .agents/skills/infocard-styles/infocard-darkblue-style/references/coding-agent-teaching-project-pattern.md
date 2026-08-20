# Coding Agent 教学项目信息卡写作模式

**来源**：`huggingface/tau` 信息卡（2026-07-11）
**适用仓库类型**：教学导向的极简 coding agent 实现（Hugging Face 出品 / 小型 harness / 单文件示例 / teaching project）

---

## 识别信号

以下任一满足即触发本模式：
- README 明确说明 "teaching project"、"educational"、"readable"、"understand how coding agents work"
- 仓库规模小（几千行以内），README 可读性强，有完整的 Architecture / Concepts 文档
- 强调 "small and readable"、"not production-grade"、"example of how X is built"
- Hugging Face / smolagents 生态内的教学型 agent 项目
- 仓库名称含：tau、smol、minimal、tiny、teaching、learn、harness、toy

---

## 结构模板（tau 案例）

```
Hero
  ├── kicker: source + Hugging Face 标签
  ├── title: 项目名
  ├── subtitle: 英文核心定位（一句话）
  ├── subcn: 中文补充说明（强调教学价值）
  ├── pill row: ★ Stars + Python + MIT + PyPI 名 + 版本要求 + 教学标签
  └── gradient callout: 核心理念（"小而可读"/"每个包只做一件事"）

Hero Visual
  ├── orb: 项目名首字母/希腊字母
  ├── arch-flow: tau_coding → tau_agent → tau_ai 三层节点图
  └── mini-stats: Stars / License / Python版本 / PyPI

Shell: Install + Providers
  ├── panel: uv/pipx/pip 三种安装 + 验证命令
  └── panel: OpenAI / Anthropic / Codex / HF / OpenRouter / 自定义端点

Section 1: 三层边界说明
  ├── AgentHarness = 可复用脑子（事件流契约，与前端解耦）
  ├── CodingSession = coding 环境（工具注册 + JSONL 持久化 + 项目上下文）
  ├── TUI = Textual 前端之一（非核心，只消费事件）
  └── key insight 框：tau_agent 不知道任何前端细节，只负责消息→模型→tool call→执行→循环

Section 2: 设计哲学与核心能力
  └── 6 个 cmp-item: Pythonic / Events / Portable / Tools / Sessions / Skills

Section 3: 可配置项一览
  └── data-table: model / provider / tools / skills / sessions / renderers

Section 4: 教学定位差异
  └── data-table: Tau vs Claude Code vs Codex vs SWE-agent（核心目标/可读性/架构透明度/学习价值/工具规模/安装复杂度）

CTA: GitHub + 文档 + 快速开始 + 架构解析
Footer: Stars + License + Python版本 + PyPI + 链接
```

---

## 关键写作要点

### Hero 标签策略
- 始终包含 `★ Stars`（大数字，cyan 色）和 `Hugging Face` 出品标识
- 如果仓库是 "teaching project"，pill row 必须有明确的 "教学项目" / "teaching" / "educational" chip
- PyPI 包名（如 `tau-ai`）单独一个 pill

### 三层架构图的 CSS 写法
```html
<div class="arch-flow">
  <div class="arch-node">
    <span class="icon">🔧</span>
    <span class="name">tau_coding</span>
    <span class="desc">CLI / TUI / 工具</span>
  </div>
  <div class="arch-arrow">↓</div>
  <div class="arch-node">
    <span class="icon">🧠</span>
    <span class="name">tau_agent</span>
    <span class="desc">可移植大脑</span>
  </div>
  <div class="arch-arrow">↓</div>
  <div class="arch-node">
    <span class="icon">⚡</span>
    <span class="name">tau_ai</span>
    <span class="desc">Provider 中立流</span>
  </div>
</div>
```

### 教学差异对比表的核心逻辑
- **不是比谁更强**，而是明确 "Tau 做的是教学定位，不是生产竞争"
- 表格第一列永远是"维度"（核心目标/可读性/架构透明度/学习价值/工具规模/安装复杂度）
- 每一行的 Tau 列强调 "教学价值" 和 "可读性"，不夸大功能完整性
- 用 ⭐ 数量直观表达可读性差异

### 核心一句写法
参考 tau 的：
> "Hugging Face 出品的终端 coding agent，同时是一份完整的 coding agent 教学项目——从零演示 agent loop / tool call / event stream / session persistence 的核心结构，适合通读理解全貌。"

关键要素：出品方 + 是什么 + 教学价值 + 技术关键词 + 适合人群

---

## 反模式

- ❌ 把 Tau 和 Claude Code 比"谁功能更强" → 应该比"谁更适合学习"
- ❌ 教学项目用硬核表格填满技术细节 → 保持简洁，强调可读性
- ❌ Hero visual 只放 stats 不放架构图 → 教学项目的架构图是核心，必须放
- ❌ 缺少三层边界说明 → 这是 tau 的核心卖点，必须单独成节
