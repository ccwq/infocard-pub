# 关键教训（2026-07-03）

## 1. 移动端溢出：多列表格

**问题**：硬编码 4-5 列的表格（如对比表）在 390px 移动端下一刀切溢出，被 vision 模型误报"Dagu 右侧截断"。

**根因**：780px 断点设计的表格列宽约 100-150px/列，390px 只能容纳约 3 列。

**解法分层**（按优先级）：
1. **删列**：把 5 列压缩到 4 列（如 Dagu 卡去掉"Cron+脚本"列）
2. **overflow-x:auto 包裹**：对必须保留的宽表加 `<div style="overflow-x:auto">` 包裹
3. **响应式 grid 断点**：在 CSS `@media(max-width:480px)` 里把 `.sop-steps` / `.stats-grid` 等改为 `1fr`

**预防规则**：新建含 4+ 列表格的 infocard 时，立即加 `overflow-x:auto` 包裹，同时考虑是否删列。

## 2. 图片路径：GitHub Pages 相对路径

**问题**：pi-workflow 卡的 hero 流程图在移动端显示空白（图片 404）。

**根因**：HTML 在 `docs/2026070X-slug.html`，图片路径写成了 `assets/images/...`（相对根路径），但 GitHub Pages 从 `docs/` 作为根目录部署时找不到。

**正确写法**：
```html
<!-- 正确：相对 docs/ 目录 -->
<img src="docs/assets/images/20260703-pi-workflow/deep-research-flow.png">
<!-- 错误：相对站点根路径，GitHub Pages 找不到 -->
<img src="assets/images/20260703-pi-workflow/deep-research-flow.png">
```

**验证**：构建前检查 `curl -I https://ccwq.github.io/infocard-pub/docs/assets/images/.../xxx.png` 返回 200。

## 3. CI 门禁：build 必须在 verify 之前

**问题**：旧 CI workflow 只有 `npm run verify`（含 `git diff --exit-code`），没有 `npm run build`。当 `fix-taxonomy` 推断字段但没回写 `meta.yaml` 时，`verify` 里的 diff 会因为 `_index.yaml` / `index.html` 变化而失败。

**已修复**（commit `2e040f7`，`.github/workflows/index.yml`）：
```yaml
# 正确顺序：
- npm run build        # 先生成 _index.yaml 和 index.html
- npm run fix-taxonomy # 补全 taxonomy 字段
- npm run verify       # 校验 + git diff --exit-code
```

## 4. HTML 批量修改：用 Python 而非 shell 文本工具

**场景**：从 HTML 表格里删掉某一列的所有 `<td>`。

**可靠方法**：Python 正则处理 HTML 字符串，修改前 `git checkout file.html` 重置以避免 patch 叠加损坏文件。

## 5. Vision 模型局限性：截图分析有幻觉

**现象**：vision 模型在分析移动端截图时会捏造不存在的元素，导致错误的 FAIL 判定（如凭空描述"节省75%圆环图"等）。

**应对**：
1. **实测数据优先**：截图分析前先用 `curl -sI` 验证资源可访问性
2. **让用户直接描述**：模型结果存疑时，请用户描述他看到的实际情况
3. **分层验证**：技术指标用 curl 验证，视觉验收靠用户描述

## 6. fix-taxonomy 推断但不回写

`npm run fix-taxonomy` 会推断 `domains` 和 `tool_types`，但不写回 `meta.yaml`，导致 CI diff 失败。

**解法**：在写 meta.yaml 时就手动填好 `taxonomy.domains` 和 `taxonomy.tool_types`。已在 Nim 卡验证有效（`20260701-nim.html.meta.yaml`）。

## 7. Bigwhite 风格响应式陷阱

Hero 左右两栏布局（文字+蓝色装饰块）在 390px 下必须改为单列堆叠：
```css
@media(max-width:480px){
  .hero{grid-template-columns:1fr!important}
  .hero-copy{min-height:auto!important}
}
```

参考卡：`docs/20260617-openpi-bigwhite.html`（openpi）、`docs/20260617-bigwhite-style-demo.html`（风格演示）。
