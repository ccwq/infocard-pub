# 2026-06-03 · 首屏整体布局退化的判定与修复模式

适用于：自动脚本只提示 `scrollWidth` 超标，但用户截图显示问题不是“单个长词/图片溢出”，而是整张卡首屏 `header / meta / stats` 结构看起来塌了。

## 快速判定
如果同时出现以下信号，优先怀疑**基础布局骨架丢失**而不是内容过宽：
- `header` 左侧挤成窄列，右侧留大片空白
- `stats` 不再是 2×2/4×1，而是竖着堆叠
- `meta` 标签漂到孤立区域，无法自然换行
- `scrollWidth` 只略高于 viewport，但视觉上像整块布局坏掉

## 先查什么
优先检查这些“骨架选择器”是否在 patch 中被覆盖或删掉：
- `.stats`
- `.stat`
- `.stat:last-child`
- `.meta .rev`
- `.header`
- `.warn strong`

## 修复顺序
1. 先补回 grid/flex 骨架，不要一上来调字体、padding、gap。
2. 再写移动端断点：
   - `body { width:100%; max-width:100%; overflow-x:hidden }`
   - `.card { width:100%; max-width:100% }`
   - `.header { grid-template-columns:1fr }`
   - 隐藏桌面专用占位列
   - `.meta` 改为 `flex-wrap`
   - `.stats` 改为 `repeat(2,minmax(0,1fr))`
3. 最后再加全局防溢出兜底：
   - `.card, .card * { max-width:100%; min-width:0; overflow-wrap:anywhere; word-break:break-word }`

## 为什么要单独存这份参考
这类问题很容易被误判成“再缩点字 / 再减点 padding 就好了”，但真实根因往往是基础 CSS 规则被 patch 覆盖掉，导致整个模块从 grid/flex 退化成 block。先恢复骨架，效率远高于盲调细节。
