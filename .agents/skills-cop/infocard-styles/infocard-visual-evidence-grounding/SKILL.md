---
name: infocard-visual-evidence-grounding
description: Use when grounding infocard screenshot findings in DOM.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, visual-review, evidence, responsive, screenshot, DOM]
    related_skills: [infocard-publish-sop, infocard-mobile-verifier, infocard-creation-preview-standards]
---

# Infocard Visual Evidence Grounding

## Purpose

Keep visual acceptance evidence accurate and actionable. A screenshot model can identify real defects, but it can also misread a viewport crop, infer elements that are not present, or confuse a theme variant with a missing component. Reconcile visual findings with the exact rendered target and DOM before changing HTML/CSS or declaring a visual gate passed.

## Evidence hierarchy

Use evidence in this order:

1. **Exact rendered target** — the intended local/public URL, cache-busted when appropriate.
2. **DOM and computed geometry** — element existence, `getBoundingClientRect()`, computed styles, scroll dimensions, and overflow ownership.
3. **Rendered screenshot** — appearance, hierarchy, contrast, spacing, and readability.
4. **Vision-model narrative** — candidate findings only; never a substitute for the rendered target or DOM.

A vision report that contradicts the DOM must be recorded as a false-positive or unresolved discrepancy, not silently turned into a design requirement.

### Known vision model limitations

Vision models are reliable for spatial/compositional findings but systematically unreliable for:

1. **Date/number hallucination** — A date like `2026-08-21` in the HTML may be read as `2026-07-27` or another plausible near-date. Always cross-verify numeric data fields by fetching the actual HTML (`curl <url>` or `web_extract`) and grepping for the value, rather than trusting the screenshot description.
2. **Color consistency** — The same CSS color value may be described differently across multiple screenshot reads. Treat color descriptions as approximate unless the contrast ratio is clearly broken.
3. **Anchoring bias** — If the agent already holds a file-based assumption (e.g. "this page uses darkblue theme"), the vision description gets filtered through that assumption. Force a first-pass reading of "what do I actually see?" before comparing against any file-based claim.

## Standard review loop

### 1. Freeze target and scope

Record the URL/path, cache-busting token, viewport width/height, whether the image is viewport-only or full-page, target regions, and the current HTML/CSS revision.

A `1440×900` or `390×844` viewport screenshot is a crop. Do not call a long page or table truncated solely because it continues below the image boundary.

### 2. Capture via web-capture

**Use `web-capture` — not `browser_exec` cdp() or Python WebSocket CDP (confirmed timeout-prone 2026-08-26).**

`web-capture` is the only approved screenshot gate. It wraps the repository-required `agent-browser --cdp 9696`, handles tab selection, viewport switching, geometry checks, and PNG output.

Desktop / mobile / tablet capture are selected by the `web-capture` preset.

### 3. Run mechanical checks first

At minimum inspect:

```js
({
  innerWidth: window.innerWidth,
  innerHeight: window.innerHeight,
  clientWidth: document.documentElement.clientWidth,
  scrollWidth: document.documentElement.scrollWidth,
  scrollHeight: document.documentElement.scrollHeight,
  bodyScrollWidth: document.body.scrollWidth,
  bodyClientWidth: document.body.clientWidth
})
```

For every reported element, verify that it exists and inspect computed `display`, `position`, `fontSize`, `overflow`, dimensions, and `getBoundingClientRect()`. For fixed/sticky controls, check intersection with content at the target scroll position.

For a reported table cutoff, inspect the table and containing section separately: `scrollHeight`, `clientHeight`, `overflow`, and the last row rectangle. A viewport crop is not content clipping.

### 3. Classify findings

- **Critical**: content is unusable, inaccessible, or structurally broken; release blocked.
- **Major**: verified overlap, unreadable layout, missing required content, page-level overflow, or broken responsive structure; repair and re-review.
- **Minor**: spacing, contrast, or small hierarchy issue that does not block reading.
- **False positive**: screenshot claim contradicted by DOM/source/viewport scope; do not redesign to satisfy it.
- **Pending**: capture or vision infrastructure did not provide reliable evidence; do not upgrade static checks to visual pass.

### 4. Repair at the correct responsive layer

For fixed export/save controls, prefer document flow on narrow screens when the control is non-essential. Otherwise reserve bottom safe-area/padding and verify at the actual scroll position.

For mobile typography, check computed sizes rather than screenshot perception. Raise visible metadata, labels, and table headers to the repository minimum (normally at least 11.2px, preferably 12px for dense cards), then re-check wrapping and rhythm.

For long cards and tables, distinguish viewport crop from actual clipping. Use a table-local scroll container or mobile card/list alternative when required. Never shrink the entire page merely to hide overflow.

### 5. Re-review every visible repair

Any HTML/CSS/structure change invalidates affected visual evidence. Re-render with a fresh URL/cache-bust, capture desktop and mobile as required, and produce a new per-image disposition. Do not reuse prior screenshots as proof.

## Theme fidelity check

Judge against the selected theme's actual contract, not a reviewer-implied variant. For example, a redswiss single-project card may legitimately use the standard topbar variant; a reviewer expecting a diagonal hero is not proof that the card is wrong. Verify implemented tokens and structural classes first.

### Theme cross-validation (CRITICAL mandatory step)

**Every visual review MUST complete this step before any other finding:**

1. From the screenshot, describe in one sentence: "The page background is [light/dark] and the overall tone is [warm/cool/neutral]."
2. From the HTML source, read the `<link rel="stylesheet" href="../theme/X.html">` tag to get the declared theme name.
3. Cross-check: does the screenshot's visual description match the declared theme's documented appearance?
   - **If NO** (e.g., screenshot shows white/light background but declared theme is darkblue): this is a **Critical** issue — the theme failed to load, the page is showing fallback/unstyled content. Record as `THEME_MISMATCH`.
   - If the declared theme is verified to produce the observed visual, proceed.

This step prevents the most common failure mode: checking layout/content while the page is visually broken due to a missing or wrong theme.

## Public artifact truth and code-overflow proof

A local repair, local screenshot, successful build, or HTTP 200 is not evidence that the public artifact changed. Before declaring a repair complete, compare the exact cache-busted public HTML with the candidate's release fingerprint: target slug/title, theme marker, canonical tokens, structural signatures, and a release-specific marker. If the public response still has the old fingerprint, classify the result as `PUBLIC_UNCHANGED` / `LOCAL_ONLY`; an unchanged public screenshot proves non-delivery, not successful repair.

For mobile review, long code blocks are a first-class overflow trigger. A visible code block pressed against or cut by a 390px viewport is a FAIL until DOM checks confirm that the code block or a dedicated wrapper owns local horizontal scrolling. Inspect page `scrollWidth`, code/wrapper `clientWidth` and `scrollWidth`, `overflowX`, `max-width`, `box-sizing`, and parent geometry. Do not accept `overflow-x:auto` on a code element alone as proof.

## Release language

Keep visual state separate from static/build and public HTTP state:

- `VISUAL_PASSED`: current required screenshots reviewed with zero critical/major defects;
- `VISUAL_BLOCKED`: a verified critical/major defect remains;
- `VISUAL_PENDING`: required capture/review evidence is unavailable or unreliable;
- `PUBLISHED_PENDING_VISUAL`: public release succeeded under the explicitly allowed fallback, but visual pass was not established.

Never describe a card as fully verified using only build success, HTTP 200, DOM snapshots, or one cropped screenshot.

## Supporting reference

Session-specific examples and verification snippets are in `references/visual-review-grounding-20260808.md`.

## Checklist

- [ ] **Theme cross-validation first** — screenshot visual vs declared HTML `<link>` theme; THEME_MISMATCH is Critical.
- [ ] Exact target and viewport recorded.
- [ ] Viewport crop distinguished from full-page content.
- [ ] DOM existence and geometry checked for critical findings.
- [ ] Page-level overflow separated from local table/code scrolling.
- [ ] Fixed/sticky controls checked for actual overlap.
- [ ] Computed font sizes checked.
- [ ] Date/number fields cross-verified against raw HTML (vision model date hallucination warning).
- [ ] Findings classified as critical/major/minor/false-positive/pending.
- [ ] Fresh screenshots captured after visible repairs.
- [ ] Static, public, and visual states reported separately.
