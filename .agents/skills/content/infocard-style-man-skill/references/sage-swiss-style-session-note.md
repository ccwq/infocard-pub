# sage-swiss-style session note

> 2026-06-26 · 5 轮视觉评审 · 从图像参考精准复刻

## 来源

用户提供的参考图：Obsidian AI Skills cheat sheet（Swiss information layout，sage green + off-white + dark charcoal）。

## 设计语言固化

| Token | 值 | 用途 |
|---|---|---|
| `--bg` | `#F5F4EF` | 暖骨纸白 |
| `--paper` | `#FAFAF7` | 内容卡片底 |
| `--ink` | `#1C1C1A` | 主文字 |
| `--green` | `#5F7E62` | 鼠尾草绿主色 |
| `--green-deep` | `#3D5A42` | 深绿强调 |
| `--green-soft` | `#E9EDE7` | 浅绿填充 |
| `--muted` | `#6B6B63` | 次要文字 |
| `--muted-2` | `#9E9E94` | 更淡灰 |
| `--line` | `#D4D2C9` | 1px 细线 |
| `--line-strong` | `#B8B6AB` | 表头分割线 |
| `--fill` | `#ECEAE1` | 浅填充背景 |
| `--dark` | `#1E2620` | 深炭绿暗色块 |

**核心原则**：零圆角 · 零阴影 · 1px 细线 · 大留白 · 信息密度

## 视觉评审轨迹

### R1 (8.1/10)
- Judgment box 对比度：jb-val 用 --ink 近黑，浅绿背景上对比度不足 → 改为 --dark
- Watch badge 字号 10px 略小 → 改为 11px
- Hero summary 略长 → 精简

### R2 (8.5/10)
- Analysis section：边框框 → 纯背景色（更 Swiss）
- Next Steps 编号间距：9px → 6px
- Skill-desc 加 margin-left:26px 对齐表头

### R3 (8.5/10)
- Analysis 内边距：9px → 11px
- Judgment 行距改 padding:6px + 分隔线
- 全局外边距：32px → 20px（quiet zone）

### R4 (9.5/10) — 可发货线
- 主要问题：边框 → 背景色的整体方向正确
- LEVEL 列文字去掉绿色，改为无色粗体

### R5 (定稿)
- "Low" 风险值：#8B3030 红 → var(--muted) 中性色（低风险用红不符合语义）
- LEVEL 标签改为无色 700 weight

## 关键设计决策

1. **Analysis 区域**：去掉所有 border，改用 `--green-soft` 纯背景，接近 Swiss 的"区域用背景色区分"原则
2. **Judgment 行距**：用 `padding:6px 0` + 分隔线替代 margin-bottom，避免间距不一致
3. **风险值语义**：低风险用灰色（中性），不用红色（传统错误语义）
4. **Level 列**：无色粗体，不引入额外强调色

## 交付物

- `theme/sage-swiss.html` (17.5KB)
- `_themes.yaml` position 18
- `themes.html` 注册预览卡
- GitHub Pages: `https://ccwq.github.io/infocard-pub/theme/sage-swiss.html` ✅
- commit: `f87f22e`

## 与 archive-green 的关系

| | sage-swiss | archive-green |
|---|---|---|
| 定位 | 精准复刻参考图 | 独立主题 |
| 颜色 | 更精准（更接近参考图） | 类似但偏暖 |
| 布局 | 三栏网格 + 技能表 + 分析面板 | 略有差异 |
| commit | `f87f22e` | `bb48cd0` |
| 评分 | 9.5/10 | 9.6/10 |

两个主题视觉语言接近，但 archive-green 是独立设计探索，sage-swiss 是参考图精准复刻。
