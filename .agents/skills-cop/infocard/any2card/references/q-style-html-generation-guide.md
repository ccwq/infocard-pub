# Q-style HTML Generation Guide

**Purpose**: When generating a Q-style infocard, you MUST use this guide. A simplified card that "looks okay" is NOT acceptable — the first version of the data fraud detection card was rejected for being too shallow.

## Full Q-style Structure (非简化版)

```
body (米纸背景)
.hero (border:3px solid var(--line), border-radius:28px, background:var(--paper-2), box-shadow:var(--shadow))
  .hero-copy
    .kicker (border:2px solid var(--line), border-radius:999px, background:#fff3b7)
    h1 (clamp(28px,5.2vw,58px))
    .subtitle
    .hero-badges
      .pill (border:2px solid var(--line), border-radius:999px, background:#fff, box-shadow:3px 3px)
    .hero-stats (grid 4列)
      .stat (border:2px solid var(--line), border-radius:18px, background:#fff, box-shadow:4px 4px)
    .hero-visual (border:3px solid var(--line), border-radius:24px)
      img 或内联内容

.section (margin-top:28px)
  .section-head (grid: auto 1fr, gap:14px)
    .section-no (54x54, border:3px solid var(--line), border-radius:16px, background:#fff, box-shadow:5px 5px)
    .section-title
      h2
      p

.section-body variants:
  .intro-grid (4列) → .intro-card
  .method-grid (3列) → .method-card (带顶部accent色条)
  .case-grid (2列) → .case-card
  .scene-grid (4列) → .scene-card

Each card must have:
  border: 2px solid var(--line)
  border-radius: 18px (cards), 12px (chips)
  background: #fff
  box-shadow: 4px 4px 0 rgba(29,27,22,.08)
```

## CSS Tokens (必须全部定义)

```css
:root {
  --paper: #f8efd9;          /* 页面背景：暖米纸 */
  --paper-2: #fffaf0;          /* hero背景：象牙白 */
  --ink: #1d1b16;              /* 主文字：深棕墨 */
  --muted: #6b6254;           /* 次要文字 */
  --line: #28231d;             /* 边框线 */
  --shadow: 8px 8px 0 rgba(29,27,22,.14);
  --radius: 22px;             /* 大圆角 */
  --green: #9bdc77;
  --blue: #7cc8ff;
  --purple: #c7a2ff;
  --orange: #ffc45c;
  --yellow: #ffe36e;
  --red: #ff9a89;
  --teal: #7de3d6;
  --soft-green: #ebf8dd;
  --soft-blue: #e8f6ff;
  --soft-purple: #f1eaff;
  --soft-orange: #fff1d2;
  --soft-yellow: #fff8cc;
  --soft-red: #ffe9e4;
  --soft-teal: #e5fbf7;
}
```

## Common Mistakes (教训)

### Mistake 1: Simplified card structure (本次教训)
❌ 生成一个只有简单 grid + cards 的页面，没有 hero、section-head、section-no
✅ 必须包含：hero + section-head(编号+标题) + section-body

### Mistake 2: Content too shallow (本次教训)
❌ 每个方法只写一行标题
✅ 每个方法必须包含：
  - 方法名（h3）
  - 理论介绍（theory）- "是什么/为什么有效"
  - 常见用途（use）- "用在哪些场景"（每个用途≥3个具体场景）

### Mistake 3: Wrong background colors
❌ 只用 --paper 没有渐变层
✅ 必须有：
```css
background:
  radial-gradient(circle at 12% 12%, rgba(255,227,110,.34) 0 12%, transparent 13%),
  radial-gradient(circle at 84% 10%, rgba(124,200,255,.20) 0 9%, transparent 10%),
  linear-gradient(120deg, rgba(255,255,255,.68), transparent 45%),
  var(--paper);
```

### Mistake 4: Missing chips/accents
❌ 单色或无 chips
✅ 4色accent变体: green, blue, purple, orange, yellow, red, teal

### Mistake 5: Missing responsive breakpoints
必须包含：
```css
@media (max-width: 1050px) { ... }
@media (max-width: 720px) { ... }
@media (max-width: 400px) { ... }
@media (print) { ... }
```

## Q-style Layout Examples

### Hero layout (知识科普型)
- hero grid: hero-copy + hero-visual (右侧图/数字展示)
- hero-visual可以是数字统计、内联emoji组合、或示例图

### Method card structure (方法卡片)
```html
<article class="method-card" data-accent="yellow">
  <div class="method-body">
    <div class="method-top">
      <h3>方法名</h3>
      <span class="method-no">A1</span>
    </div>
    <span class="type-label theory">理论</span>
    <p class="method-theory">理论介绍文字...</p>
    <span class="type-label use">用途</span>
    <p class="method-use"><strong>场景A：</strong>具体应用...</p>
  </div>
</article>
```

### Method card CSS
```css
.method-card {
  overflow: hidden; display: grid;
  grid-template-rows: auto 1fr auto;
  border: 2px solid var(--line); border-radius: 18px;
  background: #fff; box-shadow: 4px 4px 0 rgba(29,27,22,.08);
}
.method-card::before {
  content: ""; height: 8px;
  background: var(--accent, #7cc8ff);
  border-bottom: 3px solid var(--line);
}
.method-body { padding: 14px; display: grid; gap: 8px; }
.method-theory {
  margin: 0; color: #222; font-size: 13px; line-height: 1.64;
  padding: 8px 10px; background: var(--soft-yellow);
  border-radius: 10px; border: 1.5px solid var(--line);
}
.method-use {
  margin: 0; color: #444; font-size: 12.5px; line-height: 1.56;
  padding: 8px 10px; background: #f5f5f5;
  border-radius: 10px; border: 1.5px dashed #aaa;
}
.method-use strong { color: var(--ink); font-weight: 700; }
.method-card[data-accent="green"] { --accent: var(--green); --soft: var(--soft-green); }
/* ... 其他颜色 ... */
```

## Verification Checklist
## Verification Checklist
Before committing a Q-style card:

- [ ] body has米纸gradient background (not just solid --paper)
- [ ] hero has 3px border + 28px radius + box-shadow
- [ ] section-head has section-no (编号方块) + section-title
- [ ] method-grid has 3列
- [ ] each method-card has ::before accent bar + method-theory + method-use
- [ ] theory/use labels visible with background colors
- [ ] 4+ section chapters (not just 2-3)
- [ ] chips/pills in hero-badges
- [ ] responsive breakpoints present
- [ ] save button fixed bottom-right

## Meta.yaml Critical Fields (2026-06-05 教训)

**Required fields for infocard-pub — missing any of these will break the build:**

```yaml
title: "卡片标题"                    # 必填
slug: "{YYYYMMDD}-{slug}"           # 必填，唯一标识符
path: "docs/{slug}.html"            # 必填，必须与实际 HTML 文件路径完全一致
date: "2026-06-05"                 # 必填，YYYY-MM-DD 格式
updated: "2026-06-05 18:58:12"     # 推荐：列表页显示完整时间（精确到秒）
category: "knowledge"                # 必填
tags: ["tag1", "tag2"]              # 必填，至少空列表 []
desc: "80-210字符摘要"               # 强烈推荐，影响首页展示
```

⚠️ **`updated` 字段决定列表页显示的时间精度：**
- 只有 `date: "2026-06-05"` → 列表显示 `2026-06-05`（无具体时间）
- 加 `updated: "2026-06-05 18:58:12"` → 列表显示 `2026-06-05 18:58:12`

**获取精确时间：**
```bash
git log -1 --format="%ci" -- docs/{slug}.html
# 输出：2026-06-05 18:58:12 +0800
```

## Browser Verification (2026-06-05 教训)

**Vision 工具局限性：** vision 工具在列表页截图时无法可靠识别小字号文本（日期时间）。不要依赖截图读取列表时间。

**可靠验证方法：**
```bash
# 1. 验证 index.html 中卡片数据
curl -s "https://ccwq.github.io/infocard-pub/index.html" | python3 -c "
import sys, re, json
html = sys.stdin.read()
match = re.search(r'home-index-data.*?(\{.*?\})\s*</script', html, re.DOTALL)
if match:
    data = json.loads(match.group(1))
    for card in data.get('cards', []):
        if 'target-slug' in card.get('slug', ''):
            print('_modified_date:', card.get('_modified_date'))
            break
"

# 2. 验证卡片页面 HTTP 200
curl -sI "https://ccwq.github.io/infocard-pub/docs/{slug}.html" | head -3

# 3. 浏览器 console 直接查（最快）
# browser_console: JSON.parse(document.getElementById('home-index-data').textContent).cards.find(c => c.slug === 'target-slug')?._modified_date
```

**Build 超时备用方案：**
- `npm run build` 在 foreground 超时（>180s）时，改用 background + notify_on_complete
- 如果 build 卡住超过 5 分钟，先 git commit/push 已有的产物，CI 会自动运行等效 verify
