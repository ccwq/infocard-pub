# 20260728 Theme Rebuild Pitfalls

These notes came from the darkblue rebuild/revision session where two published cards were judged to have lost their theme identity and needed a visual rebuild rather than copy-editing.

## What went wrong

- Rewriting the body content as a long single column made the page read like a plain article instead of an infocard.
- The visual complaint was not the copy; it was the missing **theme skeleton**: hero bar, section blocks, card containers, and strong layout hierarchy.
- Large one-shot HTML replacement is brittle. It is easy to clobber structural selectors or create partial overwrites that make later patching harder.
- When a theme page starts looking like a raw long-form article, the right fix is to **rebuild structure first** and only then reflow content.

## Safe repair sequence

1. Verify the theme template still contains the expected skeleton:
   - hero bar
   - hero grid / hero panels
   - section wrappers
   - card / grid utilities
2. Rebuild the template before touching published docs.
3. Patch published docs in small, reviewable chunks.
4. Re-open the served pages and confirm the page is visibly a card, not an article.

## Patching rules

- Prefer anchored replacements over wholesale subtree replacement.
- Re-read the full file before any large overwrite.
- After a structural patch, verify the file still contains the expected selectors before proceeding.
- If a page still feels flat after content edits, assume the theme skeleton was lost and restore that first.

## Useful sign of success

A good dark theme infocard should show at first glance:

- a strong top bar or hero accent
- visible section demarcations
- card-like containers with clear spacing
- a page rhythm that reads as designed, not merely formatted
