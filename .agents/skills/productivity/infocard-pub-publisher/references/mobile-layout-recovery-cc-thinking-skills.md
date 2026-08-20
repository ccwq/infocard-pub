# Mobile layout recovery pattern for dense infocards

Session-derived pattern for pages that look "messy" or "错乱" on phones but are not actually broken.

## Signal
- User reports mobile layout is错乱 / compressed / desktop-like.
- Visual inspection shows no overlap, no horizontal overflow, and no major section order break.
- The page is dense, with many tiles and long labels.

## Recommended fix order
1. Verify on the real public Pages URL with a cache-busting query string.
2. Use browser vision on a mobile viewport before editing.
3. Distinguish three cases:
   - **broken layout**: overlap, clipping, wrong order
   - **dense-but-readable**: tight spacing, small text, but intact flow
   - **stale cache**: local/source is fixed but public page still shows old layout
4. For dense-but-readable pages, prefer a narrow-screen media query that:
   - switches multi-column content blocks to a single column
   - keeps small stats areas at 2 columns if they still fit
   - increases paragraph font-size and line-height slightly
   - reduces outer padding and adds bottom clearance for fixed save buttons
   - leaves desktop layout untouched
5. Re-verify on a 390px viewport and the public Pages URL.

## Practical pattern
- Top summary/stats can stay 2 columns on mobile when it keeps the fold compact.
- Main tile grids should usually collapse to 1 column on mobile for readability.
- Footer action buttons should keep fixed positioning, but their bottom offset should be checked after increasing footer padding.
- If browser vision says "not broken but compressed", do not overreact with structural redesign; add a focused responsive rule first.

## Pitfall
- Do not confuse "text is small and the page feels tight" with "layout is broken".
- Do not patch the HTML blindly before checking the rendered mobile page.
- If the source already contains a sensible mobile media query, verify the deployed Pages HTML is actually serving that version before editing again.
