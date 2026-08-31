---
name: infocard-main-style
description: 主要主题的信息卡技能。用于把开源项目、Agent 实施手册、工具说明类 infocard 切换为红黑白主骨架、蓝黄绿辅助信号、紧凑小字高密度模块化排版的默认主主题，统一 stats、grid、pill、flow、section 与移动端表现。
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, style, main-theme, compact, small-text, red-black, manual, ui, theming]
    related_skills: [any2card, infocard-black-head-style, infocard-blue-technical-manual-style, infocard-pub-publisher]
---

# infocard-main-style

> Runtime boundary：本 Skill 仅提供视觉差异；通用来源、创作、浏览器验收、构建与发布文字均视为 legacy archive，由核心阶段接管。

## Overview

这是从 `duix-avatar` 与 `claude-subagents` 抽象出的主要主题。

注意：保留 `claude-subagents` 的骨架，不保留其过小字号。

核心特征：
- 红黑白主骨架
- 蓝黄绿辅助状态色
- stats / grid / pill / flow / section 齐全
- 紧凑小字，但必须可读
- 适合作为 infocard 的默认主主题

## When to Use
- 用户说“主要主题”
- 用户说“主主题 / 默认主题”
- 用户参考 duix-avatar / claude-subagents 骨架
- 用户要高密度手册卡 / 开源项目总览卡

## Core Design DNA
- 主主题 / 默认主题
- 红黑白主系统
- 蓝黄绿做辅助层级
- 高密度模块化排版
- 看起来像默认骨架，不像特殊海报

## Typography
- Hero：`24–30px`
- Section：`20–24px`
- Lead：`16–18px`
- 正文：`12.2–13.6px`
- Stats/Pill/Meta：`11.2–12.4px`
- 最低不要低于 `11px`

## Mobile Rules
- 720px 以下优先单列
- 先退化 stats / grid，再考虑缩字
- flow 改为纵向可读
- 小字必须保持可读，而不是极小
- 如果 390px 下页面没有横向溢出但仍显拥挤，优先抬高最小字号层（meta / badge / footer / pill / note），再做结构调整；不要只改正文
- 技术表格 / 密集矩阵在 390px 上必须有明确的横向策略：优先用单独 `.table-wrap` 或类似滚动容器包裹，给表格设定合理 `min-width`，避免整页被表格撑宽。
- `保存 PNG` / 导出按钮必须在正文之后的正常流里验收，不能遮挡内容；有必要时把按钮当作底部 CTA，而不是浮层。
- 修完后用浏览器 console 复核 scrollWidth 与关键字体尺寸，再用 390px 全页截图确认；若浏览器导航超时，改用 Playwright CLI screenshot 作为移动端验收备用证据。

## Color System（配色系统）

**配色 token 必须与 `theme/main.html` 一致，不得自行定义或偏移。**

> ⚠️ **重要区分 — 两个文件的不同角色：**
> - `theme/main.html` = **元素演示页**（展示各 token 用法，不是完整成品）
> - `docs/20260530-duix-avatar.html` = **落地参考标准**（真实有灵性的完整信息卡）
>
> **修改或新建信息卡时，必须以 `duix-avatar.html` 为视觉参考**，不得以 `theme/main.html` 为设计上限。
> `theme/main.html` 的价值是 token 对照表，不是灵性模板。

| Token | Hex | 用途 |
|---|---|---|
| `--red` | `#c8102e` | 主强调色（可选）：数字标记、结论标签、红色按钮 |
| `--accent` | `#222` | 替代强调色：当红色过于抢眼时，用深灰取代红色的所有位置 |
| `--black` | `#0a0a0a` | 主边框、header 分割线、pill 描边、按钮底色 |
| `--paper` | `#fffdf9` | 正文卡片底色、section body 背景 |
| `--page-bg` | `#f5f2ec` | 页面整体背景色 |
| `--blue` | `#0036a3` | 辅助强调色（蓝 pill 文字 + 描边） |
| `--blue-bg` | `#eef4ff` | 蓝 pill 填充背景 |
| `--yellow` | `#e8c200` | 状态色（黄 pill 描边） |
| `--yellow-bg` | `#fff1b0` | 黄 pill 填充背景 |
| `--green` | `#15803d` | 确认色（绿 pill 描边） |
| `--green-bg` | `#dcfce7` | 绿 pill 填充背景 |
| `--text` | `#111` | 正文文字 |
| `--muted` | `#555` | stat label、meta 等弱信息文字 |

### Red Usage Moderation（红色使用节制）

**核心原则：红色越少越好。** 红色是高刺激色，在信息卡中只应出现 1-2 处，否则会造成视觉疲劳和层级混乱。390px 窄屏下红色会被进一步放大。

| 卡片类型 | 红色建议 |
|---|---|
| 调查/事件/社会话题 | ✅ 正常使用红色（section-no、lead、强调标记） |
| 技术分享/工具分析/代码类 | ❌ 红色频繁 → 替换为 `--accent: #222`（深灰） |
| 产品/UI 展示类 | ⚠️ 仅保留在 section-no，其他用蓝/绿辅助 |
| 开源项目总览 | ✅ 可用红色，但 section-no 已足够 |

**红色节制 checklist（发布前自查）：**
- [ ] 页面中红色是否只出现在 ≤3 个不同位置？
- [ ] 红色是否同时出现在 section-no + 标题 + 按钮 + 边框 + 强调线？→ 太多了，只保留 section-no
- [ ] 技术/代码类卡片 → section-no 改为 `--accent: #222`（深灰）
- [ ] 保存按钮改深色渐变 `#1a1a1a → #333`（而非红色渐变）

**快速替换方案：**
```css
:root { --accent: #222; --red: var(--accent); }
.section-no { background: var(--accent); }
#save-btn { background: linear-gradient(135deg, #1a1a1a, #333); }
```

**禁止行为：**
- 用 `#28231d` / `#1d1b16` 等棕色替代 `--black`
- 用 `#f8efd9` 等米黄替代 `--paper`
- 用 `--accent1` / `--accent2` 等多色杂糅替代蓝/黄/绿辅助系统
- 用 `background: var(--border)` 作为 header 整块填色（main-style 用 bottom border 而非填色）

### YAML meta.yaml 编写陷阱（infocard 专用）

**症状**：`python3 -c "import yaml; yaml.safe_load(open('meta.yaml'))"` 报 `YAMLError: expected <block end>, but found '<block mapping start>'`，且错误指向 sources 列表区域。

**根因**：YAML 中 list item 的子键使用中文标识符（如 `可信度`、`备注`）时，中文字符的视觉宽度与 ASCII 不同，写入时容易出现**缩进不足**（少 1 个空格），导致 YAML 解析器无法识别嵌套 mapping。

**错误示例**：
```yaml
sources:
  - title: "GitHub 官方仓库"
    url: https://github.com/opendatalab/MinerU
   可信度: 高        # ← 少了一个空格！应该是 4 个空格缩进
    备注: "Stars 66.9k"
```

**正确写法**：
```yaml
sources:
  - title: "GitHub 官方仓库"
    url: https://github.com/opendatalab/MinerU
    可信度: 高       # ← 4 空格缩进，与 url/title 对齐
    备注: "Stars 66.9k"
```

**防呆 checklist（写入 meta.yaml 后必查）**：
- [ ] 检查 sources/data_accuracy_notes/list 下的每一行子键缩进是否与上行 key 完全对齐
- [ ] 运行 `python3 -c "import yaml; yaml.safe_load(open('meta.yaml')); print('YAML OK')"` 验证
- [ ] 避免在 list item 子键中使用无引号中文字符串（建议加引号或改用英文 key）

**正确做法（参考 `theme/main.html`）：**
```css
/* Header：用 bottom border 分割，不用填色 */
header { border-bottom: 2px solid var(--black); padding-bottom: 8px; margin-bottom: 10px; }

/* Stats Bar：用 1.5px 边框包裹，白底 */
.stats { display: flex; flex-wrap: wrap; border: 1.5px solid var(--black); background: #fff; }

/* Section header：黑底白字 */
.sec-head { background: var(--black); color: #fff; padding: 6px 10px; }

/* Section body：白底 */
.sec-body { background: var(--paper); padding: 8px 10px; }

/* Pills：白底黑边，彩色变体填充 */
.pill { padding: 3px 8px; border: 1.5px solid var(--black); font-size: 10px; font-weight: 700; background: #fff; }
.pill.blue { background: var(--blue-bg); border-color: var(--blue); color: var(--blue); }
```

## Section Spacing（间距规范）

**各模块之间必须留足呼吸空间，禁止零间距拼接。**

| 模块组合 | 规则 | 典型值 |
|---|---|---|
| Header 深色区 → Stats Bar 浅色区 | `.header { margin-bottom: ≥ 0.75rem }` | 12px |
| Stats Bar → 首个 Section | `.stats-bar { border-bottom }` 已有分割线，额外间距 `margin-bottom: 0.75rem` | 12px |
| Section → Section | `.section { padding }` 内部留白，块间不额外加 margin | — |
| 末节 → Footer | 末节 padding-bottom 已含底部缓冲，无需额外 margin | — |

**常见错误**：
- `.header { margin-bottom: 0 }` → Header 与 Stats Bar 直接贴死，视觉拥挤
- 修复：在 `.header` 上加 `margin-bottom: 0.75rem;` 增加缓冲

### 卡片 padding 一致性（防呆规则）

**核心原则：所有卡片类型（文本卡、代码块、grid2 并排卡、closing 总结卡）的内部 padding 必须统一。** 视觉上最明显的"拼接感"来源就是不同卡片类型的 padding 不一致。

| 卡片类型 | 统一值（桌面） | 移动端 |
|---|---|---|
| 纯文本 `.block` | `padding: .84rem .86rem .9rem` | `.7rem .64rem .76rem` |
| 代码块 `.code-box` | `padding: .8rem .84rem` | 沿用桌面值 |
| 并排 `.grid2 > .block` | 同上，grid gap `.6rem` | 单列时同上 |
| 关闭框 `.closing` | `padding: .84rem .86rem .9rem` | 同上 |
| 列表 `<ul>` | `margin: .32rem 0 0 1rem` | 同上 |

**检查方法**：在 390px 窄屏下截图，目视检查所有卡片的左右内边距是否视觉一致。代码块和文本卡之间的 padding 差异是最高频的失误点。

### Section 分隔线（缓和黑白过渡）

当页面包含多次黑白背景切换（Hero 黑 → 白卡 → 黑代码 → 深色 closing）时，在 section 之间加一条视觉分隔线可以显著软化过渡。

```css
.section { position: relative; }
.section + .section::before {
  content: '';
  display: block;
  height: 1px;
  background: var(--page-bg);
  margin: -.6rem -.92rem .6rem;
}
```

这条分隔线使用页面背景色（而非黑/白），在黑白之间建立一个中性视觉缓冲。**对于不含深色/浅色切换的纯白卡片页面，不需要加分隔线。**

### 重建卡片的灵性原则（防呆规则）

**触发条件**：对已有信息卡进行重构（rebuild）时触发本节。

**常见失误**：重建时将 `theme/main.html`（简化元素演示）当作设计上限，导致新版变成"没有呼吸感的机械骨架"，失去原有灵性。

**防呆步骤**：
1. 确认参考文件：`duix-avatar.html`（真实落地卡），**不是** `theme/main.html`（演示页）
2. 灵性要素检查清单：
   - [ ] Header 有无红渐变 `linear-gradient(180deg, var(--red), #a90f27)`
   - [ ] Stats 区是否为黑底 `#121212` + 红色数字
   - [ ] Section 标题是否为红色 `label + 编号 · 标题` 格式
   - [ ] Lead 区是否有红色左边线 `border-left: 3px solid var(--red)`
   - [ ] 双字体系统是否完整（IBM Plex Sans + Mono）
3. **不得跳过第2步直接生成代码** — 灵性验证优先于编码完成

**验证方法**：重建后用 `browser_vision` 截图确认，无条件接受视觉反馈；若超时则降级用 `browser_navigate` + `browser_snapshot` 确认结构。

**检查命令**：
```bash
grep -n "margin-bottom" <file>.html | grep -E "\.header|\.stats-bar|\.section"
```

## Typography

```css
/* 固定在右下角；底部留白由 .page padding-bottom 保障 */
/* Red variant（默认，适合调查/事件卡）： */
#save-btn {
  position: fixed;
  bottom: 20px;
  right: 14px;
  z-index: 999;
  border: 0;
  border-radius: 10px;
  padding: .56rem .72rem;
  background: linear-gradient(135deg, var(--red), #b3000f);
  color: #fff;
  font-size: .7rem;
  font-weight: 900;
  font-family: "SF Mono", "Fira Code", "Cascadia Code", monospace;
  letter-spacing: .04em;
  cursor: pointer;
  box-shadow: 3px 3px 0 rgba(0,0,0,.2);
}
#save-btn:disabled { opacity: .5; cursor: not-allowed; }

/* Dark variant（技术分享/代码分析卡 — 红色太抢眼时用这个）： */
#save-btn.dark { background: linear-gradient(135deg, #1a1a1a, #333); }

/* 移动端适配 */
@media (max-width: 720px) {
  #save-btn { bottom: 14px; right: 10px; font-size: .8rem; }
}
```

**页面底部留白（必须）**：`.page` 的 `padding-bottom` 必须 ≥ `7rem`（桌面），移动端 ≥ `8rem`。5.5rem 不足以防止固定保存按钮遮挡底部内容。

```css
/* 桌面 — 有固定按钮时用 7rem+ */
.page { max-width: 720px; margin: 0 auto; padding: .75rem .7rem 7rem; }
/* 或更宽松版（推荐） */
.page { padding: .5rem .48rem 9rem; }

/* 移动端 */
@media (max-width: 720px) {
  .page { padding: .4rem .3rem 8rem; }
}
```

## Content Density（信息密度规范）

**最低模块数：8 个标准模块**
1. Banner（标题 + 日期 + 标签）
2. Stats（4格数字锚点）
3. 引言 Lead（结论先行的一句话）
4. 验证表（交叉验证，多行表格）
5. 时间线（3列节点或多列）
6. 结构分析（2列或4列卡片网格）
7. 流程/传播机制（5步流程图或同色块）
8. 结论框 + 来源 Footer

**禁止**：模块数少于8个、表格少于8行、时间线少于6节点
**实操核查方法**：每个调查卡必须有"常见思维误区"和"实操核查步骤"两个子模块

## Typography（字号体系）

| 位置 | 字号 |
|------|------|
| Hero（banner 标题）| `clamp(1.5rem, 5vw, 2.2rem)`，weight 900 |
| Section 标题 | `.82rem`，weight 900，letter-spacing .1em |
| Lead 正文 | `1.05rem`，weight 700 |
| 正文 | `.72rem` |
| Stats 数字 | `1.3rem`，weight 900 |
| Table | `.78rem` |
| Meta/Footer | `.72rem` |
| 最低字号 | `.58rem`（tl-date / flow-num 等装饰性元素） |

## Showcase Section
For GitHub repo cards with UI screenshots, use the `showcase-grid` pattern documented in `references/showcase-grid-pattern.md`: 2-column image grid with hover zoom, name/meta/desc per item, English+Chinese bilingual naming. Mobile collapses to 1 column.

## Grid2 Stealth Extension Bug
**⚠️ 必读坑点**：所有使用 `.grid2` 网格布局的信息卡（任何主题），在 390px 移动端都会被 stealth 扩展的 `cdp_override` 注入覆盖 `grid-template-columns`，导致两列不等宽。详见 `references/grid2-stealth-extension-fix.md`。

## Naming
中文名：**主要主题**
副标识：**小字**
别名：主主题、默认主骨架

## Active theme adapter contract

This package implements `infocard-theme-contract@1` as a visual-only adapter. Earlier generic authoring, browser verification and publishing instructions are deprecated compatibility guidance; the core authoring, quality and delivery stages own them.
