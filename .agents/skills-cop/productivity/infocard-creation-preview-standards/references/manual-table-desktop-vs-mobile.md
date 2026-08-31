# Manual table layout: desktop full-width first, mobile local scroll second

Session pattern distilled from `http-proxy-to-socks` graph-paper card.

## Trigger
- The card contains a **manual-style reference table** (CLI params, config matrix, API options, comparison axes).
- Desktop initially shows a horizontal scrollbar because the table was placed inside a split-column section.
- Mobile also needs independent horizontal scrolling.

## Rule
1. **Desktop first**: if the table is a primary reference surface, give it a full-width section before accepting desktop horizontal scrolling.
2. **Mobile second**: preserve a dedicated horizontal-scroll wrapper for the table on 390px when the table genuinely exceeds phone width.
3. Do not solve the mobile pass by shrinking the entire page.
4. Do not keep a split-column desktop layout if it harms the one-pass readability of the main table.

## Recommended restructure
- Parameter table becomes the main block of the section.
- Explanatory notes / config-file example move below the table or into a secondary block separated by a horizontal divider.
- Keep the table wrapper even after desktop restructuring so the mobile behavior stays local to the table.

## Why this matters
Graph/manual-style infocards are read like reference sheets. A parameter matrix that already fits within desktop width should read in one pass on desktop; independent horizontal scrolling is the fallback for phone width, not the desktop default.

## Pointer
Use together with the `infocard-creation-preview-standards` desktop readability rule and the `infocard-mobile-verifier` mobile overflow checks.
