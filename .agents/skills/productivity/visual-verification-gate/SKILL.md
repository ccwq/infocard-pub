---
name: visual-verification-gate
description: "Use before publishing any card or cheatsheet."
version: 1.2.0
date: "2026-08-26"
---

# Visual Verification Gate

## Purpose

`HTTP 200` + `npm run build` success are **NEVER** sufficient evidence of a finished card. This skill owns the verification loop and the recurring CSS defects that break shipped themes on long-Chinese titles and narrow viewports.

It complements `infocard-publish-sop` (which defines the gate) by capturing the **defect recipes** the gate catches.

This gate consumes the current revision's screenshots, DOM/geometry and theme evidence, then returns `VISUAL_PASSED`, `VISUAL_BLOCKED`, or `VISUAL_PENDING`. It does not own promotion, preview-server troubleshooting, research, or CSS design time; those remain separately timed stages.

## When to load

- Before `npm run build` for any new card / page / cheatsheet.
- After any CSS or template edit, before re-running build / push.
- After any content edit that changes HTML structure (new sections, new tables, new timeline blocks, new grid components), before re-running build / push.
- Whenever the user complains about "样式丢失 / 主题没生效 / 移动端错乱".

## Any HTML modification re-triggers the full gate

`HTTP 200` + a previously-passing visual review do NOT cover subsequent HTML edits. The visual gate must re-run after **every** modification:

- After first review passes, the gate is **closed** — not preserved.
- New section added by subagent handoff (Research A enrichment, Authoring patch) → re-run gate.
- Patch to fix mobile overflow → re-run gate.
- Content string change that adds tables, links, or images → re-run gate.
- After gate re-runs, the new defect list must again show `0 critical / 0 major` before commit/push.
- The 5-attempt `PUBLISHED_PENDING_VISUAL` fallback does not carry over from a previous successful run — it only applies when the current run's vision tool itself fails 5x.

**Anti-pattern to avoid**: main thread treats "small" follow-up patches (terminology enrichment, link correction, copy fixes) as below-the-gate because the first review already passed. The first review covered the version it reviewed; it does not cover the patched version.

## ChatGPT Web final fallback

After the primary visual route has exhausted its differentiated infrastructure retries, and static/DOM/page-identity gates pass without any actual visual `critical`/`major` result, ChatGPT Web may be used as the final fallback. Follow `chatgpt-web-skill`'s `references/visual-review-fallback-spec.md` for session, upload, result, evidence, and cleanup rules. Do not use the fallback to bypass a real visual defect. The fallback must return structured `critical / major / minor` results for desktop and mobile; otherwise keep `VISUAL_PENDING`.

## Batch theme diversity hard gate

For a batch of two or more cards, visual review must record the selected theme and implementation fingerprint per card. Same-theme reuse is not accepted as visual evidence by itself; it requires the approved `same_theme_exception`. If the target theme has changed after the screenshot, all prior evidence is invalid and the card must be re-rendered.

## Incident hardening: no current visual evidence, no push

The following are mechanical preconditions only, never visual PASS evidence: build success, HTTP 200, DOM/accessibility snapshots, CSS/class presence, and `scrollWidth == clientWidth`.

Before the first push of every card, require a current rendered screenshot manifest covering desktop and 390px mobile, with Hero, ordinary body, every table/matrix, code/deployment, risk, and footer/control regions. Each required image must have an explicit `critical / major / minor` disposition; any critical or major defect blocks push. If capture or analysis infrastructure fails after differentiated retries, keep `VISUAL_PENDING` and do not push unless an explicitly authorized pending-visual release path is used.

Any HTML/CSS/structure/content change invalidates all prior visual evidence. Re-render the exact public URL after CDN propagation and re-audit after every publish repair. For multi-card batches, track evidence per card; never infer batch visual status from HTTP 200 or one card's PASS.

## The non-negotiable loop

1. Render the target HTML at **desktop (1280px)** AND **mobile (480px / 720px)**.
2. For a long page, capture evidence by region rather than trusting one full-height image: Hero, ordinary body, every table/matrix/risk region, and page end/control. A full-height capture may be retained as supplementary evidence but is not the sole review input.
3. Route screenshot capture through `web-capture`. **Do NOT use `browser_exec` built-in `cdp()`** — it repeatedly times out on `Page.captureScreenshot` calls (confirmed 2026-08-26 across 5+ cards).

   Desktop capture via `web-capture` preset `pc` or `desktop`.
   Mobile capture via `web-capture` preset `mobile`.
   Tablet capture via `web-capture` preset `tablet` when needed.
   `web-capture` owns the runtime-configured `agent-browser` endpoint tab selection, viewport switch, geometry checks, and PNG output path.

4. Run `vision_analyze` on each screenshot. Demand an explicit `critical / major / minor` defect list. Screenshot delivery to the user is evidence-sharing or requested human review; it never substitutes for the Agent's disposition.

   Classify only observable release defects as critical/major: clipping, overlap, missing text, unreadable contrast, broken responsive layout, unintended overflow, or controls obscuring content. Treat subjective suggestions (different shadow, border weight, or stylistic preference) as minor unless they produce one of those observable failures. If an assessment is ambiguous, recapture the affected region at the same viewport and ask a narrow, defect-specific question before editing; do not let fluctuating aesthetic commentary trigger unbounded CSS churn.
5. If vision infrastructure fails, retry up to five times with a different strategy each time: split the image/region, reduce size, recapture the affected region, or switch to an actually available visual entrypoint. Do not spend retries merely rephrasing the same prompt. From the second failure, record input, strategy, error category, and outcome in run-local evidence.
6. If any `critical` or `major` defect remains, BLOCK publish. Label `视觉未通过 — 待修复`.
7. After any repair, repeat from step 1. Only `0 critical / 0 major` may promote to `PUBLISHED`.
8. After five infrastructure-only failures, static checks may be reported as passed but visual status is `VISUAL_PENDING` / `PUBLISHED_PENDING_VISUAL`, never visual pass.
9. After any HTML edit that touches structure (new section, new table row, new timeline block, new grid component, content enrichment patch), repeat from step 1. The first review is invalidated by the edit, regardless of how "small" the change feels.

## Recurring defects (darkblue / hardblue templates)

See `references/darkblue-template-pitfalls.md` for the full list and CSS fixes. Top three:

### A. `.title` line-height collision
Template ships `.title { line-height: .92; letter-spacing: -.07em }`. Long Chinese titles (≥ 18 chars, or with「」/？/：) overlap visually.

**Override:**
```css
.title { line-height: 1.22; letter-spacing: -.02em; font-size: clamp(34px, 5.6vw, 76px); }
@media (max-width: 768px) {
  .title { line-height: 1.36; letter-spacing: -.01em; font-size: clamp(28px, 8.4vw, 42px); }
}
```

When patching, watch for **duplicate line-height**: the template often has `line-height: .92` AND your override — the later one wins. Verify with `grep -A 4 '^.title{'`.

### B. Mobile grid does not auto-collapse
The shipped `@media (max-width: 720px)` only handles `.hero / .feature-row / .visual-grid`. Cards using `.grid-2 / .grid-3 / .matrix / .risk-grid` stay multi-column on mobile.

**Fix:** add `grid-template-columns: 1fr !important` for these selectors in a `@media (max-width: 768px)` block. The `!important` is required to beat `repeat(auto-fit, minmax(220px, 1fr))` rules defined later in the cascade.

### C. Structural DOM failure can masquerade as a CSS overflow bug
A screenshot where a card heading is inside its border but the description appears to the right or below is usually malformed HTML, not a missing `overflow-wrap` rule. Before iterating on CSS, inspect the exact section and verify that every card's heading and paragraph are descendants of the card element. A premature `</div>` or `</h4>` can turn the paragraph into a grid sibling; `min-width:0`, `max-width`, `overflow:hidden`, and `word-break` will not restore the intended ownership. Prefer replacing the affected block with a known-good sibling structure such as `.grid-3` + `<article class="card">` with properly nested `<h3>` and `<p>`. Use browser `parentElement` inspection when possible, then re-screenshot desktop and mobile.

### D. Python heredoc `str.replace` silently fails
`python3 - <<'PY' ... PY` may interpret escape sequences so `replace` returns 0 without raising. The patch "succeeds" but the file is unchanged.

**Always grep after the heredoc:**
```bash
grep -c '<new pattern>' docs/<slug>.html
```
Or prefer the `patch` tool for targeted CSS edits — its diff makes success/failure unambiguous.

## Verification checklist (run before every publish)

### Release-specific fingerprint

After build, verify `dist/docs/<slug>.html` contains a newly introduced, release-specific phrase or structural token. After Pages propagation, fetch the public URL and verify the same fingerprint. HTTP 200 and build success prove transport, not that the current revision is being served.

### Verification checklist — screenshot capture (2026-08-26)

All screenshots use **`agent-browser` with the runtime-provided endpoint**:

```bash
# Desktop 1280×900
agent-browser tab <id> && set viewport 1280 900 && screenshot <path>/desktop.png
# Mobile 390×844
agent-browser tab <id> && set viewport 390 844 && screenshot <path>/mobile.png
```

- [ ] desktop 1280px screenshot: no critical/major
- [ ] mobile 720px screenshot: no critical/major, grids collapsed to single column
- [ ] mobile 480px screenshot: no critical/major, title readable, no overflow
- [ ] live URL re-screenshotted after push (CDN cache, 80s wait)
- [ ] vision_analyze returned explicit critical/major/minor lists, not just descriptions
- [ ] if this is a re-review after a content patch (not the initial publish), confirm the patch itself is visible in the screenshot (new section number, new link, updated text) — not the previously-reviewed version

## Public-versus-local evidence boundary (2026-08-03)

A local render pass does not promote a public page to visual PASS. After any HTML/CSS rebuild:

1. Review the exact local candidate at desktop and 390px first.
2. Build, commit, and push only after local critical/major defects are zero.
3. Re-open the exact public URL with a cache-busting query and verify the served HTML contains the new structural signatures (`data-theme`, target section count, code-block/risk classes).
4. Capture and review the public page again at desktop and 390px. If the public visual capture or analysis fails, keep the terminal state `VISUAL_PENDING`; do not convert local PASS + HTTP 200 + DOM checks into public visual PASS.
5. Record local and public evidence separately, including commit SHA, public `age`/`last-modified` when available, viewport, screenshot path, and critical/major/minor disposition.

A tool timeout is infrastructure evidence, not a visual pass and not a visual fail. Retry through a different capture route (fresh CDP target, region capture, or a different available vision entrypoint) only when the route is actually available; after the retry budget is exhausted, report `VISUAL_PENDING` explicitly.

**Theme regression guard:** if a page previously rendered as white/raw HTML, inspect both CSS selector ownership and HTML class alignment. A valid theme token block alone is insufficient; the rendered DOM must use the same theme's structural classes for hero, section headers, tables, code blocks, and risk panels.

## Don't do

- Don't trust `HTTP 200` as completion evidence.
- Don't skip the mobile screenshots because desktop looks fine.
- Don't bundle worktree cleanup into the publish pipeline — it's a separate destructive action.
- Don't substitute the 5-attempt timeout fallback (`PUBLISHED_PENDING_VISUAL`) for skipping review on a happy-path release.
- Don't commit + push a follow-up patch without re-running the gate. The first pass covered the first version; the patch invalidates that pass.
- Don't claim "small change, no need to re-screenshot" — the user has corrected this exact anti-pattern (visual review must precede every commit, including follow-up enrichment patches).

## Visual failure exception policy (VISUAL_EXCEPTION_AFTER_MAX_REPAIRS)

The visual gate may be passed by explicit exception after **at least 3 recorded visual failure attempts**; 4 or more attempts also qualify. Attempts include real visual defects and screenshot/capture/visual-review infrastructure failures. Infrastructure failures count as attempts, but are not completed repair rounds and must record an explicit evidence gap without fabricated screenshots or review dispositions.

**Counting rule:** A completed repair round counts only when:
1. A real HTML/CSS/content/structure change was made (`change_made: true`), **AND**
2. Fresh desktop AND mobile screenshot evidence was captured afterward, **AND**
3. A fresh review disposition was recorded.

Every failure attempt must have deterministic `name`, `type` (`visual_defect` or `infrastructure_failure`), and `outcome`. The manifest must record `visual_failure_attempts` and valid completed `repair_rounds`; fewer than three attempts, missing/malformed/unrecorded attempts, stale evidence, or `VISUAL_PENDING` remain blocked.

**Exception manifest contract:**

Add a top-level `visual_failure_attempts` array. Each entry is `{ "name": "...", "type": "visual_defect" | "infrastructure_failure", "outcome": "..." }`; infrastructure entries also require `evidence_gap: true` and `error_category`, and must omit screenshots/review dispositions.

```json
{
  "target": "docs/<slug>.html",
  "html_sha256": "<current-sha256>",
  "review_status": "VISUAL_EXCEPTION_AFTER_MAX_REPAIRS",
  "theme_match": true,
  "repair_rounds": [
    {
      "attempt": 1,
      "repair_completed": true,
      "html_sha256": "<same-sha256>",
      "desktop": { "critical": 1, "major": 1, "minor": 0, "screenshot_path": "/path/to/desktop-1.png" },
      "mobile":   { "critical": 1, "major": 1, "minor": 0, "screenshot_path": "/path/to/mobile-1.png" }
    },
    {
      "attempt": 2,
      "repair_completed": true,
      "html_sha256": "<same-sha256>",
      "desktop": { "critical": 0, "major": 1, "minor": 2, "screenshot_path": "/path/to/desktop-2.png" },
      "mobile":   { "critical": 0, "major": 0, "minor": 0, "screenshot_path": "/path/to/mobile-2.png" }
    },
    {
      "attempt": 3,
      "repair_completed": true,
      "html_sha256": "<same-sha256>",
      "desktop": { "critical": 0, "major": 0, "minor": 2, "screenshot_path": "/path/to/desktop-3.png" },
      "mobile":   { "critical": 0, "major": 0, "minor": 1, "screenshot_path": "/path/to/mobile-3.png" }
    }
  ]
}
```

- `repair_rounds` must contain completed repair records; its length is not the failure-attempt count and is not required to be exactly 3.
- Each record must set `repair_completed: true`, `change_made: true`, and use sequential `attempt` values; these fields make repair evidence deterministic rather than dependent on prose.
- `visual_failure_attempts` must contain at least 3 valid records for the exception, and may contain 4 or more.
- Every round's `html_sha256` must match the manifest root `html_sha256` (evidence binding to the reviewed HTML).
- Every round must have both `desktop` and `mobile` objects with `critical`, `major`, `minor` numbers and a `screenshot_path` string.
- `review_status` must be the exact string `"VISUAL_EXCEPTION_AFTER_MAX_REPAIRS"`.
- Fewer than 3 recorded failure attempts, missing evidence, stale hash, malformed records, or `VISUAL_PENDING` **fail the gate** — no automatic upgrade. The exception report must disclose the evidence gap and must not claim visual PASS.

**No automatic retry loop:** The mechanical validator (`scripts/verify-visual-gate.js`) does not edit HTML, recapture, or re-review. The publisher/agent owns each repair action; the validator only checks the declared evidence and final disposition.

**Non-visual gates are unaffected:** `theme_match=false`, hash mismatches, build failures, leak checks, taxonomy failures, and Git policy violations all remain blocking regardless of visual exception status.

**Final report wording** (use verbatim after an exception release):

> 视觉门禁：三轮修复后例外放行。已完成 3 次"修复 → 重新截图 → 重新审查"；最终仍遗留 critical=N、major=N、minor=N。该放行仅适用于视觉门禁，非视觉门禁均已独立通过。

A clean visual pass (zero critical/major on initial review) must **not** be reported as an exception.

## Deprecated compatibility entry

此旧入口仅作兼容转发，替代入口为 `infocard-quality-gate`。质量结论只有统一门禁可以给出；本入口不得并行产生第二份最终结论。
