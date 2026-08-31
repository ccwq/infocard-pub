# Theme Gallery Manual

## 单一事实源文件

| 文件 | 作用 | 是否可手动修改 |
|------|------|---------------|
| `_themes.yaml` | 主题 metadata 唯一来源 | 是（YAML 编辑） |
| `themes.html` | 渲染后的主题展示页 | 否（脚本派生） |
| `scripts/rebuild_themes.py` | 构建脚本 | 否（构建工具） |
| `theme/*.html` | 各主题 UI 元素演示页 | 是（独立演示） |
| `iframe-test.html` | CSP 验证测试页（已废弃） | — |

## `_themes.yaml` 字段速查

```yaml
slug          # skill 名称，格式 infocard-{slug}-style
css_class     # themes.html CSS class，如 q / green / black
pill          # 右上角标签，如 Q / GREEN / BLACK HEAD
position      # 排序整数，越小越靠前
title         # 页面标题
subtitle      # 副标题 / 定位
description   # 卡片首行描述
keywords      # chips 标签列表
swatch        # 5 个 hex 色值
preview_url   # iframe src（相对路径 ./theme/q.html）
ref_links     # 参考页面 [{title, href, note}]
note          # 底部适合/不适合标注
```

## 增删改查工作流

```
# 1. 编辑 YAML 源
vim _themes.yaml

# 2. 重建 themes.html（必做！）
python3 scripts/rebuild_themes.py

# 3. 如果是新增主题，同步：
#    - 创建 theme/<slug>.html（元素演示页）
#    - 更新对应 Skill（如 infocard-q-style）
#    - 更新 fact_store

# 4. commit + push
git add _themes.yaml themes.html theme/
git commit -m "feat: add/update theme <slug>"
git push
```

## 各主题 UI 元素矩阵

| 主题 | 背景色 | 边框特征 | 圆角 | 强调色 | 典型元素 |
|------|--------|---------|------|--------|---------|
| q-style | #f8efd9 暖米纸 | 3px solid #111 厚黑 | 12px | #9bdc77/#7cc8ff/#ffc45c | pill chip、emoji 装饰、grid 3列 |
| green-style | #f0fdf4 | 1.5px solid #15803d teal | 6px | #15803d teal | stats 行、列表行、outline btn |
| black-head-style | #fff 白底 | 无外框，黑头顶栏 | 0 | #c8102e 红色 | 结论引语块、步骤圆点、verdict 块 |
| main-style | #f5f2ec | 1.5px solid #0a0a0a | 0 | #c8102e/#0036a3/#e8c200 | stats 条、section 区块、table、flow 箭头 |
| blue-technical-manual-style | #f6f4ef | 2px solid #1f63ff 蓝 | 0 | #d80018 红蓝双 | 步骤进度条、能力矩阵、warn、code block |

## iframe 在 GitHub Pages 的行为

- GitHub Pages 默认**未设置** `X-Frame-Options` / `frame-ancestors`
- 同源 iframe（`*.github.io/*` → `*.github.io/*`）完全可用
- `loading="lazy"` 可减少初始加载开销
- `referrerpolicy="no-referrer"` 防止跨域 referrer 泄漏
- 路径使用**相对路径**（`./theme/q.html`），在 Pages 上和本地均可访问

## 重建脚本 API

```python
# rebuild_themes.py
from rebuild_themes import render_themes_yaml, build_theme_block, render

themes = render_themes_yaml(SRC.read_text())
themes_html = render_themes_list(themes)
html = render(keywords_escaped, themes_html)
OUT.write_text(html)
```

关键函数：
- `render_themes_yaml(text)` → `[{slug, css_class, pill, position, ...}, ...]`
- `build_iframe(t)` → `<div class="preview-wrap"><iframe...></div>` 或空字符串
- `build_theme_block(t)` → 完整 article HTML 块

## 踩坑记录

### 2026-06-04：跳过 grill-me 导致方案选错

**问题**：用户说“主题预览要包含 UI 元素”，我直接假设是截图方案，没有先问清楚。  
**根因**：以为理解了用户意图就直接实现。  
**修复**：启动 5 轮 grill-me → 用户明确说是 iframe 嵌入（方案 D）→ 验证 CSP 通过 → 实施。  
**教训**：用户偏好会改变技术路径时，必须先对齐再执行，不能靠推断。

### 2026-06-04：CSS double-brace 语法错误

**问题**：`rebuild_themes.py` 的 render() 函数中，新增 CSS 行忘记 `{{` 转义 `display`/`overflow` 等，导致 `NameError: name 'display' is not defined`。  
**根因**：f-string 中 CSS 不是占位符时用了 `{}` 语法。  
**修复**：CSS 行末尾全部加 `{{}}` 包裹。  
**教训**：render() 中所有 CSS 行都是 f-string 字符串，必须用 `{{}}` 包裹属性名和值。检查方式：`python3 scripts/rebuild_themes.py` 执行一次即可。

### 2026-06-04：rebase 冲突导致themes.html 丢失

**问题**：本地 commit 推送到远程时，远端已有新提交。rebase 后 themes.html 被丢弃（因为新提交是在创建 themes.html 之前就已经存在的远端状态）。  
**根因**：多次 rebase 后本地 DAG 与远程漂移，`themes.html` 所在的 commit 被错误跳过。  
**修复**：重新 write_file themes.html → git add → 新 commit → push。  
**教训**：推送失败后先 `git pull --rebase`，推上去后立即验证文件是否存在，再做后续操作。文件不在即表示推送失败，不要凭记忆判断。

### 2026-06-04：首次部署 Pages 延迟

**问题**：push 后立即 curl themes.html 404，等 ~20s 后才 200。  
**根因**：GitHub Pages 构建需要时间。  
**解决**：轮询最多 7 次，每次间隔 15s，直到 200 才认定成功。浏览器也等 Pages 完成后再截图。