---
name: infocard-visual-pass-loop
description: "Screenshot-and-fix loop when 200 passes but theme is broken."
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, visual-verification, theme, hardblue, darkblue, hard-gate]
    related_skills: [infocard-publish-sop, theme-visual-reference-workflow]
---

# Infocard Visual Pass Loop

The missing chapter between `npm run build` → `HTTP 200` and `PUBLISHED`.

## When this skill applies

- The card builds without errors.
- `curl -I <url>` returns 200.
- BUT the user says "样式丢了" / "主题不对" / "看起来像长文" / "hero bar 没出来" / "卡片没背景".
- OR the agent itself is unsure the theme is actually applied.

In any of these cases: **do not push again yet**. Run this loop.

## The loop (non-negotiable)

1. **Screenshot** the live URL or local preview (see `scripts/capture-infocard-screenshots.sh`).
2. **`vision_analyze`** with a "list every defect as CRITICAL/MAJOR/MINOR" prompt.
3. **Block** if any CRITICAL or MAJOR defect remains.
4. **Fix** the HTML / CSS (most common fixes below).
5. **Re-screenshot**, re-analyze.
6. **Promote to PUBLISHED only when 0 critical / 0 major on both desktop (1280×1800) and mobile (720×1600).**

`HTTP 200` and `npm run build` success are NEVER sufficient evidence of completion.

## Common fixes when the visual gate fails

| Symptom | Root cause | Fix |
|---|---|---|
| Plain text rendering, no colors, mojibake | `<style>` block missing from final HTML | Rebuild full HTML: head + inline style + body. Never split across files. |
| Hero bar absent | `.hero-bar` rule not in template CSS | Add `.hero-bar{height:14px;border-radius:999px;background:linear-gradient(...);...}` to the template. |
| Sections float without container | `.section`, `.card`, `.grid-2`, `.risk-grid` not defined | Add `background+border+box-shadow` rules to each container class. |
| Theme not dominant | Wrong template cloned | Confirm `theme/<style>.html` matches the meta's `style:` field before cloning. |
| Mobile overflow / illegible | No `@media (max-width: 720px)` rules | Add responsive rules to collapse grid columns to 1fr. |

## Capture script

See `scripts/capture-infocard-screenshots.sh` for the verified Chrome headless invocation. It follows `chrome-automation-safety`: per-run temporary profile, no broad process cleanup, and no default `--no-sandbox`. Always:
- pick a free port (`4183`, `4184`, ...);
- `curl -sI` to verify the preview before screenshotting;
- bust cache with `?v=<n>` query on every retry.

## Verification report format

When reporting completion, MUST include:

```
Visual pass:
- desktop 1280×1800: <count> screenshots, 0 critical, 0 major
- mobile 720×1600: <count> screenshots, 0 critical, 0 major
- commit: <hash>
- cache-bust URL: <url>?cb=<hash>
```

Without this report, the card is `视觉未通过 — 待修复`, NOT `已发布`.

## Infrastructure failure boundary

A page identity check is necessary but not visual evidence. If URL/title/`readyState` and DOM checks succeed while `Page.captureScreenshot` times out, classify the run as `SCREENSHOT_TIMEOUT` / `VISUAL_PENDING` unless a readable screenshot is actually produced and reviewed. Do not upgrade HTTP 200, CSS/theme signatures, or `scrollWidth == clientWidth` into a visual pass.

Before retrying, confirm the exact target identity and use one fresh owned target for a viewport capture; do not blindly repeat full-page captures. If the fallback capture path also times out or produces no verifiable PNG, retain the pending state and report the concrete infrastructure failure. A publication that proceeds under an approved infrastructure-only fallback must remain `PUBLISHED_PENDING_VISUAL`, never `PUBLISHED` with an implied visual pass.

When using `live-server`, its configured port may already be occupied and the server may auto-select a different port. Read the actual serving URL from the server output, verify that URL with `curl`, and use the same port for browser review. Never review a stale page on the originally requested port.

## Related

- `references/pitfalls-20260728-visual-gate.md` — full incident transcript of the 2026-07-28 case.
- `infocard-pub-hardening` — additional screenshot and preview hardening notes (currently user-owned; adopt before autonomous edits).

## Deprecated compatibility entry

此旧入口仅作兼容转发，替代入口为 `infocard-quality-gate#repair-loop`。同一失败类别最多自动修复两轮，每轮后必须回到统一质量门禁。
