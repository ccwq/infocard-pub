# 表格→卡片响应式降级案例（2026-07-22）

## 验收对象

**URL**: `https://ccwq.github.io/infocard-pub/docs/20260722-university-research-fund-fraud.html`

**问题卡片**: §3 典型案例区域

## 问题根因

HTML 用 `<table>` 展示 7 列案例数据（涉案主体、时间、高校、手段、涉案金额、处理结果、等级），移动端无等效 `.case-card-list` 结构。

## 390px 下实测症状

| 症状 | 描述 |
|------|------|
| 第一列被压缩成单字竖排 | "中国农业大学李某" → 逐字竖列，无法阅读 |
| 各列宽度被强行压缩 | 7 列同时压缩到 390px，每列仅约 55px |
| "手段"列换行 | 长文本被迫换行，进一步压缩其他列 |
| "处理结果"列紧贴屏幕边缘 | 列宽不足，文字溢出/截断 |
| 无横向滚动条 | 内容被强行塞入视口，严重破坏可读性 |

## 正确实现模式

### HTML 结构

```html
<!-- 桌面端：完整表格 -->
<table class="case-table">
  <thead>
    <tr>
      <th>涉案主体</th><th>时间</th><th>高校</th>
      <th>手段</th><th>涉案金额</th><th>处理结果</th><th>等级</th>
    </tr>
  </thead>
  <tbody>
    <tr><td>中国农业大学李某</td><td>~2020s</td><td>985</td>...</tr>
    <!-- 10 rows -->
  </tbody>
</table>

<!-- 移动端：案例卡片列表 -->
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
  <!-- 重复 10 个 case-card -->
</div>
```

### CSS 媒体查询

```css
/* 默认：显示表格 */
.case-table { display: table; }
.case-card-list { display: none; }

/* 390px 断点 */
@media (max-width: 390px), (max-width: 720px) {
  .case-table { display: none; }
  .case-card-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }
  .case-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 12px;
    background: #fff;
  }
  .case-primary {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 6px;
  }
  .case-name { font-weight: 700; font-size: 15px; }
  .case-amount { font-weight: 700; font-size: 15px; color: #c00; }
  .case-detail { font-size: 12px; color: #666; margin-bottom: 4px; }
  .case-method { font-size: 13px; margin-bottom: 4px; }
  .case-result { font-size: 12px; color: #555; }
}
```

## 验证命令

```bash
# 检查 HTML 是否有 .case-card-list
grep -c "case-card-list" /path/to/20260722-university-research-fund-fraud.html

# 检查表格是否有移动端隐藏
grep -A2 "@media.*390" /path/to/20260722-university-research-fund-fraud.html | grep -c "display.*none"

# CDP DOM 验证
# 在 390px 视口下执行：
document.querySelector('.case-table')?.computedStyleMap().get('display')
document.querySelector('.case-card-list')?.computedStyleMap().get('display')
```

## 关联陷阱

- **hardblue/redswiss 模板 `.grid-3` 无响应式断点**：同属网格/表格未折叠问题
- **多列表格溢出**：已知局限性中已有记录，本次是具体案例

## 修复状态

**已修复并验收通过 ✅**（2026-07-22 实测）

390px 移动端截图验证结果：
- §3 案例区域：**单列卡片列表**（非 7 列表格）✅
- 每案例：**姓名 + 金额** 同列一行独立卡片 ✅
- 文字无横向溢出，长文本正常换行 ✅
- 整体布局正常，无元素重叠 ✅

## ⚠️ 陷阱：CSS Specificity 导致第一次修复失败（2026-07-22 实战教训）

### 问题现象

首次修复在 `@media (max-width: 600px)` 中写：
```css
.case-table-desktop { display: none }    /* 隐藏 wrapper div */
.case-list-mobile  { display: block }    /* 显示移动端列表 */
```

**结果**：390px 下仍显示 7 列表格，完全无效。

### 根因

`<table>` 元素有浏览器默认 `display: table`。CSS 特异性规则：**直接对元素设置的 `display: table` 权重高于对父元素设置的 `display: none`**。此外，CSS 中的显式 `.case-table-desktop table,.case-table-desktop{display:table}` 同样覆盖了 `@media` 对 wrapper 设的 `display:none`。

### 正确修复

**必须在 `@media` 内直接对 `<table>` 元素本身设置 `display:none`**：

```css
/* ✅ 正确：直接隐藏 table 元素本身 */
@media (max-width: 600px) {
  .case-table-desktop { display: none !important }
  .case-table-desktop table,
  .case-table-desktop thead,
  .case-table-desktop tbody { display: none !important }  /* 关键：直接对 table/thead/tbody */
  .case-list-mobile { display: block !important }
  .case-list-mobile .case-card { display: block !important }
}

/* ❌ 错误：只隐藏 wrapper div */
@media (max-width: 600px) {
  .case-table-desktop { display: none }   /* table 元素仍显示 */
}
```

### 防错检查清单

修复后用 agent-browser 移动端截图验收，确认：
- [ ] `@media` 内有 `.case-table-desktop table { display: none }`（直接针对 table）
- [ ] 不只有 wrapper div 的 `display:none`
- [ ] `!important` 用于防止其他 CSS 规则覆盖
- [ ] `<thead>` / `<tbody>` 也被隐藏

---

## 新增：browser_navigate 后 CDP 设置移动视口的 target_id 模式

**问题**：直接对已通过 `browser_navigate` 打开的页面调用 `Emulation.setDeviceMetricsOverride` 报错 `Method not found`。

**根因**：需先通过 `Target.getTargets` 获取该页面的 `target_id`，再传入 CDP 调用。

**正确序列**：
```
browser_navigate → browser_cdp(method="Target.getTargets", target_id=null, params={})
  → 从 result.targetInfos 中找到 title 匹配结果，取其 targetId
  → browser_cdp(method="Emulation.setDeviceMetricsOverride",
      target_id="<匹配到的targetId>",
      params={"width":390,"height":844,"mobile":true,"deviceScaleFactor":2})
  → browser_vision / browser_snapshot 截图
```

**实战步骤**：
1. `browser_navigate(url)` 打开目标
2. `browser_console(expression="document.title")` 确认页面已加载
3. `browser_cdp(method="Target.getTargets", params={})` 获取所有 tab target_id
4. 在 `targetInfos[]` 里用 `title` 匹配（因为此时有多个 tab：MiniMax 控制台残留 + 目标页面）
5. 用匹配的 `targetId` 调用 `Emulation.setDeviceMetricsOverride`
6. `browser_vision` 截图，保存并用 `vision_analyze` 复核

**示例 targetInfos 筛选**：
```javascript
// 从 result.targetInfos 中找 title === "高校横向科研经费造假：手段、案例与制度漏洞"
const target = result.targetInfos.find(t => t.title === "高校横向科研经费造假：手段、案例与制度漏洞");
const targetId = target.targetId; // 如 "E27A77DE02441C26D01B068E42530A2B"
```

**注意**：若当前浏览器 session 有多个历史 tab（如 MiniMax 控制台未关闭），`browser_navigate` 打开新 URL 后 `target_id` 已切换到新页面，但旧 tab 的 target_id 仍存在于 `Target.getTargets` 结果中。必须通过 `title` 字符串匹配而非假设只有一个 page target。
