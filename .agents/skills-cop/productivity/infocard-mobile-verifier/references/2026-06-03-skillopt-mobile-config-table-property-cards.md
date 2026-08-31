# 2026-06-03 移动端表格误定位与属性卡修复

## 触发场景
用户给了手机截图，指出“表格内容在水平方向上被挤压在一起”，实际问题页是：
- `https://ccwq.github.io/infocard-pub/docs/20260602-skillopt-cookbook.html`
- 具体 section：`07 · Cookbook ④ YAML 配置全字段`

但修复过程中曾误把问题归因到另一张卡（`impeccable-design-system.html`），导致先修错页。

## 应固化的规则
1. **截图问题先和目标 URL 对齐**
   - 用户一旦明确给出目标页面，先在该页面里定位同名章节 / 关键字段 / 表格内容。
   - 不能因为最近刚改过另一张卡，就把相似问题默认归到别页。

2. **技术配置表的移动端策略**
   - 若表格为 3 列左右、语义是 `参数 / 作用 / 默认值（要点）`，移动端优先改成 `property cards / definition list`。
   - 结构建议：
     - `term` = 参数名
     - `label/value` = 作用
     - `label/value` = 默认/要点
   - 不要继续通过缩小字号来硬保留桌面表格。

3. **只做 section-specific override**
   - 这类修复应只针对用户指出的 section（本例是 YAML config 表），桌面保留 table，移动端隐藏 table 并显示卡片栈。
   - 除非用户明确要求“全卡统一”，否则不要顺手改其他页面或其他章节。

4. **误修后的补救顺序**
   - 先撤销错误页面中的误插入/误结构改动
   - 再把修复落到正确页面
   - 最后重新做移动端回归 + 公网 200 验证

## 本例最小实现模式
- 原桌面表：`<table class="table config-table">`
- 移动端卡片：`<div class="config-card"> ... </div>`
- CSS：
  - 默认隐藏 `.config-card`
  - `@media (max-width:720px)` 下隐藏 `.config-table`，显示 `.config-card`
  - 卡片内部使用 `term + 两行 label/value`

## 验收
- `python scripts/verify_mobile_infocard.py docs/20260602-skillopt-cookbook.html --browser`
- 公网 detail page 200
- 确认用户指出的 section 不再横向挤压，而不是只看整页 PASS
