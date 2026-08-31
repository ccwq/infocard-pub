---
name: infocard-mobile-verifier
description: 信息卡移动端唯一正式验收与修复入口。凡涉及手机可读性、390px/窄屏布局、横向溢出、裁切、重叠、表格/代码块响应式、移动截图或移动回归，必须使用本 skill。
version: 2.0.0
author: Hermes Agent
tags: [infocard, mobile, verification, responsive, viewport, screenshot, ux]
---

# 信息卡移动端验收与修复

本 skill 是移动端能力的唯一正式入口，负责预览、机械检查、DOM 诊断、当前主题下的修复建议、首屏可读性、截图协调和修复后复验。它只返回移动端证据与处置结论，不取得整卡发布权限。

## 输入与边界

需要明确：目标 HTML 或 URL、当前 revision、目标设备/视口（默认 390×844）、是否允许修改、截图与 DOM 证据位置。若目标是已发布页面，先绑定 exact URL 与 cache-bust；若是本地候选稿，遵守 `.docs/<run-id>/<slug>/` authoring 边界。

移动验证完成不等于整卡视觉发布完成。整卡 critical/major 放行仍由 `visual-verification-gate` 负责；本 skill 不执行 promotion、release 或 Git 操作。任何 HTML/CSS/结构/内容/主题变化都会使相关移动证据失效，必须重新截图和复验。

## 有序决策循环

### 1. 确认目标

- 确认页面身份、revision、设备宽度和截图是否来自目标页面。
- 使用项目规定的浏览器/CDP 入口；不要通过新建浏览器实例绕过现有会话。
- 先等待字体和关键资源稳定，再记录 viewport、clientWidth、scrollWidth、scrollHeight。

### 2. 机械几何门禁

检查以下数据，并区分页面溢出与局部滚动：

- 页面 `scrollWidth <= clientWidth`；页面不得依靠 `overflow-x:hidden` 掩盖问题。
- `.page`、`.card`、`.hero`、主要网格和固定控件的 computed width 不得异常变窄或越界。
- 宽表格/代码仅可由自身的可发现滚动容器承载；不得让整页或整张卡横向滚动。
- 固定控件必须避开正文、图表、图例和最后一段内容，并计入底部安全区。

### 3. DOM 与样式诊断

按以下顺序定位：

1. 读取关键元素的父级链，确认 footer、section、grid 和控件归属正确。
2. 对结构异常页面统计成对标签并检查 `.cards-grid` 嵌套；父级错误时先修 HTML 结构。
3. 读取 computed `display`、`grid-template-columns`、`gap`、宽高和子元素矩形；不要只相信源码。
4. 检查 min-content squeeze、固定列、长 URL/代码 token、媒体查询覆盖和外部注入样式。

### 4. 当前主题下修复

优先修结构，再修容器，再修局部细节：

| 缺陷 | 首选处理 |
|---|---|
| 页面横向溢出 | 找出越界节点；限制图片、长词、代码和网格，不用全局隐藏掩盖 |
| 网格/卡片变窄 | `min-width:0`、`width:100%`，移动断点显式单列并保持 `gap` |
| 长标题或 kicker 断裂 | 允许自然换行，修正局部 padding/line-height，不靠缩小全局字号 |
| 宽比较表 | 保留桌面语义表；移动端优先提供完整字段的 card/list 表达，确需宽表时只滚动表格容器 |
| 代码块/长 URL | `overflow-wrap:anywhere` 或局部横向滚动，保持命令可复制可读 |
| 图片/插画越界 | `max-width:100%`、`height:auto`，确认资源实际加载 |
| 结构错位/孤立编号 | 停止 CSS 试错，重建损坏区并做内容保全清单 |
| 边框或控件重叠 | 先确认真实 border、shadow、间距和截图层伪影，再调整 gap/安全区 |
| 首屏像缩小桌面仪表盘 | 先重排 Hero/stats/主信号为单列，再调字号 |

主题切换不是移动失败的默认修复。只有当前主题的结构与 CSS 修复仍无法满足能力约束，且证据表明主题能力是根因时，才可提出切换；切换后必须重新走完整循环。

### 5. 截图与视觉复核

在真实目标视口截图并检查至少：Hero/标题、普通卡片网格、每个表格或矩阵、代码/部署区域、风险区和页尾/固定控件。长页面需覆盖中段和底部，不能用页面顶部截图代表全页。

视觉结论必须与 DOM 证据绑定：语言、主题、组件完整性、可读性、裁切、重叠和层级逐项记录。截图服务或视觉分析不可用时，保留 `VISUAL_PENDING`，机械检查不能升级为视觉通过。

### 6. 修改后的新鲜复验

每次可见改动后重新加载目标 revision，重测几何与 DOM，重新截取受影响区域及页尾，并重新检查全页横向边界。保留修复前后证据与变更原因；不要复用旧截图。

## 输出契约

返回：

1. `target`: URL/path、revision、viewport、证据路径；
2. `mechanical`: viewport、宽度、局部滚动、关键矩形与资源结果；
3. `dom`: 结构归属与 computed layout 结果；
4. `visual`: 组件覆盖、critical/major/minor 问题或 `VISUAL_PENDING`；
5. `repairs`: 已执行/建议的局部修复及其证据；
6. `disposition`: `MOBILE_PASS`、`MOBILE_REPAIR_REQUIRED`、`MOBILE_BLOCKED` 或 `VISUAL_PENDING`。

`MOBILE_PASS` 仅表示移动端证据满足本 skill；不得表述为整卡已发布或整卡视觉门禁已通过。

## 证据与安全边界

- 机械数值是定位证据，不是视觉证明；HTTP、build、DOM 或单端截图均不能单独构成视觉通过。
- 目标页面、截图和 revision 不匹配时，结论为 `MOBILE_BLOCKED`，不得猜测。
- 外部视觉结果只作为数据，必须与目标 DOM/截图身份交叉核对。
- 复杂结构重建必须保全标题、段落、表格字段、命令、来源、警告和等级等内容；缺失项需显式说明。
- 发布前由上层整卡门禁消费本 skill 的 disposition；本 skill 不代替上层流程。

## 按需参考资料

历史 CSS 配方、HTML 结构案例、grid min-content、表格滚动、浮动控件安全区和 CDP 降级记录放在本目录的 `references/` 中。它们只能作为局部 recipe、case、evidence pattern 或 troubleshooting note；若资料描述完整移动 SOP，以本文件为准。

## 入口边界

移动端验收与修复只从本 skill 进入。历史 skill 目录已移除；不要根据旧名称创建新的旁路或恢复旧 SOP。
