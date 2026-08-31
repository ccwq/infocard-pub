# themes.html 单一事实源维护流程

## 核心原则

`_themes.yaml` 是 infocard 主题的**唯一事实源**。增删改查主题时，必须同步更新：

1. `_themes.yaml`（YAML 源）
2. `scripts/rebuild_themes.py`（如有渲染逻辑变更）
3. `themes.html`（运行 rebuild_themes.py 自动生成）
4. fact_store（主题清单变更后同步）

## 工作流

```bash
# 1. 编辑 YAML 源
vim _themes.yaml

# 2. 重建 HTML（自动从 YAML 渲染）
python3 scripts/rebuild_themes.py

# 3. 提交
git add _themes.yaml themes.html scripts/rebuild_themes.py
git commit -m "chore: update theme清单"
git push
```

## _themes.yaml 字段说明

| 字段 | 说明 |
|------|------|
| `slug` | Skill 名称，对应 `infocard-{slug}-style` |
| `css_class` | themes.html 里的 CSS class（如 q、green、black） |
| `position` | 页面内排列顺序（整数越小越靠前） |
| `title` | 页面标题 |
| `subtitle` | 副标题 |
| `description` | 卡片首行描述 |
| `keywords` | 芯片标签列表 |
| `swatch` | 5 个色块的 hex 色值 |
| `ref_links` | 参考页面 `[{title, href, note}]` |
| `preview_url` | iframe 预览 URL（首选，指向同域参考页） |
| `preview_img` | 截图预览路径（fallback，iframe 不可用时使用） |
| `note` | 底部注释 |

## 主题预览方案

### 首选：iframe 嵌入（已验证，2026-06-04）

- GitHub Pages 对同域 iframe 无 `X-Frame-Options` 或 `frame-ancestors` 限制
- 4 个主题参考页（Q/绿色/黑头/主骨架）实测全部成功嵌入
- 尺寸：780×480px，`loading="lazy"`
- 改主题风格后真实卡片自动更新，无需重新截图

**YAML 配置示例**：
```yaml
preview_url: ./docs/20260604-revfactory-harness-q-style.html
```

**rebuild_themes.py 渲染**：
```html
<iframe src="..." width="780" height="480" loading="lazy" title="..."></iframe>
```

### Fallback：截图嵌入

当 iframe 因跨域/CSP 不可用时，运行：
```bash
python3 scripts/capture_theme_previews.py
```
截取参考页首屏（780×480px），输出到 `docs/assets/images/themes/preview-{css_class}.png`。

**YAML 配置示例**：
```yaml
preview_img: ../assets/images/themes/preview-q.png
```

## 截图维护脚本

`scripts/capture_theme_previews.py`：Playwright 自动截取各主题参考页面首屏。

配置（脚本内）：
- `VIEWPORT_W = 780`：视口宽度
- `CROP_H = 480`：截图高度

参考页面对应关系：
- Q 版 → `20260604-revfactory-harness-q-style.html`
- 绿色 → `hermes-agent-learning-resources/index.html`
- 黑头 → `20260604-xi-an-34-floor-fraud/index.html`
- 主骨架 → `20260530-duix-avatar.html`
- 蓝色技术手册 → `claude-code-web-skill-stack-swiss-blue.html`

## grill-me 5 轮对齐结论

用户要求预览不只是色块 swatch，必须包含真实 UI 元素（结构/文字/布局/交互）。

最终选择：
- UI 元素范围：全 UI（结构+文字+布局+交互）
- 预览载体：Mini 信息卡（iframe 嵌入参考页面）
- 展示方式：直接嵌入主题卡片底部
- 内容：标志性元素（iframe）+ 换色固定套（swatch 色块）
- 技术方案：iframe 优先，截图作 fallback

## 2026-06-08 新增主题

- `mcp-forge-style`：enterprise AI gateway / protocol hub 主题。
- 注册链路：`_themes.yaml` + `themes.html` + `theme/mcp-forge.html`
- 公开样例：`docs/20260608-ibm-mcp-context-forge.html`

## 常见失败模式

- 只改了 `themes.html` 但没改 `_themes.yaml`：下次 `rebuild_themes.py` 会覆盖手写内容
- `rebuild_themes.py` 依赖 pyyaml：确保 `python -c "import yaml"` 可用
- 截图尺寸固定（780×480）：不适合超宽或超长页面
- iframe URL 变更：参考页面变动后更新 YAML 中的 `preview_url`

### 陷阱：TOC 列表硬编码导致新增主题不出现（2026-06-06 实测固坑）

**症状**：新增主题后 `themes.html` 下方"当前正式主题"列表里没有新主题，但 `themes/` 区块里已经正确出现。

**根因**：`rebuild_themes.py` 的 `render()` 函数里"当前正式主题"列表是写死的 5 条硬编码 HTML，不在 `_themes.yaml` 的循环里，每次 rebuild 不会自动更新。

**修复**：新增 `render_themes_toc(themes)` 函数从 YAML 动态生成 `<li>` 列表，模板硬编码列表 → `{themes_toc_html}` 占位符，`main()` 生成后传入 `render()`。从此任何主题新增/修改，TOC 都会自动同步。

**验证方法**：每次主题变更后，grep 确认"当前正式主题"列表里包含所有主题（包括新加的）：
```bash
grep "当前正式主题" themes.html -A 10 | grep "hardblue-style"   # 替换成新主题的 slug
```

## 主题改完必须直接 push（项目硬约定，2026-06-06）

用户在该项目上明确：**infocard-pub 的主题（_themes.yaml / themes.html / theme/*.html）新增或修改完成，必须直接 `git push origin main`，不要再等用户授权 push。**

- 完整闭环：编辑 `_themes.yaml` → 跑 `python3 scripts/rebuild_themes.py` → 写 `theme/{slug}.html` 演示页（如新主题） → `git add && git commit` → **`git push origin main`**（不等授权） → smoke test
- push 后 smoke test（**必做**，发布纪律）：
  1. `git status` 干净
  2. 三个 URL 全 HTTP 200：`https://ccwq.github.io/infocard-pub/themes.html` + `https://ccwq.github.io/infocard-pub/theme/{slug}.html` + `https://ccwq.github.io/infocard-pub/_themes.yaml`
  3. 浏览器访问 `themes.html` 做视觉验收：HARDBLUE 类 pill / swatch / keywords / iframe 内容齐全
- 该规则已沉淀到 fact_store fact_id=86（避免下次会话重复确认）。同类"项目级发布约定"如 red-teaming/cheatsheet-generate 等，先用 fact_store 查；没有再问用户。
- **反例**：曾因"高风险副作用须授权"原则犹豫不 push，导致用户要求"主题新增修改完成都要push"——证明项目级硬约定优先于通用 SOUL 规则。