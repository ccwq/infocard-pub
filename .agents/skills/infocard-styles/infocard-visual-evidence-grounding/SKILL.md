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

## Standard review loop

### 1. Freeze target and scope

Record the URL/path, cache-busting token, viewport width/height, whether the image is viewport-only or full-page, target regions, and the current HTML/CSS revision.

A `1440×900` or `390×844` viewport screenshot is a crop. Do not call a long page or table truncated solely because it continues below the image boundary.

### 2. Run mechanical checks first

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

- [ ] Exact target and viewport recorded.
- [ ] Viewport crop distinguished from full-page content.
- [ ] DOM existence and geometry checked for critical findings.
- [ ] Page-level overflow separated from local table/code scrolling.
- [ ] Fixed/sticky controls checked for actual overlap.
- [ ] Computed font sizes checked.
- [ ] Findings classified as critical/major/minor/false-positive/pending.
- [ ] Fresh screenshots captured after visible repairs.
- [ ] Static, public, and visual states reported separately.