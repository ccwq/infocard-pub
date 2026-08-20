# 移动端 390px 溢出修复手册

## 典型症状

Playwright 390px 全页截图可见右侧有内容超出边界，或 PIL/numpy 统计右侧40px边条非白像素过多（通常>10%总行数）。

**注意**：PIL 像素计数有噪音——卡片边框（1.5-2px）和 PRO/featured 徽章也会计入。视觉分析比像素统计更可靠。

## 根因模式

| 根因 | 场景 | 修复 |
|------|------|------|
| hero 两列 grid 未强制单列 | `@media(max-width:720px)` 缺 `grid-template-columns:1fr!important` | 加 `!important` 强制单列 |
| 页面容器无横向截断 | `.page` 缺 `overflow-x:hidden` | 加到 `.page` CSS |
| 固定宽度元素超出 | 代码块、表格固定宽于 390px | 表格 `.code-block{overflow-x:auto}` |
| 外部图片撑破 | `<img width="1507">` 等固定宽图 | CSS `img{max-width:100%;height:auto}` |

## 标准修复模板

在 `@media(max-width:720px)` 中添加：

```css
@media(max-width:720px){
  .page{width:min(100% - 14px,1180px);padding:10px 0 72px;overflow-x:hidden!important}
  .hero,.tech-section{grid-template-columns:1fr!important}
  h1{font-size:clamp(22px,8vw,32px)}
  img{max-width:100%;height:auto}
  .feat-grid,.tech-grid,.howto-body,.faq-grid,.value-grid{grid-template-columns:1fr}
  .footer{flex-direction:column}
}
```

## 验证流程

1. push 到 origin main
2. 等 Pages 部署（轮询 HTTP 200）
3. 带缓存破坏参数截图：`page.goto(url + '?cb=' + timestamp)`
4. 视觉分析截图（用 `mcp_minimax_understand_image`）

## 相关案例

- **TREK**（2026-07-06）：hero grid `minmax(0,1fr) minmax(240px,.5fr)` 在 390px 下溢出。修复：`hero{grid-template-columns:1fr!important}` + `.page{overflow-x:hidden}`。Commit `e47c135`。
