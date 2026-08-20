# themes.html 维护更新记录（2026-06-06）

## iframe 在 2-column 布局中不展开（2026-06-06 实测固坑）

**症状**：主题演示页 iframe 在 themes.html 里横向很窄，没有撑满整行；高度也只有 1px，导致内容被压缩。

**根因**：`.preview-wrap` 在 `.themes {grid-template-columns: repeat(2, ...)}` 网格内被限制在单列宽度；`.preview-iframe` 初始 height:1px，scrolling:no。

**修复**（在 `rebuild_themes.py` 的 CSS 部分）：
```css
.preview-wrap { ...; grid-column: 1/-1; }   /* 跨越两列撑满整行 */
.preview-iframe { width:100%; height: 400px; scrolling: auto; }
```
已嵌入 `scripts/rebuild_themes.py` 的 `render()` 函数模板中，任何 rebuild 自动生效。修改后 7 个主题的 iframe 均撑满整行，400px 高度可滚动。

## 演示页元素种类过少（2026-06-06 实测）

**症状**：新主题演示页（hardblue.html/redswiss.html）只有 3-4 个 section，缺乏代码块、参数行、对比表、footer-block 等信息卡常用元素。

**要求**：每个主题的 `theme/{slug}.html` 演示页必须覆盖该主题的**全部标志性 UI 元素**。

**最少覆盖**（适用于所有主题）：
- hero / topbar（含 badge + 标题 + subtitle）
- stats 行
- pills/chips 行
- section × N（含编号方块 + 标题 + 说明）
- grid-2 或 grid-3 卡片组
- table（参数行 / 对比表）
- alert（变体 × 1）
- code block（pre）
- footer-block / quote-block
- button 行（primary/secondary/danger 变体）

**hardblue-style 额外要求**：
- section-05：alert变体（soft-red底）/ 参数行 4 列 / mini-tag 大展示 / 对比表
- section-06：代码块 pre / footer-block / save-fab 按钮
- hero-bar 三色拼接（左红/中黑/右蓝）要可见

**redswiss-style 额外要求**：
- section-02：alert红底（无蓝）/ 参数行 4 列 / grid-2
- section-03：对比表 6 行 4 列 / 代码块 / footer-block / buttons
- 无蓝黄绿辅助色要在所有元素上体现（所有强调只用红色）

## 已加入的主题（2026-06-06）

| slug | css_class | position | 标志性差异 |
|---|---|---|---|
| infocard-hardblue-style | hardblue | 6 | 三色hero-bar / 42px网格底纹 / 96×96编号块 / grid-3+matrix+risk多版式 / risk顶部色带 |
| infocard-redswiss-style | redswiss | 7 | 红黑高密度瑞士编辑风 / 无蓝黄绿辅助色 / grid-dominant dense layout / 纯红色唯一强调 |

## 主题差异判定规则

从真实卡片提取风格时，**先与已有主题做差异判定**，再决定新建还是归入：

1. **同色系 + 同底色 + 同边框/版式 + 仅内容差异** → 归入已有主题（加 `ref_links` 即可）
2. **同色系 + 至少 2 项版式差异**（如：顶部 hero-bar 拼接 / 编号方块尺寸 / 网格底纹 / risk 顶部色带）→ **新建独立主题**
3. **不同色系** → 必建新主题

**新增判定示例**：
- 与 `blue-technical-manual-style` 配色完全一致（#111/#d80018/#1f63ff/#fffdf8/#f6f4ef）但有 5 项版式差异 → 独立为 `hardblue-style`（position=6）
- 与 `main-style` 共享红黑骨架，但去掉蓝/黄/绿辅助状态色 → 独立为 `redswiss-style`（position=7）

**反例警示**：避免主题清单膨胀；用户选主题时若 7+ 主题差异过细，会陷入"选哪个"的困惑。

## TOC 动态生成（2026-06-06 新增）

`themes.html` 的"当前正式主题"列表已从硬编码改为动态：从 `_themes.yaml` 读取所有主题的 `title` + `subtitle` 生成 `<li>` 列表。无需再手动维护。

验证：`grep "当前正式主题" themes.html -A 10 | grep "<slug>"`，新主题必须在列表中出现。