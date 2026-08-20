# Hardblue rebuild: amber color violation (2026-06-11)

## What happened
The Codex Orange Book card (20260611-codex.html) was published with amber/orange colors:
- `#ff8c00` hero-accent
- `#e65100` orange emphasis
- `#f59e0b` amber tones

The user rejected it: "未使用预设主题之一 重建 反思"

## Root cause
The "orange book" name triggered semantic matching ("orange → orange color") instead of theme-system compliance. The card was built from scratch with custom CSS that matched the repo's literal brand rather than the hardblue CSS token system.

## Rebuild outcome
Rebuilt from the Obscura card (docs/20260610-obscura.html) as the canonical hardblue template. The rebuilt card uses:
- CSS token system: `--red:#c8102e --black:#0a0a0a --white:#f5f2ec --blue:#0036a3`
- Body: dark background with grid texture
- Card: white with 3px #c8102e border
- Section numbers: 88×88px red (#c8102e) background
- Save button: red gradient `linear-gradient(#c8102e,#a10f25)`
- No amber, orange, purple, teal, or any color outside the token system

## Key lesson
Theme selection → theme-system compliance. "Rebuild" in infocard-pub means **structure + CSS reconstruction from the template**, not color palette extraction from the source repo.

The correct sequence for a hardblue rebuild:
1. Read `docs/20260610-obscura.html` for the CSS token system and HTML skeleton
2. Copy the `<style>` block as-is (all CSS variable declarations + class names)
3. Replace the `<body>` content with the new repo's facts, keeping all class names identical
4. Verify: grep the output HTML for `#ff8c00` `#e65100` `#f59e0b` `#f59e0b` → must find zero matches

## Canonical hardblue reference
- CSS template: `docs/20260610-obscura.html` (infocard-pub main repo)
- Theme definition: `_themes.yaml` slug `hardblue-style`
- Key classes: `.hero` `.header` `.kicker` `.title` `.chips` `.chip` `.alert` `.stats` `.stat` `.section` `.section-no` `.section-meta` `.section-label` `.section-h2` `.lead` `.grid2` `.grid3` `.grid4` `.cardbox` `.cardbox.dark` `.cardbox.blue` `.cardbox.soft` `.cardbox.green` `.mini` `.tag` `.tagrow` `.code` `.quote` `.footer` `.small` `.save`

## Color hard rules for hardblue
| Allowed | Forbidden |
|---------|----------|
| `#c8102e` (red) | `#ff8c00` (orange) |
| `#0a0a0a` (black) | `#e65100` (deep orange) |
| `#f5f2ec` (warm white) | `#f59e0b` (amber) |
| `#0036a3` (blue) | `#f59e0b` variants |
| `#006b3c` (green) | `#9c27b0` (purple) |
| `#e8c200` (yellow) | `#00bcd4` (teal) |
