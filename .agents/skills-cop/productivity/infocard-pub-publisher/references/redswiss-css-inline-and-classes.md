# RedSwiss CSS 加载失败诊断与内联修复（2026-07-13）

## 问题现象

页面 HTTP 200，但浏览器渲染为裸白底 + 无样式文本，类名如 `7,985GitHub Stars`（无空格）。

## 根因

HTML 使用 `<link rel="stylesheet" href="/theme/redswiss.html">` 引用外部主题。

**浏览器将 `/theme/redswiss.html` 解析为**：
```
https://ccwq.github.io/theme/redswiss.html  ← 404，仓库根路径
```
**实际主题文件在**：
```
https://ccwq.github.io/infocard-pub/theme/redswiss.html
```

所有正常工作卡均**不使用外部 link 引用**，而是将 theme CSS 内联到 HTML 中。

## 诊断步骤

1. 打开浏览器 DevTools Console，执行：
   ```javascript
   document.querySelector('link[rel="stylesheet"]').href
   ```
   若返回 `https://ccwq.github.io/theme/xxx`（缺少 `/infocard-pub/` 前缀）→ 确认问题。

2. 直接 curl 验证路径：
   ```bash
   curl -s -o /dev/null -w "%{http_code}" "https://ccwq.github.io/theme/redswiss.html"
   # 返回 404 → 确认路径错误
   ```

## 修复方法

从实际部署的 theme 文件提取 `<style>` 内容，内联到 HTML `<head>` 中：

```bash
curl -s "https://ccwq.github.io/infocard-pub/theme/redswiss.html" > /tmp/rs.css
python3 -c "
import re
with open('/tmp/rs.css') as f:
    content = f.read()
match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
if match:
    print(match.group(1).strip())
" > /tmp/rs-inline.css
```

然后将 CSS 内容包裹 `<style>` 标签写入 HTML，删除 `<link>` 引用。

## 已知红黑瑞士风（RedSwiss）class 名称

### 顶栏
```
.topbar          — grid 容器（1.28fr / 0.72fr）
.topbar-hero     — 左侧 hero（红黑 diagonal 渐变背景）
.topbar-meta     — 右侧 meta 区（白底灰边框）
.meta-row-high   — 上排 stars/forks
.meta-row-low    — 下排 license/language/author
.meta-pill-lg    — 大数字 pills（14px bold）
.meta-pill-md    — 中 pills（11.5px，左红边）
.meta-pill-sm    — 小 pills（11px，左灰边）
.tagline         — 顶栏小标签（红底白字 uppercase）
.demo-title      — 大标题（H1，clamp 20-38px）
.sub-line        — 副标题（白底灰字）
```

### 概述
```
.overview        — 一句话区
.overview-sentence — 红色加粗概述句
.overview-body   — 正文段落
```

### 章节
```
.section         — 整块（黑边框 + box-shadow）
.sec-head        — 头部（黑底白字，flex 布局）
  .sec-head .num     — 红色序号（01）
  .sec-head .label   — 白字标签
.sec-body        — 内容区
```

### 网格卡片
```
.grid-2          — 2列 grid
.grid-3          — 3列 grid
.card            — 卡片（白底黑边框）
.card h4         — 卡片标题
.card p          — 卡片正文
.card .lead      — 红色 uppercase 小标签（10px）
```

### 表格
```
table            — 黑色边框高密度表
th               — 黑底白字 uppercase
tr:nth-child(even) td — 淡米色隔行
```

### 辅助
```
.pill / .pill.red / .pill.dark / .pill.soft
.flow / .flow-item / .flow-arrow
.btn / .btn.red / .btn.soft
.stats / .stat
.source-note     — 页脚灰色说明
```

## 配色 token（CSS 变量）
```css
:root {
  --bg: #f5f2ec;     /* 暖米纸背景 */
  --paper: #fffdf9;  /* 卡片白底 */
  --ink: #0a0a0a;    /* 黑色 */
  --red: #c8102e;    /* 瑞士红 */
  --soft-red: #fff5f6;
  --line: #0a0a0a;   /* 黑色边框 */
  --shadow: 6px 6px 0 rgba(10,10,10,.10);
}
```

## 预防

新发布卡**禁止**使用 `<link rel="stylesheet" href="/theme/xxx.html">` 引用外部主题。subagent 或手动创建时必须将 CSS 内联，或确认引用路径在目标部署环境下可正确解析。
