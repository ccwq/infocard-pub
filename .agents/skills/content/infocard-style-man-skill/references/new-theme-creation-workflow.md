# infocard-style-man-skill · 新主题创建完整流程

本文档记录从 0 到发布一个 infocard 新主题的完整步骤。

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

### 步骤 5：提交

```bash
git add _themes.yaml themes.html theme/{slug}.html
git commit -m "feat: add infocard-{slug}-style — {一句话描述}"
git push
```

**注意**：主题变更不修改 `_index.yaml` 和 `index.html`（这两个只由新卡发布驱动），所以不需要包含它们。

### 步骤 6：验证

```bash
sleep 88
curl -sI https://ccwq.github.io/infocard-pub/theme/{slug}.html | head -3
curl -s https://ccwq.github.io/infocard-pub/themes.html | grep -c 'infocard-{slug}-style'
```

## PITFALL：创建 Skill ≠ 自动进 themes.html（2026-06-14 教训）

**创建 skill 只是第一步**。如果不执行步骤 2–4，新风格不会出现在 `themes.html` 预览页里。

本会话教训：我创建了 `infocard-darkgreen-style` skill 后直接告知用户"已有预览界面"，但实际上 `_themes.yaml` 没有注册、`theme/darkgreen.html` 还不存在。用户纠正："新的infocard style都有在_themes.yaml中登记 这是标准流程"。

**正确认知**：风格 skill（`skills/`）和风格预览页（`theme/` + `_themes.yaml`）是两套独立文件，必须同时完成。

## PITFALL：auto-height slug 必须与 _themes.yaml css_class 一致

`theme/{slug}.html` 里的 `window.parent.postMessage` slug 参数必须与 `_themes.yaml` 中的 `css_class` 完全一致：

```js
window.parent.postMessage({type:'theme-height',slug:'darkgreen',height:h},'*');
// slug:'darkgreen' ← 必须等于 css_class: darkgreen（不是 darkgreen-style）
```

## Avatar/资源子目录的 git 陷阱

如果在创建卡片时同时下载了 avatar 或其他图片到 `docs/assets/images/{slug}/`，**单独提交 avatar.png 不会自动包含在第一次卡片的 commit 里**，因为 git add 的路径是精确的：

```bash
# 第一次 commit（错误做法）
git add docs/{slug}.html docs/{slug}.html.meta.yaml _index.yaml index.html
# avatar.png 没有被 add！

# 正确做法：包含资源目录
git add docs/{slug}.html docs/{slug}.html.meta.yaml \
       docs/assets/images/{slug}/ \
       _index.yaml index.html
```

**或者分两次 commit**（如果第一次忘了）：
```bash
# 第二次 commit 只补 avatar
git add docs/assets/images/{slug}/avatar.png
git commit -m "fix: add missing avatar.png for {slug}"
git push
```

详见 `infocard-pub-publisher/references/git-add-glob-and-missing-html-commit-20260611.md`

## 本次会话记录

- **2026-06-12**：创建 `infocard-darkblue-style`（深蓝渐变风），position 6，参考 Nezha 视觉语言
- **关键决策**：darkblue 不进已有主题序列，用独立 position；hardblue 从 position 6 移到 position 7
- **踩坑**：第一次 commit 忘了 add avatar.png，分开补提交（commit `65d6189`）
