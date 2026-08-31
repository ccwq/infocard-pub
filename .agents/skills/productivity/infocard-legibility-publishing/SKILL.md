---
name: infocard-legibility-publishing
description: Publish information cards and verify that the most important updates are visible in the first fold, not merely present in the HTML. Use when shipping or revising info-card pages that must be readable immediately on open.
---

# Infocard Legibility Publishing

This skill covers the end-to-end workflow for publishing information cards where **visual legibility matters as much as content correctness**.

## When to use
- The user wants an info card published or republished.
- A page is technically correct, but important additions are hard to notice on open.
- A previous version needed a visible summary, title tweak, or layout compression to surface new conclusions.
- You need to verify the difference between **DOM presence** and **what appears in the first fold**.

## Core principles
1. **Visible first fold beats hidden completeness.**
   - If the key conclusion is not visible immediately, move it upward.
   - Do not assume “it exists in the HTML” means “the user can see it.”

2. **Treat title/subtitle as a summary surface.**
   - If a table or long section pushes the new point below the fold, compress the headline or add a kicker line.
   - Prefer short, high-signal summaries over adding another hidden section.

3. **Style absorption over literal preservation.**
   - If the source material has a stronger hero than the template, absorb it into the style’s header instead of preserving a generic badge-only top bar.
   - For `redswiss` cards, the default absorption pattern is a diagonal red→black hero on the left plus a right-side stack of meta pills.
   - Keep the style’s color rules intact; absorption changes structure and hierarchy, not the palette.

4. **Repo cards with user-supplied commentary should merge narrative, not append it.**
   - When the source is a GitHub repo plus extra post/tweet/article copy, treat the extra copy as the narrative lens for the card.
   - Fold it into the opening hook, one-sentence summary, and core mechanism section.
   - Avoid leaving the extra copy as a detached quote block at the bottom; that preserves evidence but loses the reader-facing argument.
   - For repo-centric technical-share cards, make the first fold answer both “what is it” and “why should I care” before diving into details.

5. **User corrections about framing are full-pass corrections, not title-only edits.**
   - If the user says “提升 / 重构 / 增强” or corrects the thesis, treat that as a narrative correction pass.
   - Rewrite the hero claim, body summary, comparison section, and footer/meta together.
   - Re-scan the artifact for stale negations and conflicting claims before closing.

6. **Verify with a visual check, not just text extraction.**
   - DOM inspection can confirm presence.
   - Screenshot/vision confirms actual visibility, ordering, and fold position.
   - If the screenshot is ambiguous on a narrow/mobile layout, cross-check DOM counts and computed styles before changing structure. Dense cards can *look* two-column even when the layout has already collapsed correctly. See `references/vision-dom-reconciliation.md`.
   - If the card includes a `html2canvas`-based PNG export button, verify the export path directly in the rendered page: inspect `saveCard()`, confirm `typeof html2canvas === 'function'`, and `await saveCard()` before concluding it is broken. Local **HTTP** preview is still preferred when exported assets are involved; `file://` previews can taint the canvas. See `references/html2canvas-local-http-export.md` and `references/html2canvas-export-verification.md`.

## Strict acceptance gates for visible delivery
- If the user calls out a specific visibility issue (time not visible, first-fold summary missing, list item not obvious, button missing, mobile text too small), the release is incomplete until that exact issue is verified on the rendered public page.
- Do not treat DOM presence, source HTML presence, or `_index.yaml` presence as proof of visible delivery. They are different layers and must be checked separately.
- For homepage/list issues, verify the rendered homepage itself, not only the detail page or generated manifest.
- For time-display issues, confirm whether the user is asking about date-only vs date+time. If the requirement is “show concrete time”, verify that the rendered list actually exposes hours/minutes/seconds, not merely that metadata contains them.
- For narrow/mobile layouts, a screenshot/vision pass is mandatory before declaring success. If a fixed footer/FAB control is present, verify that it does not cover the last visible content block at 390px; compact the control label or iconify it before broad structural churn.
- For investigation / fact-check cards, verify that the **visible correction block** is present on the published page and that the visible source label matches the evidence tier (direct / aggregated / mismatch). Check the public URL with DOM text first, then a screenshot/vision pass; do not rely on source HTML alone.

See `references/evidence-tiered-public-verification.md` for the reusable tiered-verification pattern.

## Workflow
1. **Read the page as a user would.**
   - Open the published URL.
   - Check the first screen before scrolling.
   - If the user mentions a missing control (for example, a download/save button), inspect the bottom of the rendered page explicitly; controls are often omitted from the footer even when the body content is correct.

2. **Check DOM and visual output separately.**
   - If content is in the DOM but not visible, treat it as a layout issue.
   - If the page appears old, test with a cache-busting query string.
   - If a control is present in source but absent in the rendered page, verify the final DOM and the screenshot before assuming the build is wrong.
   - For X-status cards and other source-driven infocards, make sure attached images are visible above the fold and that public interaction data is rendered explicitly. If public replies are zero, label that clearly instead of implying a comment thread exists.

3. **Confirm the new content is visible above the fold.**
   - If not, make one of these minimal fixes:
     - shorten the title,
     - add a kicker/summary line directly under the title,
     - move the key finding into the header,
     - compress or defer lower-priority sections.
   - For footer actions, prefer a visible, labeled CTA in the footer rather than hiding functionality in text or relying on a template default.
   - For cards that look like they have a missing `.desc` on the homepage, first check whether the source sidecar actually has `desc` or `note`; the homepage only renders that block when one of those fields is present. If you are backfilling a batch, use the `infocard-pub-publisher` desc backfill reference and keep the homepage/`_index.yaml` rebuild loop in the same pass.
   - For image-heavy cards, check the *image asset itself* before blaming layout: confirm the file is the original/high-resolution source, not a thumbnail derivative, and that the published image style does not crop evidence images with `object-fit: cover` or fixed `aspect-ratio`.
   - If the source contains multiple illustrations that support the claim, preserve them as a compact evidence gallery / strip instead of collapsing everything into a single hero image. Keep the source order, compress the surrounding text, and verify that the important images still appear on the rendered public page.

4. **For dense list cards, upgrade plain items into link + intro units.**
   - When the source card is mostly a resource index, make each item a clickable link plus one sentence of context.
   - Keep the introductory line at the top Chinese-first and high-signal so the user knows the card’s purpose immediately.
   - If the source is truncated, preserve uncertainty with a placeholder / 待核实 note instead of guessing an exact title or URL.
   - Do not let the added intros push the first-fold summary below the fold; compress headline copy before shrinking the item explanations.
   - For cards with a fixed `Save PNG` / FAB control, if 390px vision shows overlap, first add bottom safe-area padding to the content container and re-check before moving the control itself.

5. **Republish and verify again.**
   - Re-check the raw source and the GitHub Pages URL.
   - Use a cache-busting URL if the browser appears stale.
   - Do not stop at “the file was pushed”; verify the rendered page.
   - When users report a missing addition after republish, re-read the authoritative artifact and prefer a single full-source rewrite if piecemeal edits make completeness hard to reason about.

## Dense-catalog addendum
- For Chinese-localization requests, translate visible UI labels as well as the body text: title, stats labels, section titles, footer copy, and the one-line summary.
- For mixed-confidence sources, keep the list usable first and perfect later: a safe placeholder is better than a fabricated certainty.
- For medium-density catalog cards, a tight but readable first fold is acceptable if the title, four key stats, and one-sentence conclusion are all visible and uncut; do not inflate whitespace just to make the page look emptier.
- For product / skill landing pages, prioritize **上手指南、安装方法、兼容工具、版本选择** over deep catalog detail. A compact first fold is fine when these are surfaced early and the install path is obvious.
- For dense catalogs, verify the final experience with a visual pass on the public page, not just DOM presence. If it reads slightly dense but the key surfaces are visible, preserve the density rather than forcing a lower-information layout.
- For tables that are wider than a phone viewport, do **not** shrink the whole page to make the columns fit. Keep the table readable by giving it its own horizontal scroll container, and verify that the rightmost column can be reached on 390px mobile.
- For **decision-guide / terminology quick-reference cards** (e.g. "how to choose" or "what does each term mean"), use a compact decision flow near the top and keep the definitions as short tiles below it; if one block becomes visually dominant on phones, the first fix is usually to collapse that block to a single column or simplify the flow labels rather than shrinking the whole page.
- On republish, verify both a desktop/open-page pass and a 390px mobile pass. If the page is readable but one region feels crowded, identify the single most crowded block and fix that block first instead of changing the whole layout.
- See `references/dense-source-list-cards.md` for the reusable Chinese-first link + one-sentence intro pattern on dense source-list cards.
- See `references/medium-density-installation-guide-cards.md` for the compact first-fold pattern on product/skill landing pages.
- See `references/technical-share-first-fold-tightening.md` for the GitHub/Skill technical-share pattern when the first mobile fold reads like a long article instead of a release card.
- See `references/redswiss-header-absorption.md` for the fact_store → redswiss header absorption pattern (diagonal hero + right-side meta pills).

## When to use
- The user wants an info card published or republished.
- A page is technically correct, but important additions are hard to notice on open.
- A previous version needed a visible summary, title tweak, or layout compression to surface new conclusions.
- You need to verify the difference between **DOM presence** and **what appears in the first fold**.
- You are shipping a dense catalog card (skills, tools, models, workflows) and need it to stay readable on phones.

## Core principles
1. **Visible first fold beats hidden completeness.**
   - If the key conclusion is not visible immediately, move it upward.
   - Do not assume “it exists in the HTML” means “the user can see it.”

2. **Treat title/subtitle as a summary surface.**
   - If a table or long section pushes the new point below the fold, compress the headline or add a kicker line.
   - Prefer short, high-signal summaries over adding another hidden section.

3. **For dense catalogs, reduce per-tile fields before shrinking typography.**
   - When one card contains many repeated entries, each tile should carry the smallest useful payload.
   - Prefer `name + capability intro` on the tile itself; move deeper principle text into the report or hide it on narrow screens if it makes the grid too dense.
   - If you keep a secondary explanation inside each tile, verify that the 390px viewport still reads comfortably.

4. **Verify with a visual check, not just text extraction.**
   - DOM inspection can confirm presence.
   - Screenshot/vision confirms actual visibility, ordering, and fold position.

## Workflow
1. **Read the page as a user would.**
   - Open the published URL.
   - Check the first screen before scrolling.
   - If the user mentions a missing control (for example, a download/save button), inspect the bottom of the rendered page explicitly; controls are often omitted from the footer even when the body content is correct.

2. **Check DOM and visual output separately.**
   - If content is in the DOM but not visible, treat it as a layout issue.
   - If the page appears old, test with a cache-busting query string.
   - If a control is present in source but absent in the rendered page, verify the final DOM and the screenshot before assuming the build is wrong.
   - For X-status cards and other source-driven infocards, make sure attached images are visible above the fold and that public interaction data is rendered explicitly. If public replies are zero, label that clearly instead of implying a comment thread exists.

3. **Confirm the new content is visible above the fold.**
   - If not, make one of these minimal fixes:
     - shorten the title,
     - add a kicker/summary line directly under the title,
     - move the key finding into the header,
     - compress or defer lower-priority sections.
   - For footer actions, prefer a visible, labeled CTA in the footer rather than hiding functionality in text or relying on a template default.
   - For dense skill/tool cards, the first fix is usually to drop secondary text per tile or collapse to a single column on narrow screens.

4. **Republish and verify again.**
   - Re-check the raw source and the GitHub Pages URL.
   - Use a cache-busting URL if the browser appears stale.
   - Do not stop at “the file was pushed”; verify the rendered page.
   - When users report a missing addition after republish, re-read the authoritative artifact and prefer a single full-source rewrite if piecemeal edits make completeness hard to reason about.

## X/GitHub technical-share card routing

When the source is an X post that primarily shares a GitHub repo, Skill, workflow, or tool, do **not** default to an "X evidence card" structure just because the input URL is a status link.

Use this routing rule:

1. Treat the X post as the **discovery and claim surface**.
2. Treat the GitHub repo / README / examples / exports as the **main substance**.
3. If the user asks for a **技术分享信息卡** or similar, bias toward a **repo-centric technical share card**:
   - what it is
   - how it works
   - what it outputs / how to use it
   - why it is worth attention
   - where the boundaries are
4. Keep X interaction data and screenshots as supporting evidence, not the page's main narrative, unless the user explicitly wants a传播/舆情/证据卡.
5. If the desired framing is ambiguous, ask one compact multiple-choice question early (for example: repo technical share vs method card vs X evidence card) before writing the page.

Pitfall: a repo-centered technical-share task can look "correct" while still missing the user's intent if you over-index on the X post shell. The correction is not visual polish first; it is to change the narrative center from the social post to the shared artifact.

## Verification checklist
- [ ] New key message is visible on initial open.
- [ ] First fold contains the most important update.
- [ ] The page is visually checked, not only text-checked.
- [ ] Raw source and Pages both reflect the latest commit.
- [ ] If needed, cache-busting URL was used to bypass stale rendering.
- [ ] For homepage list cards, confirm the source sidecar includes `desc`/`note` before assuming a rendering bug.

## Vision-provider and acceptance-boundary discipline
- Treat a vision tool's quota/403 message as scoped to the provider/model pool listed in that tool result. Do not generalize it to another configured endpoint (for example `custom:omni` or an omni vision model) unless that endpoint was actually attempted and rejected.
- Before reporting “vision exhausted”, inspect the attempted-provider/model list and distinguish: requested endpoint rejected; fallback pool rejected; or the tool never routed to the requested endpoint.
- If the user explicitly accepts a UI/DOM review as the visual disposition for the current card, record that acceptance as the run's visual decision and continue the release workflow; do not misreport it as a global provider outage. Preserve the distinction between tool evidence, user acceptance, and full independent visual-model verification.

## Quirks-mode CSS failure: diagnosis and fix

**Symptom**: Info card hero renders with transparent background (`rgba(0,0,0,0)`) even though CSS declares `background: var(--black)` and the HTML is correct.

**Root cause**: The page enters `document.compatMode === "BackCompat"` (quirks mode), which breaks CSS custom properties — `var(--black)` computes as `rgba(0,0,0,0)` instead of `#0b0b0b`. This can happen when GitHub Pages CDN or the browser injects quirks-mode rendering conditions.

**Diagnosis via CDP**:
```
Runtime.evaluate → JSON.stringify({ compatMode: document.compatMode })
// "BackCompat" = broken, "CSS1Compat" = normal
```

Also check: `getComputedStyle(element).backgroundColor` returns `rgba(0,0,0,0)` for an element with `background:var(--black)`.

**Fix (two-layer, in order)**:
1. Replace all `var(--red)`, `var(--black)`, etc. with hardcoded `#e60012`, `#0b0b0b`, etc. directly in the CSS block.
2. Inline the critical styles directly on the HTML elements as `style=""` attributes (hero background/border, stat cell backgrounds, section borders, skill card borders, save button gradient). This bypasses the stylesheet entirely.

**Verification**: After fix, use `Page.reload({ignoreCache:true})` to force the browser to fetch the latest HTML from CDN. Then `getComputedStyle(hero).backgroundColor` should return `rgb(11, 11, 11)` = `#0b0b0b`.

**Prevention**: Prefer hardcoded hex values over CSS custom properties for critical visual properties (backgrounds, borders, text colors) in info cards. Reserve CSS vars for optional theming only.

## References
- Session notes and the first-fold summary fix: `references/session-20260529-pricing-card.md`
- Image-heavy source integration pattern: `references/image-heavy-technical-share-cards.md`
- Theme structural update: always update theme HTML + demo page together — see `references/theme-structural-update-two-files.md`
- Redswiss diagonal hero absorption: `references/redswiss-header-absorption.md`

## Deprecated compatibility entry

此旧入口仅作兼容转发，替代入口为 `infocard-quality-gate`。可读性检查只产生结构化 issue，不得自行发布。
