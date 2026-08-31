# pi-workflow infocard 移动端修复记录 (2026-07-03)

## 问题描述
- 风格：bigwhite
- 发布后移动端截图验收：vision 分析发现流程图图片 404、hero 区域布局问题

## 修复清单

### 1. 图片路径修复（关键）
- **问题**：图片 404，`curl -sI assets/images/...` 返回 `HTTP/2 404`
- **根因**：HTML 在 `docs/` 下，图片在 `docs/assets/images/`，路径应为 `docs/assets/images/...` 不能省 `docs/`
- **修复**：
  ```html
  <!-- 错误 -->
  <img src="assets/images/20260703-pi-workflow/deep-research-flow.png">
  <!-- 正确（GitHub Pages docs 模式） -->
  <img src="docs/assets/images/20260703-pi-workflow/deep-research-flow.png">
  ```

### 2. Hero 移动端布局
```css
@media(max-width:480px){
  body{font-size:12px}
  .hero{grid-template-columns:1fr!important}
  .hero-copy{min-height:auto!important;gap:12px}
  h1{font-size:clamp(36px,10vw,60px)}
  .hero-pills{grid-template-columns:1fr!important}
  .hero-pill{border-right:0;border-bottom:1px solid var(--line)}
  .hero-pill:last-child{border-bottom:0}
}
```

### 3. 蓝色区块（流程图展示区）移动端
```css
@media(max-width:480px){
  .blue-block{min-height:auto;padding:14px;grid-template-rows:auto auto}
  .blue-block img{max-height:none;width:100%;object-fit:contain}
}
```

### 4. 通用网格移动端折叠
```css
@media(max-width:480px){
  .grid3,.grid4{grid-template-columns:1fr!important}
  .grid2{grid-template-columns:1fr!important}
  .stage-grid{grid-template-columns:1fr!important}
  .sop-table{font-size:11px;display:block;overflow-x:auto;white-space:nowrap}
  .sop-table th,.sop-table td{padding:7px 8px}
  .wf-card{padding:12px 14px}
}
```

## 验收流程
```bash
# 1. 确认图片路径可达
curl -sI "https://ccwq.github.io/infocard-pub/docs/assets/images/.../deep-research-flow.png"
# 应返回 HTTP/2 200

# 2. 确认 HTML 页面可达
curl -sI "https://ccwq.github.io/infocard-pub/docs/20260703-pi-workflow.html"

# 3. 移动端截图
playwright screenshot --viewport-size='390,844' --full-page "https://..." /tmp/xxx.png

# 4. Vision 验证（仅二元判断，不信任详细描述）
# 用 mcp_minimax_understand_image 问："是否有横向溢出？保存PNG按钮是否遮挡？"
```

## 相关提交
- `2e040f7` fix: image path for GitHub Pages + mobile flow diagram display
