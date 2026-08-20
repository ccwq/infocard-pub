---
name: infocard-layout-debugging
description: Fix misplaced infocard grid elements.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, css, grid, responsive, visual-debugging, publishing]
    related_skills: [infocard-style-man-skill, infocard-crayon-style, web-visual-acceptance, infocard-mobile-verifier]
---

# infocard-layout-debugging

信息卡主题布局调试与视觉验收技能。用于处理编号、时间轴、正文列、装饰线、响应式布局与线上缓存之间的错位问题。

## 触发条件

- 用户指出编号跑到右侧、正文被挤窄、时间轴错位或移动端布局异常。
- CSS 已声明 `grid-column`，但截图仍显示元素位置错误。
- 本地、CDN 与用户截图的视觉结果不一致。
- 主题改造涉及 poster-shell、timeline、编号列或移动端断点。

## 核心原则

1. **先查 DOM 层级，再改 CSS。** `grid-column` 只对当前 grid 容器的直接 grid item 生效；嵌套元素不能跨越父子层级参与祖先 grid。
2. **结构优先于视觉补丁。** 不要先用 `position:absolute` 把错误嵌套的元素“拉回”目标位置；应优先修复组件骨架。
3. **线上事实优先于截图猜测。** 先抓取线上 HTML/CSS，确认部署版本和 DOM 顺序，再使用截图或视觉模型分析。
4. **桌面与移动端必须成对验证。** 编号列宽度、编号宽度、时间轴 left 偏移和正文 padding 必须同步更新。
5. **主题必须保持泛化。** 修复应落在组件骨架、token 和响应式规则，不得绑定某一张卡片的固定内容。
6. **视觉完成 ≠ 几何数据完成。** 用户已明确指出：仅靠 DOM rect、CSS computed style、`getBoundingClientRect` 一致等几何证据，不能算"视觉验收通过"。修复后必须用 Playwright 抓桌面 + 移动端双视口截图，再用 `vision_analyze` 给出每张图的 issues / score。任何修复只要缺截图复审，就不允许在交付报告里宣称"完成"。

## 标准组件骨架

```html
<div class="skill-card">
  <div class="card-stripe blue"></div>
  <div class="card-num blue">01</div>
  <div class="card-body">
    <div class="card-icon" aria-hidden="true">🧬</div>
    <h3 class="card-title">标题</h3>
    <p class="card-desc">正文</p>
    <div class="card-tags">标签</div>
  </div>
</div>
```

`.card-num` 与 `.card-stripe` 必须是 `.skill-card` 的直接子级；`.card-body` 必须显式声明 `grid-column:2`。

```css
.skill-card {
  position: relative;
  display: grid;
  grid-template-columns: 76px 1fr;
}
.card-num { grid-column: 1; grid-row: 1; }
.card-body { grid-column: 2; grid-row: 1; min-width: 0; }
.card-stripe { position: absolute; left: 72px; }
```

## 调试流程

### 白色空隙与浅色边缘

先确认实际预览/发布的文件路径，尤其要区分 `theme/`、`dist/` 与同名旧模板；不要把截图中的浅色边缘直接归因于浏览器默认 margin。检查 `html, body, main, .poster-shell` 的 margin、padding、background 和宽度，并用最小、可回滚的覆盖消除外部样式造成的尺寸差异：

```css
html, body, main, .poster-shell { box-sizing: border-box; }
html, body, main { margin: 0; padding: 0; background: var(--crayon-bg); }
```

不要为了消除空隙直接改 `min-height:100vh` 或重构 DOM；先验证是否实际加载了旧版 `.page { width: calc(100% - 20px) }`。

### 编号列与时间轴几何对齐

时间轴 `left` 应和编号列边界使用同一基准。

- **R6 桌面端**（crayon poster-shell 已升级）：`grid-template-columns: 100px 1fr`，时间轴 `left:96px`，编号 `padding-right:32px`。100 / 96 / 32 三值必须成套调整。
- **R6 移动端**：`grid-template-columns: 72px 1fr`，时间轴 `left:68px`，编号 `padding-right:24px`。
- **R5 旧档位**（不推荐，仅用于历史卡）：`grid-template-columns:68px 1fr`，时间轴 `left:68px`，编号 `padding-right:10px`；移动端 `48px 1fr` + `left:48px` + `padding-right:8px`。

编号 `padding-right` 只提供视觉留白，不应承担列定位。如果数字与时间轴看上去贴线，先检查 padding 是否足够（≥24px），再判断是否要扩列宽：

```css
.poster-shell .card-stripe { left: 96px; }
.poster-shell .card-num    { padding-right: 32px; align-self: center; }
@media (max-width:720px) {
  .poster-shell .card-stripe { left: 68px; }
  .poster-shell .card-num    { padding-right: 24px; }
}
```

若色彩类只写了 `background-color`，不能覆盖时间轴已有的 `background-image` 渐变；按条目换色时应替换对应的渐变 `background-image`。


### 1. 检查线上版本

```bash
curl -s --max-time 12 'https://example.com/card.html' > /tmp/card.html
```

检查预期版本标记、`.skill-card` 内 DOM 顺序 `stripe → num → body`、线上 CSS 修复值。不要只根据浏览器旧截图判断部署状态。

### 2. 检查 DOM 结构

```python
import re
html = open('/tmp/card.html').read()
first = re.search(r'<div class="skill-card">(.*?)</div>\s*<div class="skill-card">', html, re.S)
chunk = first.group(1)
assert chunk.index('card-stripe') < chunk.index('card-num') < chunk.index('card-body')
```

若 `card-num` 出现在 `card-body` 之后，先修 HTML，不要只改 CSS。

### 3. 检查 computed layout

```js
const card = document.querySelector('.skill-card');
const num = card.querySelector(':scope > .card-num');
const body = card.querySelector(':scope > .card-body');
const stripe = card.querySelector(':scope > .card-stripe');
console.table({
  card: card.getBoundingClientRect().toJSON(),
  num: num?.getBoundingClientRect().toJSON(),
  body: body?.getBoundingClientRect().toJSON(),
  stripe: stripe?.getBoundingClientRect().toJSON(),
  bodyGridColumn: getComputedStyle(body).gridColumn,
});
```

预期：`num.left` 接近 `card.left`；`body.left` 约为 `card.left + 编号列宽度`；`body.width` 占据剩余宽度；`stripe.left` 位于编号列右边缘附近；`bodyGridColumn` 为 `2`。

### 4. 移动端同步检查

在 `max-width:720px` 下，四个值必须成套调整：

```css
.skill-card { grid-template-columns: 52px 1fr; }
.card-num { width: 52px; font-size: 44px; }
.card-stripe { left: 48px; }
.card-body { padding-left: 14px; padding-right: 10px; }
```

不要只修改 `grid-template-columns`，否则编号或时间轴会漂移。

### 5. 视觉验收

先做 DOM/CSS 确定性检查，再做截图。截图只用于确认：编号位于左侧、时间轴线与圆点在编号列右缘、标题正文标签从正文列开始、移动端无横向溢出或裁切。

视觉模型误读平台外壳、浏览器缓存或旧 CDN 时，以线上 HTML/CSS token 和 DOM 顺序为 ground truth。

## 常见失败模式

| 症状 | 根因 | 正确处理 |
|---|---|---|
| 编号跑到右侧 | `.card-num` 嵌套在 `.card-body`，无法参与祖先 grid | 把编号移到 `.skill-card` 直接子级 |
| `grid-column:1` 看似存在但无效 | 元素不是该 grid 的直接 item | 修 DOM 层级，不是继续堆 CSS |
| 时间轴偏移到正文内部 | `.card-stripe` 定位基准被错误嵌套层级改变 | 移为 `.skill-card` 直接子级并相对 card 定位 |
| 移动端编号贴边或线错位 | 只调列宽，没有同步 num width/stripe left/padding | 按移动端四值成套调整 |
| 用户截图仍是旧版本 | CDN、浏览器或平台缓存 | curl 核验线上 HTML，再说明缓存可能性 |
| 本地主题正确、具体卡片错误 | 主题模板与卡片内联 CSS 隔离 | 检查具体卡片 HTML；需要显式同步内联组件 CSS |

## 交付要求

完成修复后报告根因、修改范围、桌面与移动端确定性检查、build/verify/leak 结果、公网 URL 与线上 DOM/CSS 验证结果。

若现有主题技能已记录旧版列宽或旧骨架，应在其 references 中补充本类修复；若该技能受保护不可编辑，则保留本技能作为布局调试补充，并在交付中说明存在主题技能重叠。
