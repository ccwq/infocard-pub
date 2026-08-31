# main-style Swiss Red/Blue Retheme + Rabase Conflict Notes

> 2026-06-27 session: two cards published (Aider + 牛肉项目雷达) using rebuilt main-style CSS. Captures confirmed specs, CSS variable reference, and git rebase pitfall.

## main-style CSS Variable Reference

Copy from any confirmed main-style card HTML (e.g., `docs/20260627-aider.html` or `docs/20260627-beef-radar-resume-scout.html`). These are the authoritative values as of 2026-06-27:

```css
:root {
  --swiss-red:    #E60012;   /* primary accent, section numbers, tags */
  --swiss-blue:   #1A3A5C;   /* banner, table headers, stat numbers */
  --swiss-bg:     #F2F2F2;   /* html body background */
  --swiss-paper:  #FFFFFF;   /* card page background */
  --swiss-ink:   #111111;   /* primary text */
  --swiss-mid:    #666666;   /* secondary text, subtitles */
  --swiss-line:   #111111;   /* dividers, card borders (always pure black) */
  --swiss-soft:  #F8FAFC;   /* alternating table rows */
  --swiss-soft-blue:  #EEF4FD; /* highlight box background */
  --swiss-soft-red:  #FFF2F3; /* quote box background */
  --swiss-soft-gray: #F4F4F4; /* tag-row background */
}
```

### Key Class Tokens

| Class | Description |
|---|---|
| `.banner` | 蓝底标题栏，底部 6px 红线 |
| `.banner-left` | 70×70 红底 emoji 方块，阴影内边框 |
| `.banner-title` | 36px / 900wt / 白字 |
| `.banner-sub` | 13px / `#8FB6D9` 淡蓝副标题 |
| `.tag-row` | 灰底标签行，2px 黑线底边 |
| `.stats` | 4-col grid，黑线分隔 |
| `.stat strong` | 18px / 900wt / `#1A3A5C` |
| `.stat span` | 10px / `#666` / 小标签 |
| `.hero` | 2-col 1.05fr/.95fr 对照面板 |
| `.hero-kicker` | 11px / 900wt / `#E60012` / 字间距 .08em |
| `.hero-title` | 18px / 900wt / `#1A3A5C` |
| `.hero-quote` | 左4px红线 + `#FFF2F3` 背景 |
| `.highlight` | 左4px蓝线 + `#EEF4FD` 背景 |
| `.highlight.red` | 左4px红线 + `#FFF2F3` 背景 |
| `.sec-num` | 34×34 红底白字 15px 900wt 圆形编号块 |
| `.flow-item` | flex:1 / 2px黑线 / 白底 / 11px 900wt |
| `.flow-arrow` | 20px / 14px / `#E60012` / 900wt |
| `.code-block` | `#1A1A1A` 底 / `#E9FFF3` 字 / 左4px红线 / 等宽字体 |
| `.compare-table` | 40% / 60% 列宽对照表 |
| `.footer` | `#1A1A1A` 深黑底 / 白/灰字 |
| `.footer-r` | `#E60012` 强调标签 / 右对齐 |

### Mobile Breakpoints

```css
@media (max-width: 720px)  { /* 2-col → 1-col, table → scroll */ }
@media (max-width: 400px) { /* banner-left 46×46, title 20px, gap 10px */ }
```

## Rebuild vs. Restyle Rule

**Rebuild** = structure + CSS from scratch, not a palette swap.

When retheming a card to main-style:
1. Copy the full `<style>` block from an existing confirmed main-style card
2. Adapt HTML class names to match (use the token table above)
3. Do NOT just swap `--hardblue-red` → `--swiss-red` in an existing hardblue CSS block
4. Verify the banner, stats, hero, section, flow, card, code-block, and footer all render correctly before claiming the retheme is done

**Confirmed rebuild canonical reference cards**:
- `docs/20260627-aider.html` — Aider, CLI tool, main-style
- `docs/20260627-beef-radar-resume-scout.html` — 牛肉项目雷达, Codex Skill, main-style

## Git Rebase Conflict Pattern (same as github-api-403 reference)

When `git pull --rebase` produces conflicts in `_index.yaml` and `index.html` (generated artifacts):

1. `git stash push -m 'temp unrelated files' -- <untracked-files-blocking-rebase>`
2. `npm run build` — regenerate the conflicted generated files
3. `git add _index.yaml index.html docs/<slug>.html docs/<slug>.html.meta.yaml`
4. `GIT_EDITOR=true git rebase --continue`
5. `GIT_HTTP_VERSION=HTTP/1.1 git push origin main`

Full details: `references/github-api-403-and-mobile-verification.md`

## Banner Emoji Block (main-style Default)

The `banner-left` emoji block (70×70, red bg, white text, box-shadow inset border) is the default banner element for main-style. Pattern:

```html
<div class="banner-left">AI</div>   <!-- for Aider -->
<div class="banner-left">🐂</div>   <!-- for 牛肉项目雷达 -->
```

Emoji in `font-size: 28px` on desktop, shrinks to 19px at ≤400px. White text on red `#E60012` background. The box-shadow `inset 0 0 0 2px rgba(255,255,255,.18)` gives a subtle border without a border declaration.

## Score Block Bars (main-style Component)

32×18px solid blocks, `#1A3A5C` for filled, `#ddd` for empty. Used as a visual scoring component. HTML pattern:

```html
<div class="score-row">
  <div class="score"></div>    <!-- filled = --swiss-blue -->
  <div class="score"></div>
  <div class="score"></div>
  <div class="score d"></div>  <!-- d = gray/empty -->
  <div class="score d"></div>
</div>
```

Note: neither Aider nor 牛肉项目雷达 card used score bars — this is a reusable component for rating/feature-matrix cards.
