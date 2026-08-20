---
name: infocard-archival-theme-refinement
description: Refine existing infocard themes that use Swiss, archival, editorial, or high-density information layouts. Focus on controlled ornamentation, preserving reading flow, and asking the user to choose a decorative direction before adding visual extras.
---

# Infocard Archival Theme Refinement

Use this skill when the user wants to *tune*, *refine*, or *decorate* an existing infocard theme, especially Swiss / archival / technical-manual styles.

## Reference-image-driven rebuild workflow

When the user provides a reference image and asks to "recreate" or "rebuild" a theme based on it, treat this as a **from-scratch theme creation** task, not a theme refinement task. Load this skill but follow the rebuild workflow below instead of the ask-first/decorate workflow.

### Phase 1: Image analysis (vision tool)

1. Call `vision_analyze` on the reference image with a question focused on: layout structure, column proportions, font sizes, spacing ratios, color palette (hex values), border/divider language, and overall visual density.
2. Extract design tokens: background color, accent color(s), text colors, font family(ies), font size ladder, spacing units, border radius, shadow language.

### Phase 2: From-scratch HTML/CSS build

Write `theme/<slug>.html` **in one shot** — do not incrementally patch an existing file. The from-scratch approach ensures the reference's design language is captured as a complete system, not as modifications to a prior theme.

Target path: `/home/ccwq/qbox/opendir/project/infocard-pub/theme/<slug>.html`

### Phase 3: Verification gate (MUST pass before reporting)

After every code change:

1. **`ls` the target path immediately**: `ls -la /home/ccwq/qbox/opendir/project/infocard-pub/theme/<slug>.html` — confirm the file exists at the **correct path**, not just anywhere. This catches directory errors when working directories change between sessions.
2. **Start live-server**: `npx live-server --port=5588 --host=0.0.0.0 --no-browser` in the repo root. Verify HTTP 200 via `curl -s -o /dev/null -w "%{http_code}" http://10.6.8.14:5588/theme/<slug>.html`.
3. **Browser screenshot**: `browser_vision` or `google-chrome --headless=new --screenshot=/tmp/preview.png --window-size=1280,900 <URL>`.
4. **Report LAN preview URL** to the user immediately after the screenshot. Do not wait to be asked.
5. **User review**: wait for user feedback. Each round of review counts as one of the agreed maximum rounds. Honor the cap.

### Review cap

If the user says "up to N rounds of image review", count each screenshot feedback round against N. Stop when N is reached unless the user explicitly extends.

### After review passes

1. Add entry to `_themes.yaml`.
2. Run `python3 scripts/rebuild_themes.py` to regenerate `themes.html`.
3. Commit `theme/<slug>.html`, `_themes.yaml`, `themes.html` together.
4. Push and verify public URL.

## Core rule
Do not add decoration blindly. First infer whether the page should stay minimal or gain a stronger editorial signal.

For **reference-image-driven theme recreation**, rebuild from scratch instead of recoloring an existing card. Extract the typography, spacing rhythm, grid balance, source-bar density, and accent language from the image first, then design a fresh HTML/CSS system around those tokens.

## Default reading
For archive-style layouts, default to **minimal / archival**.

## Ask-first workflow
If the user says things like:
- "add some decorative elements"
- "make it less plain"
- "give it more character"
- "make it feel higher-end"

ask one clarifying question before editing:
- minimal / archival
- editorial / label-heavy
- stronger brand signal

Recommend **minimal / archival** unless the brief clearly wants more visual assertion.

If the user explicitly supplies a reference image and asks for a similarity-based rebuild, treat the image as the source of truth and stay within the requested review budget. When they say a maximum number of image-review rounds, honor that cap rather than continuing to polish past the agreed budget.

## Safe decorative elements for archival layouts
Prefer ornamentation that reinforces structure instead of competing with the content:
- thin rules and section dividers
- corner ticks or frame lines
- small uppercase badges
- low-opacity watermark text
- numbered anchors like `01`, `02`, `03`
- source bars or metadata strips
- narrow label bands that align to the grid

## Avoid by default
- large poster-like motifs
- extra accent colors
- heavy shadows or gradients
- rounded UI chrome on an otherwise sharp layout
- decorative flourishes that interrupt reading flow

## Implementation note
When the user wants "more decoration," keep the base grid, typography, and content hierarchy intact. Add ornamentation at the edges first. Only escalate to stronger visual devices if the user explicitly chooses that direction.

## Reference files
- `references/archive-green-decorative-elements.md` - session note on safe ornamentation for Swiss / archival infocards.
- `references/reference-image-archival-rebuild-pattern.md` - image-driven Swiss/archival rebuild pattern: from-scratch reconstruction, token extraction, and capped review rounds.
- `references/theme-creation-from-reference-image-workflow.md` - 从零复刻参考图主题的完整工作流：目标路径、live-server host 参数、截图方法、评审轮次上限规则。
