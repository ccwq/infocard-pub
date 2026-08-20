# Theme Gallery 完整模式（2026-06-04）

## 文件架构

```
infocard-pub/
├── themes.html                      # 主题说明页（根级独立页，不进 _index.yaml）
├── _themes.yaml                    # 主题元数据单一事实源
├── scripts/
│   └── rebuild_themes.py           # 从 _themes.yaml 重建 themes.html
└── theme/                          # 各主题 UI 元素演示页（iframe 预览源）
    ├── q.html
    ├── green.html
    ├── black.html
    ├── main.html
    └── blue.html
```

## 维护流程（增删改查主题）

1. 编辑 `_themes.yaml`（添加 / 修改 / 删除 `themes[]` 条目）
2. 运行 `python3 scripts/rebuild_themes.py`
3. 同一 commit 提交 `_themes.yaml` + 新生成的 `themes.html`
4. push 后验证 Pages URL

**禁止手写 `themes.html`**，脚本重建会覆盖。

## iframe 预览规范（重要）

`theme/*.html` **不是真实信息卡**，是专门展示该主题 UI 元素的独立演示页。

`preview_url` 必须使用**相对路径**，不要用绝对 Pages URL：

```yaml
# ✅ 正确：相对路径
preview_url: ./theme/q.html

# ❌ 错误：绝对 URL
preview_url: https://ccwq.github.io/infocard-pub/docs/xxx.html
```

原因：绝对 URL 在 `themes.html` 被 `rebuild_themes.py` 重建后可能被截断或错误替换；相对路径始终有效。

## iframe 容器 CSS 规范

当 themes.html 中嵌入 iframe 作为主题预览时，**必须**同时设置固定高度，禁止滚动：

```css
.preview-wrap { overflow: hidden; border: 2px solid var(--line); height: 560px; position: relative; }
.preview-iframe { width: 100%; height: 560px; border: none; display: block; scrolling: no; overflow: hidden; }
```

常见错误：`height: 100%` + `overflow: auto` → iframe 内部出现滚动条，用户需要滚动才能看完内容。

正确行为：iframe 内容完整展示在 560px 高度内，底部溢出内容直接裁切，不需要滚动。

## 验证命令

```bash
# 本地验证 HTML 生成正确
python3 scripts/rebuild_themes.py

# 验证所有 5 个主题的 preview_url 都是相对路径
grep 'preview_url:' _themes.yaml
# 预期：全部以 ./theme/ 开头

# 验证 themes.html 中的 iframe 容器高度
grep 'preview-wrap\|560px' themes.html
# 预期：height:560px，无 380px

# 验证公网 Pages（等部署完成后）
curl -s 'https://ccwq.github.io/infocard-pub/themes.html?t=<ts>' | grep 'preview-wrap'
```

## rebuild_themes.py 核心结构

```python
# build_iframe() — 渲染 iframe 标签
def build_iframe(t):
    url = t.get('preview_url', '')
    if not url:
        return ''
    return (
        f'<div class="preview-wrap">'
        f'<iframe src="{url}" loading="lazy" '
        f'title="{t["title"]}" class="preview-iframe" referrerpolicy="no-referrer"></iframe>'
        f'</div>'
    )

# build_theme_block() — 组合完整主题卡片
def build_theme_block(t):
    swatch    = build_swatch(t.get('swatch', []))
    keywords  = build_keywords(t.get('keywords', []))
    ref_links = build_ref_links(t.get('ref_links', []))
    iframe    = build_iframe(t)   # ← 嵌入在 swatch 下方
    return f'''
      <article class="theme {t['css_class']}">
        ...
        <div class="theme-body">
          <p class="desc">{t['description']}</p>
          <div class="chips">{keywords}</div>
          <div class="swatch">{swatch}</div>
          {iframe}               # ← 预览 iframe
          <div class="samples">{ref_links}</div>
        </div>
        <div class="note">{t.get('note','')}</div>
      </article>
    '''
```

## theme/ 演示页内容矩阵

每个 `theme/*.html` 必须包含该主题的**标志性 UI 元素**，不是泛泛而谈。

| 文件 | 必须展示 |
|------|----------|
| `theme/q.html` | 暖米纸背景、厚黑 3px 边框、圆角 12px 卡片、彩色 pill/chip（绿/蓝/黄/粉）、三列 grid、两种按钮样式 |
| `theme/green.html` | teal 边框（2px solid #15803d）、绿底 stats 行、克制 pill、绿色列表行、两个按钮 |
| `theme/black.html` | #070707 黑色顶栏 + 红色底部边框（3px #c8102e）、红色引语块（border-left: 4px solid）、步骤流、红色判断区 |
| `theme/main.html` | 红黑白 badge、stats 4 列条、蓝黄绿 pill、section 区块（黑头）、table、flow 箭头流程 |
| `theme/blue.html` | 黑头 + 红蓝双强调、步骤进度条（5步）、能力矩阵 table（✓/✗）、红色警告块、代码块（pre） |

## grill-me 对齐流程（must follow）

当用户要求“主题预览改进”时，不要自作主张猜测技术方案。正确流程：

1. 启动 grill-me（≤5 轮），对齐需求后再执行
2. 本次决策路径：全 UI 元素 → Mini 卡 → 直接嵌入 → 标志性+换色双排 → iframe 嵌入
3. grill-me 结束后明确复述用户选择的方案
4. 如有不确定，先验证（如 CSP 测试）再执行

**典型错误**：用户说要 iframe，你确认了，但实现时因为“截图更简单”改用截图 → 用户纠正。

本次踩坑记录见：`references/2026-06-04-grill-me-iframe-vs-screenshot-correction.md`

## 关联 Skills

每个主题对应一个 Skill：
- `skills/content/infocard-q-style/SKILL.md`
- `skills/content/infocard-green-style/SKILL.md`
- `skills/content/infocard-black-head-style/SKILL.md`
- `skills/content/infocard-main-style/SKILL.md`
- `skills/content/infocard-blue-technical-manual-style/SKILL.md`
- `skills/content/infocard-hardblue-style/SKILL.md`（2026-06-06 新增，硬核蓝手册，blue 的"重装版"）

新增 / 删除主题时，同步更新对应 Skill。

## 主题区分判定：何时建新主题，何时归入已有主题

从一份真实卡片提取风格准备入清单时，**先与已有主题做差异判定**，再决定新建还是归入：

1. **同色系 + 同底色 + 同边框/版式 + 仅内容差异** → 归入已有主题（加 `ref_links` 即可）
2. **同色系 + 至少 2 项版式差异**（如：顶部 hero-bar 拼接 / 编号方块尺寸 / 网格底纹 / risk 顶部色带）→ **新建独立主题**
3. **不同色系** → 必建新主题

hardblue-style 之所以独立：与 blue-technical-manual-style 同色系（#111/#d80018/#1f63ff/#fffdf8/#f6f4ef），但有 5 项版式差异（hero-bar 三色拼接 / 42px 网格底纹 + 径向光斑 / 96px 编号方块 / 多 grid 变体 / risk 顶部色带）—— 满足"至少 2 项版式差异"，所以独立。

**反例警示**：若新主题与 blue 仅差 1 项（如只多了 hero-bar），应该归入 blue 的 `ref_links` 而不是单建主题，避免主题清单膨胀和用户选主题时困惑。