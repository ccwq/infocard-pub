# OmniRoute vs CLIProxyAPI 信息卡移动端复盘

## 背景
用户反馈：线上页面在手机端“文字大小排版、空白过多”依旧存在，且先前一次修复后用户明确指出“没看到，线上移动端问题依然存在”。

目标页：`docs/20260525-omniroute-vs-cliproxyapi.html`

## 关键发现

### 1. 线上 CSS 已更新，不等于手机端实际已修好
本次页面的移动端 CSS 其实已经在线上生效，包括：
- `max-width: 780px`
- `@media (max-width: 768px)`
- 手机端表格转纵向条目

但用户在真机上仍看到“桌面整页缩小态”。

### 2. 真因是缺少 viewport meta
线上页面最初没有：

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
```

没有这行时，即使响应式 CSS 已上线，手机浏览器仍可能按桌面宽度布局后整体缩小显示，导致：
- 字号看起来仍过小
- 首屏像桌面页被整体压缩
- 用户主观感受是“完全没修”

### 3. 验证顺序必须分成两层
这类问题不能只验证“仓库文件”或“本地样式”，必须分两层：

1. **源码层**：直接抓线上 HTML，确认新 CSS / viewport 是否真的到达 GitHub Pages
2. **渲染层**：用手机视口和 cache-busting URL 检查真实首屏渲染

否则容易出现：
- 你以为已经发布
- 线上源码其实没到
- 或源码已到，但真机仍受缓存 / service worker / viewport 缺失影响

## 这次有效的修复动作
- 去掉 `html, body { width: 780px; }` 的硬宽度
- 改为 `width: 100%; max-width: 780px; overflow-x: hidden;`
- 新增移动端媒体查询，收紧 banner / meta / section padding
- 将大对比表在移动端改为块状纵向可读结构
- 将双列卡片在窄屏改为单列
- **补上 viewport meta（这是决定性一步）**

## 面向未来的经验
- 用户反馈“线上还是老样子”时，不要只重复说“已推送”
- 先抓线上 HTML 再下判断
- 移动端页面若表现为“整体缩小而不是局部错位”，优先检查 viewport
- “CSS 已上线但真机仍像没修”通常是 viewport / 缓存 / service worker 三选一，先查这三项
