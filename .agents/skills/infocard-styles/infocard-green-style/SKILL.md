---
name: infocard-green-style
description: 绿色信息卡片的外挂风格技能。用于把 infocard 切换为青绿 / 翡翠 / Swiss editorial 风格，统一配色、组件、按钮、强调条、统计卡、标签和移动端表现。
version: 1.0.0
author: Hermes Agent
tags: [infocard, style, green, teal, emerald, swiss, editorial, ui, theming]
---

# infocard-green-style

> Runtime boundary：本 Skill 仅提供视觉差异；通用来源、创作、浏览器验收、构建与发布文字均视为 legacy archive，由核心阶段接管。

## 触发条件
当用户明确表达以下意图时启用本技能：
- "绿色信息卡片"
- "青绿色 / 翡翠绿 / teal 风格"
- "把这张卡改成绿色系"
- "换成绿色 Swiss 编辑风"
- "用绿色信息卡片的视觉语言重做"

**区分"重新着色"和"重建"**：
- **重新着色**（局部换色）：只改 CSS 变量 `--red → --green`，适用于用户说"换成绿/换颜色"且页面结构本身没有破坏的情况。
- **重建**（完整重写）：从头重写 HTML 结构 + CSS，适用于用户说"重新生成"、"重建"、"regenerate"且伴随布局/可读性/风格系统性问题的场景。重建时必须用新的绿色 token 系统全量重写，而不是在旧版上局部换色。判断方法：用户同时抱怨"布局依然存在问题"或明确说"重新生成"→走重建路径。

## 目标
把现有 infocard 的视觉系统从红黑系切换为 **绿色系高密度编辑风**，保持内容结构不变，只改变：
- 配色
- 强调条与分割线
- 标签 / pill / stat / 卡片头部
- 主要按钮与图标
- 引导导航与高亮态
- 视觉层级与留白节奏

## 风格定义
这不是“全页面染绿”，而是 **Swiss editorial + green accent**：
- 底色：暖白 / 象牙白 / 雪白
- 主文字：黑色 / 深炭黑
- 强调色：青绿、翡翠绿、深绿（少量高饱和）
- 辅助灰：冷灰、浅灰
- 视觉语气：冷静、专业、克制、技术感

## 颜色 Token 参考
可按项目微调，但尽量遵循以下层级：
- `bg`: `#f5f5f0` 或 `#ffffff`
- `card`: `#ffffff`
- `text`: `#000000`
- `muted`: `#6b7280` / `#888888`
- `line`: `#d9d9d2`
- `accent`: `#0d9488`（teal）或 `#15803d`（emerald）
- `accent-dark`: `#115e59` 或 `#166534`
- `accent-soft`: `#dcfce7` / `#ccfbf1`
- `warning`: `#f59e0b`（仅用于必要警示，避免主导画面）

## 组件规则

### 1) 顶部主标题
- 保留大标题与章节编号的网格结构。
- 编号 / 章节标识改用绿色系强调。
- 不要让红色继续作为主强调色。

### 2) 章节导航 / pills
- 当前高亮项使用绿色底或绿色左线。
- 非激活项保持黑字/灰字。
- pill 推荐使用：黑底白字、绿底白字、浅绿底深绿字。

### 3) 内容卡片
- 每张卡顶部加 2–3px 绿色强调线。
- 卡片边框保持黑/深灰，不要变成整片绿色背景。
- 绿色只负责“识别与层级”，不要把页面涂满。

### 4) 统计 / ROI / 数据块
- 数据块可用黑底白字，配绿色数值或绿色分隔线。
- 如果需要更强视觉对比，可用深绿底白字，但不要使用红黑冲突风。
- 数据卡底部说明字保持低对比灰色。

### 5) 按钮
- 绿色信息卡的下载/保存按钮使用绿色系主按钮。
- 推荐样式：
  - 圆角胶囊
  - 左侧带图标（如 💾）
  - 右下角 fixed（桌面）或安全区内显眼位置
  - 移动端不得遮挡正文
- 按钮外观规范：圆角胶囊 + 💾 图标 + 右侧 fixed（桌面）/ 右下角（移动端），**不要**在按钮前面加 `.fab-spacer` 占位 div，也不要用 `<div class="fab-dock">` 包裹按钮；按钮必须直接放在 `.card` 闭合标签后，用 `position:fixed` 定位，fixed 元素不会影响文档流，不需要 spacer。
- **FAB Spacer 禁止规则**：`position:fixed` 的按钮相对于视口定位，不会造成页面空白；任何 `.fab-spacer` 或 `.fab-dock` 都是冗余结构，会在页面底部产生大量空白；绝对禁止在按钮前插入占位 div。
- **按钮 HTML 完整性验证**：生成或 patch HTML 后，用 `grep -n "save-btn\|</button>" <file>` 确认 id="save-btn"、onclick="saveCard()" 和按钮文本（💾 保存 PNG）均存在。sed 多行块删除会误删按钮，严禁使用 `sed -i '/<div class="fab-dock">/,/<\/div>/d'` 这类模式。
- **重建时按钮处理**：重建时按钮直接写在 `.card` 闭合标签后，不要包在任何 wrapper div 里。

### 6) 图标与装饰
- 图标和引导箭头优先使用绿色。
- 分割线、细条、章节条使用绿色。
- 不要用大面积渐变、霓虹或过度玻璃态。

## 布局原则
- 继续沿用高密度瑞士网格：标题区、导航条、正文卡、数据区、结尾图。
- 780px 左右的最大宽度仍是推荐上限。
- 卡片之间的节奏要紧凑，但不能让绿色把层级淹没。
- 中英混排可保留，但中文主标题与英文副标题必须层次清晰。

## 移动端规则
- 720px 以下必须做结构重排，不只是缩字号。
- 两列卡片优先折成一列或清晰的纵向堆叠。
- 统计条 / 表格 / 步骤条若在手机上显得挤压，优先转为堆叠式属性块。
- fixed 保存按钮可以保留，但必须给正文与 footer 留足安全区；不得遮挡内容。
- 青绿色按钮、标签、线条在手机上仍要清晰可见，不能因为压缩而变灰。
- `position:fixed` 的保存按钮不需要 `.fab-spacer` / `.fab-dock`；这类占位结构会制造底部空白，应避免。

## 生成流程
当用户要求“绿色信息卡片”时：
1. 先加载或复用现有 infocard 内容结构。
2. 将红黑主色替换为 green / teal / emerald 系统。
3. 统一按钮、pill、标题条、分割线、统计区强调色。
4. 检查移动端结构是否需要从桌面网格改为单列堆叠。
5. 再执行信息卡发布与验收。

## 重建（Rebuild）路径决策
当用户说"重新生成"、"重建"、"regenerate"或同时存在多个系统性破坏项（颜色+布局+字号+底部多余区域）时，**直接 write_file 从头重写**，不要持续 patch：
- patch 适合单点小修补（换色、改几个 CSS 值）
- 重建适合：全局字号放大、背景色变更、阴影系统移除、布局结构调整等需要改动 CSS token 层级的修改
- 重建后用 `python3 scripts/rebuild_index.py` 重构索引，不要手动编辑 `_index.yaml`

**重建检查清单**（交付前必须确认）：
- [ ] body background 应设为 `var(--card)` 而非 `var(--bg)`，避免页面底部透出深色背景
- [ ] `.page` 不应保留底部填充：`padding-bottom` 必须为 `0`，除非有明确的 fixed 控件避让需求；如果出现底部黑/暗色空区，优先检查 `.page` 的 `padding`/`padding-bottom`，不要误判成 body 背景或 `.card` 阴影
- [ ] `.card` 的 box-shadow 应移除或改为极轻微的 inset/fill，不要用大投射 `0 18px 50px rgba(0,0,0,.22)` 造成底部边框感
- [ ] 字号放大要覆盖**全局所有标签层级**（kicker/label/small/num/it-desc/badge/foot/pill），不只是正文
- [ ] 移动端 breakpoint 统一用 760px 测试（390×844 iPhone 视口）
- [ ] 时间线等双列 grid 元素在移动端必须改为纵向堆叠
- [ ] 发布前校对 list / 首页索引时间：`meta.yaml` 的 `date` / `updated` / `_modified_date` 应以 Asia/Shanghai 墙钟时间生成，重建或重发时要重跑 `python3 scripts/rebuild_index.py`，确保列表页排序和时间展示正确

## 禁止项
- 不要把红色保留成主强调色。
- 不要只做"颜色换肤"而不重排结构；绿色重建必须连同头部、统计、引用块、表格和按钮一起重新组织。
- 绿色卡片不允许留下硬编码红色 fallback（尤其是 header gradient、warning bar、pill、按钮与强调线）；只要截图里还能看到明显红色，就不算完成。
- 不要只改文字颜色而不改组件层级。
- 不要把绿色做成廉价荧光绿。
- 不要让按钮变成打印按钮。
- 不要在移动端保留会遮挡内容的布局。
- 不要用大 box-shadow 填充页面底部视口——这会产生"底部边框感"，正确做法是让 body 背景色与 .card 同色。
- 不要在 `.page` 上保留无意义的 `padding-bottom`；底部暗色空区经常来自 `.page` 底部 padding，而不是内容区或 body。
- 不要只放大正文字号而遗漏 kicker/label/small/num/it-desc/badge/foot/pill 等辅助层级。

## 输出检查清单
在交付绿色信息卡前，至少确认：
- 标题与章节编号已切换为绿色系层级
- pills / lines / buttons / stats 已统一风格
- 桌面和移动端都可读
- 没有红色主导视觉
- PNG 导出按钮是实际导出，不是打印
- 页面内容未被按钮遮挡

## 备注
本技能是“外挂风格层”，适合与现有 infocard 内容生成技能配合使用：
- 内容技能负责写内容与结构
- `infocard-green-style` 负责切换配色与 UI 元素
- 若用户没有特别说明，不要自动把所有卡片都改成绿色

## Active theme adapter contract

This package implements `infocard-theme-contract@1` as a visual-only adapter. Earlier generic authoring, browser verification and publishing instructions are deprecated compatibility guidance; the core authoring, quality and delivery stages own them.
