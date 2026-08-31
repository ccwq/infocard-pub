# CSS 表格布局反模式与 CDN 验收规范

> 来源：2026-07-14 mattpocock/skills v1.2 redesign session  
> 问题：红框场景块渲染异常反复，根因是 CSS 和 CDN 验证流程问题

---

## CSS 表格反模式（绝不能在 infocard HTML 里出现）

### 1. `display:block` on `tbody tr`

```css
/* ❌ 错误 — 破坏表格列布局算法 */
.skill-table tbody tr { display: block }

/* 结果：列宽分配完全失效，列宽变成 auto，内容撑开不等宽 */
```

**正确做法**：
- 使用标准 table 布局：`table-layout:auto` + `border-collapse:collapse`
- 绝不使用 `display:block/grid/flex` 在 table 内部结构上
- 如果需要两行结构，用真实的 `<tr>`，不要用 CSS 模拟

### 2. `border-collapse:separate` + `border-spacing` on data tables

```css
/* ❌ 错误 — separate 模式下列宽计算不可靠 */
.skill-table {
  border-collapse: separate;
  border-spacing: 0 12px;  /* 行间距用 padding 而非 border-spacing */
}
```

**正确做法**：用 `border-collapse:collapse` + `td { padding-top: N; padding-bottom: N }` 替代行间距。

### 3. `colspan` 在游离 div 上

```html
<!-- ❌ 错误 — <div> 不是表格元素，colspan 无效 -->
<tbody>
  <tr>...</tr>
  <div class="scene-block" style="col-span:2">  <!-- 无效 -->
</tbody>

<!-- ✅ 正确 — 用真实 tr + td[colspan] -->
<tbody>
  <tr>
    <td class="skill-name">/ask-matt</td>
    <td class="skill-desc">描述</td>
  </tr>
  <tr class="scene-row">
    <td colspan="2"><div class="scene-inner">适用场景...</div></td>
  </tr>
</tbody>
```

---

## 重建流程（scene-row 表格式修复）

当 Python 脚本误删 `<tr class="scene-row">` wrapper，只留下裸露的 `<div class="scene-block">`（非法 HTML），或 CSS `display:block` on `<tr>` 破坏列宽时：

```bash
# 1. 从已知正常的旧 commit 恢复完整 HTML
git show <good-commit-sha>:docs/<slug>.html > /tmp/restore.html

# 2. 从当前文件提取新 CSS（避免重写）
sed -n '41,71p' docs/<slug>.html > /tmp/new_css.txt

# 3. 用 Python 把新 CSS 注入旧内容
python3 - << 'PY'
with open('/tmp/restore.html') as f: lines = f.readlines()
with open('/tmp/new_css.txt') as f: new_css = f.read()
new_lines = lines[:40] + [new_css] + lines[71:]
with open('docs/<slug>.html', 'w') as f: f.writelines(new_lines)
PY

# 4. 清理固定宽度
sed -i 's/th style="width:165px"//' docs/<slug>.html

# 5. 验证结构
grep -c 'scene-row' docs/<slug>.html    # 应 >= skill 数
grep -c 'colspan="2"' docs/<slug>.html  # 应 == scene-row 数
```

**教训**：Python 批量替换时正则要匹配整块 `<tr class="scene-row">.*?</tr>`，不要逐行替换 `<div>`。一起替换，不分开操作。

---

## CDN 验收标准流程（每次 push 后必须执行）

### 正确的验收序列

```
1. git push
2. sleep 8
3. curl -sI https://<cdn>/<file>.html | grep "age\|x-proxy-cache"
   → age:0 + MISS = CDN 已刷新，立即可见
   → age:N + HIT = CDN 有缓存，需等待或加 ?v=N query string
4. curl -s https://<cdn>/<file>.html | grep "<CSS-selector>"
   → 必须找到目标 CSS 规则，确认 HTML 内容已更新
5. agent-browser open + screenshot --full
   → 基于真实 CDN 内容截图，不是本地文件
```

### 常见误区

| 错误 | 后果 |
|------|------|
| 只用 `curl -o /dev/null -w "%{http_code}"` | 200 不代表内容新，缓存返回 200 但旧内容 |
| 在浏览器地址栏直接刷新 | 浏览器强缓存，返回旧版 |
| 用 `?v=cachebust` 绕过缓存但 CDN 仍返回旧版 | query string 不影响 CDN 缓存命中原文件 |
| 用 accessibility tree（browser_snapshot）判断渲染 | 无颜色/布局/字体信息，不算视觉验收 |

### 视觉验收判定标准

- `agent-browser screenshot --full` → `vision_analyze` 必须看到截图
- `vision_analyze` 返回 `success:false` → 降级到 `agent-browser screenshot --full` 重试
- `agent-browser screenshot --full` 也失败 → 报告失败，不声称"通过"
- 不能用 accessibility tree（browser_snapshot）替代截图来声称"验收通过"

---

## scene-row 结构模板

每 skill = 两行 HTML 结构：

```html
<table class="skill-table">
  <thead>
    <tr>
      <th>Skill</th>
      <th>技能描述</th>
    </tr>
  </thead>
  <tbody>
    <!-- Skill 行 -->
    <tr>
      <td class="skill-name">/grill-with-docs <span class="badge-inline">核心</span></td>
      <td class="skill-desc">逐分支穷举决策树，留下 ADR + CONTEXT.md glossary</td>
    </tr>
    <!-- 适用场景行：独立行，colspan=2 -->
    <tr class="scene-row">
      <td colspan="2">
        <div class="scene-inner">
          <strong>适用场景A：</strong>...<br>
          <strong>适用场景B：</strong>...
        </div>
      </td>
    </tr>
  </tbody>
</table>
```

CSS（供参考）：

```css
.skill-table { width:100%; table-layout:auto; border-collapse:collapse }
.skill-table td { padding:8px 10px 6px; border-bottom:1px solid #e8e4dc; vertical-align:top }
.scene-row td { background:#f8f8f6; padding:5px 10px 6px }
.scene-row .scene-inner { font-size:9px; color:#666; line-height:1.5; padding-left:10px; border-left:2px solid #d0d8e4 }
.scene-row .scene-inner strong { color:#444; font-weight:600 }
.scene-row .scene-inner em { color:#2d7a2d; font-style:normal }
```

---

## 案例列表表格反模式：5+ 列表格必须用案例卡片替代（2026-07-22 新增）

### 问题描述

**卡片**: `20260722-university-research-fund-fraud.html` §3 典型案例区域

**症状**：7 列表格在 390px 移动端视口下：
- 第一列（涉案主体）文字被压缩成**单字竖排**（如"中/国/农/业/大/学/李某"逐字竖列）
- 各列宽度被强行压缩到约 55px，无法阅读
- "手段"列被迫换行，"处理结果"列紧贴屏幕边缘
- 无横向滚动条，内容被强行塞入视口

### 规则

| 列数 | 桌面端 | 移动端 |
|------|--------|--------|
| 2-3 列 | `<table>` 可用 | 可保持表格或折叠为 2 列卡片 |
| 4 列 | 考虑 `<table>` | 必须隐藏 table 显示卡片 |
| **5+ 列** | **用 `.case-card-list` 网格** | **单列 `.case-card` 堆叠** |

**案例卡片 HTML 结构**：
```html
<div class="case-card-list">
  <div class="case-card">
    <div class="case-primary">
      <span class="case-name">中国农业大学李某</span>
      <span class="case-amount">3756万元</span>
    </div>
    <div class="case-detail">时间：~2020s · 高校：985</div>
    <div class="case-method">侵吞+虚开发票+虚列劳务</div>
    <div class="case-result">有期徒刑12年+罚金300万</div>
  </div>
</div>
```

**CSS**：
```css
@media (max-width: 720px) {
  .case-table { display: none; }
  .case-card-list { display: flex; flex-direction: column; gap: 12px; padding: 12px; }
  .case-card { border: 1px solid #e0e0e0; border-radius: 8px; padding: 12px; background: #fff; }
  .case-primary { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
  .case-name { font-weight: 700; font-size: 15px; }
  .case-amount { font-weight: 700; font-size: 15px; color: #c00; }
  .case-detail { font-size: 12px; color: #666; margin-bottom: 4px; }
  .case-method { font-size: 13px; margin-bottom: 4px; }
  .case-result { font-size: 12px; color: #555; }
}
```

### 快速检测

打开 HTML，搜索 `<table>`：
- `<th>` 数量 ≥ 5 → 风险卡片
- 表格内含"涉案主体"、"涉案金额"等案例字段 → 必须有等效 `.case-card-list`

### 修复检查清单

- [ ] `@media (max-width:720px)` 内 `.case-table { display: none }`
- [ ] 存在 `.case-card-list` 容器
- [ ] 每个案例一个 `.case-card`，姓名+金额为 primary 行
- [ ] 390px 截图验证无竖排文字、无内容溢出

---

## ⚠️ CSS Specificity 陷阱：Wrapper `display:none` 无法隐藏内部 `<table>` 自身

**2026-07-22 实录**：`university-research-fund-fraud.html` redswiss 主题 §3 案例表，7 列，390px 移动端截图显示文字单字竖排。根因：`.case-table-desktop table,.case-table-desktop{display:table}` 将 `display:table` 直接落在 `<table>` 元素上，`@media(max-width:600px){.case-table-desktop{display:none}` 只对 wrapper div 生效，`<table>` 仍可见。

### 正确修复

```css
@media (max-width: 600px) {
  /* 必须对 table 元素自身设置 display:none */
  .case-table-desktop { display: none !important; }
  .case-table-desktop table { display: none !important; }

  /* 移动端卡片列表 */
  .case-list-mobile { display: block !important; }
  .case-list-mobile .case-card { display: block !important; }
}
```

**两个 `!important` 缺一不可**：`display:table` 直接落在 `<table>` 元素上时，wrapper 的 `display:none` 不会传播到 table。

### 防错规则

编写响应式表格→卡片切换时，**永远同时对 wrapper 和 table 自身设置** `display:none`，不要只对 wrapper 设。
