# Swiss Teal Style Guide (for infocard-pub)

## When to use this style
- Method sheets / ROI实证 / case study cards
- Agent Engineering / Codebase / Technical methodology topics
- Any card where 冷静/克制/可信比冲突/刺激更合适

## Color palette
| Token | Value | Usage |
|---|---|---|
| `--accent` | `#0d9488` | Teal (唯一的强调色) |
| `--accent2` | `#115e59` | 深 teal，用于文字标签 |
| `--black` | `#000` | 主文字 |
| `--white` | `#fff` | 页面底色（冷白/米白） |
| `--gray` | `#f5f5f0` | 暖白/米白 background |
| `--gray2/3/4` | 递减灰度 | 边框/分割/次要文字 |
| `--red` | `#e60012` | 错误/警告（不用在主强调） |
| `--yellow` | `#f59e0b` | 注意/提示 |

## Key design patterns

### Box top accent line
```css
.box{position:relative;overflow:hidden}
.box::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--accent)}
```

### Teal chapter bar
```css
.bar-item:first-child{background:var(--accent);color:var(--white)}
```

### ROI strip (black with white text)
```css
.roi-strip{display:grid;grid-template-columns:repeat(3,1fr);border:2px solid var(--black);overflow:hidden}
.roi-item{background:var(--black);padding:16px 14px}
.roi-val{font-family:'IBM Plex Mono',monospace;font-size:clamp(22px,4vw,30px);font-weight:900;color:var(--white)}
```

### Fixed right FAB button (teal, not red)
```css
.fab-save{position:fixed;right:16px;bottom:18px;z-index:30;background:rgba(13,148,136,.96)}
.fab-save:hover{background:#0d7c70}
```

### Bottom padding guard for FAB
Always add to `.footer` when FAB is present:
```css
.footer{padding:14px 24px 120px}  /* 120px = button height + safe gap */
```

## Typography
- 大标题: clamp(36px, 6vw, 56px) italic bold
- 中文主标题: clamp(22px, 3.5vw, 30px) bold
- 章节大编号: clamp(80px, 14vw, 120px) opacity:0.7
- 正文: 12.6–13.3px
- 标签: 10.5px 全大写字母间距

## Reference cards using this style
- `20260603-agent-friendly-codebase.html` — Lee Robinson 4原则 + ROI实证 + leerob.com/agents 插图

## Key difference from red-black style
Red-black = 冲突/压迫/高密度档案风
Swiss teal = 冷静/克制/编辑出版风/方法论页
不要在 teal 风格卡里使用红色 `--accent`。坚持单一强调色。
