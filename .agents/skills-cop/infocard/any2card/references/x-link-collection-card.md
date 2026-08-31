# X Link-Collection Card Pattern

## 何时使用

当 X 帖子的主要价值在于**它整理的一组链接**（工具库、资源合集、阅读清单、论文打包），而不是对单个工具的深度评价或技术论证时。

典型特征：
- 帖子内容 = 编号列表 + URL + 一句话说明
- 用户要求"提取每个链接为完整链接"
- 用户要求"显示安装前面名称"
- 信息密度 = 高（10+ 条目），但每条内容浅

与现有模式的区别：

| 模式 | 参考文件 | 区别 |
|---|---|---|
| x-tool-list-commentary-card.md | 工具推荐带微注释、分组、试用顺序、边界 | 本条不需要单工具深度分析 |
| x-essay-card-enrichment.md | 技术论证保留推理链 | 本条没有论证结构可保 |
| **x-link-collection-card.md** | 纯 URL 列表 + 完整链接可见 + 配图前置 | 只有轻量说明 |

## 卡片结构

### 布局模板：单栏列表（portrait）

```
┌─────────────────────────┐
│  [标题]                  │  ← 必须呈现帖子主张
│  共 N 条工具/资源        │
├─────────────────────────┤
│  [配图区]                 │  ← 2-4列缩略图网格，帖内图片全显示
│  ┌───┐ ┌───┐ ┌───┐    │
│  │   │ │   │ │   │    │
│  └───┘ └───┘ └───┘    │
├─────────────────────────┤
│  01 [工具名称]           │  ← 编号（粗体红字）
│  https://example.com    │  ← 完整 URL，可点击，不省略
│  一句话说明              │  ← 原帖说明或补充
├─────────────────────────┤
│  02 [工具名称]           │
│  https://example.org    │
│  一句话说明              │
├─────────────────────────┤
│  ...                    │
├─────────────────────────┤
│  [来源 · 日期]           │
└─────────────────────────┘
```

### 视觉参数

- **配色**：瑞士红黑（`#e60012` 红 + `#000` 黑 + 白底）
- **标题**：52-64px，结论句
- **编号**：红色加粗，固定宽度，`inline-block`，右侧与内容对齐
- **URL**：`word-break: break-all; font-family: monospace; font-size: 13-14px; color: #333;` 不省略，整行显示
- **说明**：正文 18-20px，每项 1-2 行
- **配图**：帖内配图全部显示，2-4 列网格，位于标题 + 统计条下方、列表上方
- **分隔**：2px 红色分隔线在每项之间（或区块间）
- **边距**：外层无红色边框，接近贴边

## 内容提取流程

### 1. 从 X 提取完整链接列表

使用 CDP `Runtime.evaluate` 一次性提取所有链接：

```javascript
// 提取 article 内全部外链: {text, href}
Array.from(document.querySelectorAll('article a[href*="http"]'))
  .filter(a => !a.href.includes('twitter.com') && !a.href.includes('x.com'))
  .map(a => ({text: a.textContent.trim(), href: a.href}))
```

同时提取配图 URL：

```javascript
// 提取帖内配图
Array.from(document.querySelectorAll('article img[src*="media"]'))
  .map(img => img.src)
```

### 2. 配图处理

- 所有配图保留，以缩略图网格展示在列表上方
- 若图片来自 `pbs.twimg.com` 等外部域，建议下载到 `docs/assets/images/` 避免热链失效
- 每个配图下标注来源（"来自原帖"或"作者配图"）

### 3. 链接显示规则

- **必须完整**：不要省略 `https://...` 的任何部分
- **必须可分辨**：每个链接前显式显示工具/资源名称（取自链接文本或上下文）
- **顺序必须保留**：按原帖编号顺序排列，不重新排序

### 4. 元信息

- **来源**：X 帖链接 + 作者名
- **日期**：帖子的发布日期（东八区）
- **统计条**：显示 `共 N 条资源` 作为数字锚点

## 完整 HTML 示例片段

```html
<div class="banner">
  <h1>17 Free Claude Guides, Tools & Resources</h1>
  <div class="sub">Comprehensive collection by Ruben Hassid</div>
</div>
<div class="bar"></div>
<div class="stats">
  <div class="stat"><div class="num">17</div><div class="lab">资源总数</div></div>
</div>
<div class="images">
  <img src="../assets/images/claude-guide-1.jpg" alt="">
  <img src="../assets/images/claude-guide-2.jpg" alt="">
  <img src="../assets/images/claude-guide-3.jpg" alt="">
</div>
<div class="list">
  <div class="item">
    <div class="num">01</div>
    <div class="body">
      <div class="name">Claude Code Setup Guide</div>
      <div class="url">https://github.com/example/claude-code-setup</div>
      <div class="desc">A comprehensive setup guide for Claude Code in production</div>
    </div>
  </div>
  <!-- ... more items -->
</div>
<div class="footer">来源: @rhnv_ · 2026-05-30</div>
```

## CSS 关键点

```css
/* 列表项 */
.item { display: flex; gap: 12px; padding: 10px 0; border-bottom: 1px solid #e60012; }
.item .num { font-size: 24px; font-weight: 900; color: #e60012; min-width: 36px; flex-shrink: 0; }
.item .body { flex: 1; min-width: 0; }
.item .name { font-size: 18px; font-weight: 700; margin-bottom: 2px; }
.item .url {
  font-family: 'IBM Plex Mono', 'Consolas', monospace;
  font-size: 13px; color: #555;
  word-break: break-all; overflow-wrap: anywhere;
  margin-bottom: 4px;
}
.item .desc { font-size: 16px; color: #333; line-height: 1.5; }

/* 配图网格 */
.images { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; padding: 10px 0; }
.images img { width: 100%; border-radius: 4px; border: 1px solid #ddd; }
```

## 变体：工具合集 + HTTP 实测 + 用法说明（2026-06-23 新增）

当用户要求"每个工具需要包含完整链接和特定用法介绍"时，在纯链接列表基础上增加：

### 额外步骤
1. **逐个验证每个工具 URL 的 HTTP 状态**：`curl -sL --max-time 15 -o /dev/null -w "%{http_code}" URL`
2. **抓取每个工具网站首页**：提取 title、meta description、关键功能信息
3. **为每个工具写具体用法步骤**：不是泛泛描述，而是"打开网页 → 做什么 → 做什么 → 下载"的步骤序列
4. **HTTP 状态可视化**：200 用绿色标签，404/不可达用红色警告标签 + 替代方案
5. **规格表**：每个工具附 2-4 格规格表（免费版限制 / Premium / 评分 / 处理方式等）

### 卡片结构变化

```
┌─────────────────────────────┐
│  [标题]                      │
│  [推文配图]                   │
│  [互动数据 stats-row]         │
├─────────────────────────────┤
│  01 [工具名] [HTTP 200 ✅]   │  ← 绿色状态标签
│  https://full-url.com       │  ← 完整 URL，monospace
│  工具描述                     │
│  用法：步骤1 → 步骤2 → 步骤3  │  ← 具体用法
│  ┌─────────┬─────────┐      │  ← 规格表 2x2
│  │ 免费版   │ Premium │      │
│  └─────────┴─────────┘      │
├─────────────────────────────┤
│  04 [工具名] [HTTP 404 ⚠️]   │  ← 红色警告标签
│  https://dead-url.com       │
│  ⚠️ 网站当前不可用            │
│  替代方案：使用 XXX           │  ← 给出替代
├─────────────────────────────┤
│  [使用建议 5 条]              │
│  [来源 + 核查时间]             │
└─────────────────────────────┘
```

### 关键 CSS 差异

- `.tool-status`：绿色（`--ok`）用于 200，红色（`--warn`）用于 404
- `.tool-card.warn`：红色边框 + 暖色背景，视觉区分不可用工具
- `.tool-url`：带左边框的 monospace 块，颜色随状态变化
- `.tool-usage`：浅色背景块，标注"用法"前缀
- `.tool-specs`：2 列网格，移动端折叠为单列

### 实测数据来源

- fxtwitter API `api.fxtwitter.com/status/{id}` 返回完整 `raw_text.facets`，其中 `replacement` 字段包含 t.co 短链接的完整展开 URL——无需二次请求即可拿到每个工具的真实 URL
- HTTP 状态用 `curl -sL --max-time 15 -o /dev/null -w "%{http_code}"` 实测，不要假设网站可用
- 工具首页用 `curl -sL --max-time 15 URL | head -80` 抓取 title / meta description / 关键文案

### 验收清单（在原有基础上追加）

- [ ] 每个工具有 HTTP 实测状态标签（200 绿 / 404 红）
- [ ] 不可用工具有替代方案
- [ ] 每个工具有"用法"步骤说明
- [ ] 每个工具有至少 2 格规格表
- [ ] 底部有使用建议汇总

## 发布验收

- [ ] 所有链接显示完整 URL（无 `...` 截断）
- [ ] 配图在列表上方显示
- [ ] 每项有编号、名称、URL、说明
- [ ] 移动端 390px 无横向溢出
- [ ] URL 在窄屏上可换行（`word-break: break-all`）
- [ ] 日期为东八区
