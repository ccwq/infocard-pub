# Qwable-v1 信息卡重建过程记录

## 时间

2026-07-28

## 背景

用户交接了一个 crayon poster-shell 风格的 Qwable-v1 本地部署信息卡，存在移动端布局崩溃问题（card-body 被压缩到 22px，序号未垂直居中）。

## 修复尝试过程（失败路径）

| 轮次 | 操作 | 结果 |
|------|------|------|
| 1 | 加 `align-self: center` 到 `.card-num` | 桌面端序号顶部对齐，未解决 |
| 2 | 改 `.skill-card` grid → flex | 桌面端崩溃更严重 |
| 3 | 加 `flex: 1` 到 `.poster-shell .card-body` 全局规则 | 移动端媒体查询内无 flex:1，无效 |
| 4 | 媒体查询内加 `flex: 1` | 移动端崩溃，移动端 skill-card 是 grid 不是 flex |
| 5 | 回滚到 024eafd 基线 | 桌面端正常，移动端仍崩溃 |

## 根因确认

`024eafd` 基线的 `.skill-card` 在移动端是 `display: grid`（非 flex），
但移动端媒体查询里 `.poster-shell .card-body` 有 `grid-column: 2` 无 `width: 100%`，
导致 body 落入第 2 列但列宽被压缩到 padding 宽度。

## 重建决策

用户明确说："**重建这个信息卡, 确保内容不丢失为前提**"

授权方式：用户明确授权 assistant 全权决策，"你决定 我只要结果"

## 重建方案

- 从零构建 CSS，不继承旧版的 grid/flex 混用问题
- 使用干净的 CSS Grid（编号列 + 正文列）
- 关键：`card-body { grid-column: 2; width: 100%; }` 同时声明
- 移动端媒体查询内同样声明 `width: 100%`
- 序号居中：`align-self: center` + `grid-template-columns: 100px 1fr`

## 验证结果

| 指标 | 桌面端 | 移动端 |
|------|--------|--------|
| body 宽度 | 652px ✅ | 271px ✅ |
| 序号垂直居中 | num_center=421, body_center=421 ✅ | num_center=513, body_center=513 ✅ |
| 竖向条纹 | 正确位置 ✅ | 正确位置 ✅ |

## 决策阈值

当 CSS 修补迭代 ≥ 3 轮仍无法同时满足桌面端+移动端，且根因涉及：
- CSS specificity 冲突（.poster-shell .card-body × 2 条规则）
- grid/flex 混用导致行为不一致
- 移动端媒体查询内规则缺失

→ 触发"重建"决策，而非继续修补
