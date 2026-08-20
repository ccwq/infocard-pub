---
name: infocard-responsive-layout
description: Use for infocard mobile CSS repairs.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, responsive, css, mobile, visual-regression]
    related_skills: [infocard-mobile-verifier, infocard-creation-preview-standards, infocard-mobile-rendering-verification]
---

# Infocard Responsive Layout

## Purpose

Provide a class-level authoring and repair workflow for infocard responsive layouts. The central failure mode covered here is the mobile **min-content squeeze**: a fixed number column and a flexible text column become unstable when long URLs, tables, or code tokens establish an unexpectedly large minimum width. The visible result can be Chinese text rendered one glyph per line, right-edge decorations clipped, or a card that appears vertically broken even though `writing-mode` was never used.

This skill complements, rather than replaces, the existing mobile verification and preview skills: it owns the reusable diagnosis and CSS repair pattern; those skills own their broader publish/preview gates.

## Trigger conditions

Use this skill when:

- a 390px screenshot shows one-character-per-line Chinese text or pseudo-vertical prose;
- a later card is narrow while an earlier card looks normal;
- a right-side decorative strip or control is partially outside the viewport;
- long URLs, tables, or code blocks distort a grid/flex layout;
- static overflow checks pass but the screenshot remains visually unreadable;
- a mobile kicker/date suffix becomes an orphan line;
- a responsive CSS patch must be verified before an authorized infocard release.

## Diagnosis before editing

1. Inspect the actual rendered target at 390×844, not only the source.
2. Check `scrollWidth` and `clientWidth`, but do not treat equality as visual PASS.
3. Inspect the computed width of the affected `.skill-card`, number column, `.card-body`, and the first overflowing token.
4. Check whether the flexible grid track is `1fr` without `minmax(0,1fr)`, and whether grid/flex children lack `min-width:0`.
5. Search for long URLs, inline tables, `<pre>`, `<code>`, fixed-width descendants, and nested `overflow` rules.
6. Confirm every `@media` block is properly closed before `</style>`; a malformed style tail can make the intended repair ineffective.

Do not jump to `writing-mode` or globally apply `word-break:break-all` merely because the screenshot looks vertical.

## Canonical repair pattern

Use a scoped, structure-first repair:

```css
code,pre,table{max-width:100%;overflow:auto}
html,body{max-width:100%;overflow-x:hidden}
.poster-shell,.poster-shell main,.poster-shell .cards-grid,
.poster-shell .skill-card,.poster-shell .card-body{max-width:100%;min-width:0}
.poster-shell .card-title,.poster-shell .card-desc,
.poster-shell code,.poster-shell pre,.poster-shell table{
  overflow-wrap:anywhere;
  word-break:break-word;
}
.poster-shell .card-body table{
  display:block;
  width:100%!important;
  max-width:100%;
  overflow-x:auto;
  white-space:normal;
}
.poster-shell .card-body pre{
  display:block;
  white-space:pre-wrap;
  overflow-x:auto;
}
@media(max-width:720px){
  .poster-shell .skill-card{grid-template-columns:64px minmax(0,1fr)}
  .poster-shell .card-num{min-width:0;padding-right:16px}
  .poster-shell .card-stripe{left:60px}
  .poster-shell .card-body{
    min-width:0;
    overflow:hidden;
    padding-left:14px;
    padding-right:6px;
  }
}
```

Scope aggressive wrapping to URLs, code, tables, and card content. Do not apply `word-break:break-all` to all body prose.

If the repository's static checker requires inline coverage on every code/pre element, keep the checker-compatible inline declarations in addition to the global CSS:

```html
<code style="max-width:100%;overflow:auto;overflow-wrap:anywhere;word-break:break-word">...</code>
<pre style="max-width:100%;overflow:auto;white-space:pre-wrap">...</pre>
```

## Table and code handling

- Prefer a dedicated scroll container around a wide table, not an overflow rule on the entire card.
- For 5+ column comparison tables, design a mobile card/list alternative when the table is semantically important; do not accept glyph-per-line compression as a pass.
- Keep headings and explanatory text outside the table scroll container when the user needs them fixed.
- For code, preserve command readability with `white-space:pre-wrap` or a local horizontal scroll container; do not allow it to set the parent grid's min-content width.

## Kicker/date cosmetic rule

A dense uppercase kicker can orphan a date suffix such as `07` on a narrow viewport. Fix only the kicker with a smaller mobile letter-spacing/font-size or `white-space:nowrap;overflow:hidden;text-overflow:clip`. Never hide substantive model facts or deployment instructions to solve a header cosmetic issue.

## Verification sequence

1. Re-read the full affected style tail.
2. Run the repository exported static checker and satisfy its exact `code/pre/table` coverage rules.
3. Serve the worktree and capture a real 390×844 screenshot with a cache-busting query parameter.
4. Run DOM checks for `scrollWidth`, `clientWidth`, affected block widths, and computed overflow.
5. Use vision review to classify `critical`, `major`, and `minor` findings: glyph squeeze, clipping, URL/table/code overflow, number/body proportion, and orphaned kicker.
6. Run `npm run build`, `npm run verify`, the card-scoped leak scan, and `git diff --check`.
7. If the repository-wide taxonomy audit exposes unrelated historical failures, do not repair or stage them for this card. Use the changed-only/card-scoped gate and report the baseline separately.

## Evidence standard

A vision result must be based on the actual card URL or local card file, not an iframe/theme gallery that can introduce unrelated decoration. A screenshot description cannot establish HTML facts; use source/DOM inspection for exact element existence. Conversely, DOM equality cannot replace visual review when legibility is the issue.

## Closeout language

Report separately:

- static gate status;
- browser/DOM overflow status;
- visual severity list;
- whether changes are local-only or pushed/publicly verified.

Do not call the card fully complete merely because static checks and HTTP status pass when visual evidence is pending.

## Critical: Playwright DOM Diagnosis Before Sending Screenshots to User

**Do NOT announce completion until you have personally vision_analyzed all screenshots.** The failure pattern from 2026-07-27: the agent declared "修复完成" 5 times after each push, each time asking the user to find the remaining problem. This wastes user time and destroys trust.

**Required self-review sequence before reporting "fixed" to user:**
1. Capture 4 screenshots (top / 25% / 50% / bottom)
2. Run `vision_analyze` on each — do not skip any
3. If critical/major issues remain, fix them first
4. Only after vision_analyze shows clean → send to user with explicit evidence

**Playwright DOM diagnosis (mandatory when layout collapses):**
```js
const result = await page.evaluate(() => {
  const cardBody = document.querySelector('.card-body');
  const card = cardBody.closest('.skill-card');
  return {
    bodyGridCols: getComputedStyle(cardBody).gridTemplateColumns,
    bodyWidth: getComputedStyle(cardBody).width,
    cardGridCols: getComputedStyle(card).gridTemplateColumns,
    cardWidth: getComputedStyle(card).width,
    parentWidth: getComputedStyle(card.parentElement).width,
  };
});
// Normal: bodyGridCols="48px 326px" (two values)
// Bug:    bodyGridCols="274px" (single value → grid collapsed)
// Bug:    parentWidth="56px" → parent is a skill-card with 56px width
```

**Fatal: footer/poster-note DOM parent chain check:**
```js
const chain = [];
let el = document.querySelector('.footer');
while (el) { chain.push(el.tagName + '.' + (el.className.split(' ')[0])); el = el.parentElement; }
// Correct: FOOTER.footer → DIV.poster-shell → MAIN. → BODY. → HTML.
// Bug:     FOOTER.footer → DIV.skill-card → ... → DIV.poster-shell
// If footer is inside skill-card → page JS moved it at runtime, OR
// HTML has an unclosed <div> tag at the end of a .skill-card
```

**Page height signals:**
| Height | Meaning |
|---|---|
| 8,000–12,000px | Normal |
| 65,000+px | `width:100%` caused 1fr to expand massively |
| Same across all 4 positions | Scroll failed, all screenshots are top content |

**Screenshot size signals:**
| Sizes | Meaning |
|---|---|
| 77KB / 120KB / 90KB / 65KB | All positions have content (GOOD) |
| All ~77KB | All 4 screenshots are top of page (scroll failed) |
| S4 drops to 4KB | Content cut off (overflow:hidden on cards-grid) |

## Multi-card research-to-publish lessons (2026-07-29)

When a user requests a detailed introduction plus beginner/advanced guide for an X-discovered open-source project, keep two tracks separate: the introduction card explains identity, architecture, knowledge base, pipeline, benchmark, safety, and trade-offs; the guide explains installation, first run, stage-by-stage model configuration, approval, revision loops, advanced refresh/fast-path settings, pre-PR checks, and troubleshooting.

Resolve the canonical repository before authoring. Use GitHub API/repository README, docs, package metadata, and source as primary evidence; use the social post only as discovery/provenance and engagement context. Verify same-name candidates rather than trusting search snippets.

For darkblue mobile cards, check `.flow` in addition to `.grid-2`, `.grid-3`, `.matrix`, and `.risk-grid`. The hero flow often remains two columns unless explicitly collapsed with `.flow{grid-template-columns:1fr !important}`. Also inspect cascade order: a base `.flow-item .c` rule declared after the media query can silently override a mobile contrast fix. Prefer a high-contrast base rule (`color:#f0f5ff;font-weight:600`) and explicitly style `.source` metadata on mobile.

If visual providers fail from configuration/quota/503 errors, make one bounded fallback attempt, preserve screenshots, and mark `VISUAL_PENDING`; do not convert DOM/static/HTTP checks into visual PASS. When the provider recovers, re-run vision on the post-fix screenshots.

## Related skill overlap

This skill overlaps with `infocard-mobile-verifier` and `infocard-creation-preview-standards` by design. The curator should consolidate the responsive min-content and visual-regression material into the most appropriate umbrella rather than accumulating narrow one-off skills.
