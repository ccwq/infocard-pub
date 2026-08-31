# infocard-style-man-skill · 新主题创建完整流程

本文档记录从 0 到纳管一个 infocard 新主题的主题管理步骤。正式信息卡发布不属于本文档。

## 触发条件

用户说：
- “创建一个 infocard style skill”
- “基于 X 的设计语言创建一个信息卡风格”
- “把 X 的视觉特征变成一个独立主题”

## 完整流程

### 步骤 1：创建 Skill

用 `skill_manage(action='create')` 创建 `infocard-{slug}-style`，按 Unified Style Skill Schema 填写：
- Overview / Use Cases / Design DNA
- Color Tokens（对应 `--themes.yaml` swatch）
- Typography / Layout Skeleton / Component Rules / Mobile Rules
- Anti-patterns / Acceptance Checklist / Naming / Aliases

### 步骤 2：注册到 _themes.yaml（单一事实源）

**⚠️ `themes.html` 不得手动编辑**。它由 `scripts/rebuild_themes.py` 从 `_themes.yaml` 自动生成。

在 `_themes.yaml` 的 `themes:` 列表中插入条目（注意 position 顺序）：

```yaml
- slug: {slug}-style
  css_class: {slug}
  pill: {PILL_LABLE}
  position: {N}           # ← 插入位置，影响 themes.html 排序
  title: infocard-{slug}-style
  subtitle: {副标题}
  description: {一句话描述}
  keywords:
    - 关键词1
    - 关键词2
  swatch:
    - "{bg}"
    - "{panel}"
    - "{accent1}"
    - "{accent2}"
    - "{accent3}"
  preview_url: ./theme/{slug}.html
  ref_links:
    - title: {参考页面标题}
      href: ./docs/{slug-ref}.html
      note: 备注
  note: 适合...不适合...
```

**position 调整规则**：如果插入位置在中间，只更新被插入点后面的主题 position（+1），前面的不变。本工具 patch 会自动处理。

### 步骤 3：创建预览页 theme/{slug}.html

参考现有主题页结构（`theme/main.html`、`theme/blue.html`），按以下骨架构建：

```html
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>infocard-{slug}-style 元素演示</title>
  <style>
    :root { /* CSS token 系统 */ }
    body { /* 背景、字体 */ }
    .page { /* max-width + padding-bottom 留足 save-btn 空间 */ }
    /* 组件样式 ... */
  </style>
</head>
<body>
  <main class="page">
    <!-- Hero / 元素演示 -->
  </main>
  <script>
    (function(){
      function send(){
        var h=document.body.scrollHeight;
        window.parent.postMessage({type:'theme-height',slug:'{slug}',height:h},'*');
      }
      if(document.readyState==='complete'){send()}else{window.addEventListener('load',send)}
      setTimeout(send,500);
    })();
  </script>
</body>
</html>
```

**必须包含**：
- `window.parent.postMessage({type:'theme-height',slug:'{slug}',height:h},'*')` — 让 themes.html 自动调整 iframe 高度
- 完整的 CSS token 系统演示
- 移动端 media query（max-width: 720px）
- 桌面 + 移动端双版适配

### 步骤 4：重建 themes.html

```bash
python3 scripts/rebuild_themes.py
```
验证输出：`Written themes.html with N themes`

**⚠️ 平台暗色 UI 可能欺骗视觉提取**：
- 小红书等平台内容嵌在暗色 UI 外壳里，vision 模型可能把平台背景当成内容背景
- 第一轮提取背景色后，**必须用 curl 获取原始 HTML 确认 CSS 变量**
- 详见 `references/image-to-theme-visual-review-loop.md` 的 Platform UI dark mode 段落
验证输出：`Written themes.html with N themes`

### 步骤 5：交接验证

主题文件、注册表和生成的总览页交给项目规定的主题验证流程处理。本文档不执行正式信息卡发布、`commit` 或 `push`。

**注意**：主题变更不修改 `_index.yaml` 和 `index.html`（这两个只由新卡发布驱动），所以不需要包含它们。

### 步骤 6：验证

```bash
# 通过项目统一的主题预览和视觉验证流程检查本地预览页与主题总览。
```

## 常见错误：创建 Skill ≠ 自动进 themes.html

**创建 skill 只是第一步**。如果不执行步骤 2–4，新风格不会出现在 `themes.html` 预览页里。

**正确认知**：风格 skill（`skills/`）和风格预览页（`theme/` + `_themes.yaml`）是两套独立文件，必须同时完成。

## PITFALL：auto-height slug 必须与 _themes.yaml css_class 一致

`theme/{slug}.html` 里的 `window.parent.postMessage` slug 参数必须与 `_themes.yaml` 中的 `css_class` 完全一致：

```js
window.parent.postMessage({type:'theme-height',slug:'darkgreen',height:h},'*');
// slug:'darkgreen' ← 必须等于 css_class: darkgreen（不是 darkgreen-style）
```

