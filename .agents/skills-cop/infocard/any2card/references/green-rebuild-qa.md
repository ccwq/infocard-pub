# Green-Style Infocard Rebuild — QA Notes

## Core Lesson (2026-06-03)
**"重建" ≠ 改 CSS 变量。重建 = 从头重写 HTML/CSS，不在旧文件上打补丁。**

When user says "重新生成" or "重建":
- Do NOT do a CSS variable swap on the existing file
- Do NOT add `--red:#0f766e` to the old CSS and call it done
- Must rewrite the full HTML/CSS from scratch using the target style system

## Bug: Header Gradient with Hardcoded Red
The red-black header used `background: linear-gradient(180deg, var(--red), #a90f27)`. Changing `--red` to green does NOT fix the bottom color (`#a90f27`). The header stays reddish because the fallback is hardcoded red.

**Fix**: The entire header CSS must be rewritten with a green gradient, e.g.:
```css
background: linear-gradient(180deg, var(--accent-2), var(--accent));
```

## Bug: Timeline Two-Column Grid on Mobile
The timeline used `grid-template-columns: 86px 1fr` which creates a two-column layout. On mobile, the right column (`.tl-text`) gets squeezed into a narrow column producing visually broken layout where text is compressed horizontally.

**Root cause**: `.tl` was a grid with two columns, but the mobile breakpoint only changed it to `grid-template-columns: 1fr` without removing the grid structure. The nesting `<div>` inside `.tl` also interfered.

**Fix**: Remove the grid from `.tl` entirely, restructure HTML so each `.tl` is a standalone card with no nested `<div>` wrapper:
```css
.tl { /* no display:grid */ padding: 10px 12px; }
```
Each timeline item becomes: date badge → title → description, stacked vertically.

## Mobile Verification Checklist
After any rebuild, verify at 390px viewport:
1. Header: single column, no red gradient bleed
2. Stats: 2×2 grid
3. Timeline: each item is a full-width stacked card, not two-column
4. Tables: convert to card-list stack, no squeezed columns
5. Save button: does not occlude content, `padding-bottom` on `.footer` provides clearance

## What "Green Style" Actually Means
Green style is not just `--red: #0d9488`. It requires:
- Full green token system (`--accent`, `--accent-2`, `--accent-dark`, `--accent-soft`)
- No red anywhere in CSS (search for `c8102e`, `a90f27`, `#e60012`, `#b3000f`)
- Header uses pure green gradient
- All section-head rules use green not red
- Download button uses green gradient

## Publishing Cycle
After local fixes:
```bash
git add -A && git commit -m "fix: description" && git push
# → almost always fetch-first rejection
git pull --rebase && git push
# → if conflict in _index.yaml:
python3 scripts/rebuild_index.py && git add _index.yaml && GIT_EDITOR=true git rebase --continue && git push
```