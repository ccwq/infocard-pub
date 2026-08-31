---
name: infocard-theme-validation
description: Use when changing infocard theme CSS or pushing docs.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, theme, validation, verification]
    related_skills: [infocard-crayon-style, web-visual-acceptance, pkwork]
---

# infocard-theme-validation

Use when modifying an `infocard-*-style` theme HTML/CSS or pushing theme-driven docs updates to `infocard-pub`. Loads after the active theme skill (`infocard-crayon-style` etc.) to enforce the user-mandated verification chain. Do not skip a step; do not treat any subset as "complete".

## Inputs

- Theme HTML/CSS path (e.g. `theme/crayon.html`) and one or more `docs/<slug>.html` targets
- Desktop viewport (default 1440×900) and mobile viewport (default 390×844)
- Public URL pattern (`https://<user>.github.io/<repo>/docs/<slug>.html`)

## Mandatory checks (all required, no exceptions)

1. **Layout intent** — Before editing: confirm scope boundary. Theme edits live in `theme/`. Docs HTMLs are out of scope unless the user explicitly approves the theme-to-docs regression sweep.
2. **Geometry (playwright)** — Capture `card-num` / `card-stripe` / `card-body` `getBoundingClientRect` at both viewports. Required tolerances:
   - Desktop: `card-num.right - card-stripe.left ≈ 4px`, `card-num` is `.skill-card` direct child
   - Mobile (≤720px): same 4px tolerance with the mobile key values
3. **Visual (vision_analyze)** — `score` + critical/major/minor list. Failing to produce this means the change is NOT done.
4. **Edge pixels (PIL)** — `Image.open(screenshot).getpixel((0,0))` etc. must equal the theme background RGB.
5. **HTML structure invariant** — `card-num` and `card-stripe` are direct children of `.skill-card`. Inline overrides (`left:72px`, `font-size:10.5px`, `padding-bottom:18px`, `min-height:0`) are forbidden except for the special deprecation card where `left:96px` replaces `left:72px`.
6. **Global defenses** — `html,body{margin:0;padding:0}` and `*,*::before,*::after{box-sizing:border-box}` must be present so external pages do not reintroduce white margins.
7. **Public HTTP** — `sleep 25` then `curl -fsS` for each affected slug; must be 200; key CSS substrings (`grid-template-columns:100px`, `left:96px`, `padding:0 32px`, mobile `72px / 68px`) must be findable in the served HTML.
8. **Build** — `npm run verify` and `npm run check-leak` pass.
9. **Push** — Only after 1–8 are all green; commit messages follow Conventional Commits; mention affected slugs.

## What "complete" means

The user treats a change as complete only when **all nine checks are green**. Reporting "PASS" with only 1–8 satisfied and visual review pending is treated as a defect. After any user-visible theme change, the docs regression sweep must be planned with `pkwork` (3 roles, ≤4 rounds, theme demo unchanged unless explicitly authorized).

## Failure modes to watch

| Symptom | Cause | Fix |
|---|---|---|
| White border at top/left/right | `html, body` default margin or fixed-width `.poster-shell` | Force `html,body{margin:0}` and `width:100%` |
| Numbers cluster on the right side | `card-num` nested inside `card-body` | Move `card-num` out as a direct sibling of `.skill-card` |
| Numbers and vertical line touch | Grid column too narrow / padding-right too small | Use the exact values in the active theme skill's references file |
| Number not vertically centered | `align-self: start` left over from earlier revisions | Set `align-self: center` |
| Mobile shows small chip-sized numbers | Earlier `font-size:10.5px` override still in CSS or inline style | Delete the override; trust the theme's `.card-num` rule |
| GitHub Pages still shows old version | Cache | Wait 25–60 s after push; re-check with curl |
| Theme looks like a plain long article, not an infocard | Hero / section / card / grid skeleton lost during content rewrite | Rebuild the theme skeleton first, then reflow content into section blocks and cards |
| Bulk rewrite gets trapped by approval or partial overwrite | Replacing a large HTML subtree in one shot | Split into small, reviewable patches; verify file integrity after each step |
| Template edits break structure | Patching paginated/partial reads or matching mid-block CSS | Re-read the full file before large replacements; patch only stable anchors |

## Cross-references

- `infocard-crayon-style` → `references/poster-visual-principles.md` (R6 visual + geometry rules)
- `web-visual-acceptance` (qa) — broader acceptance framework; this skill is the theme-specific enforcement
- `pkwork` (software-development) — required for any multi-doc theme regression sweep
- `references/20260728-theme-rebuild-pitfalls.md` — this session's darkblue skeleton-loss and safe patching notes