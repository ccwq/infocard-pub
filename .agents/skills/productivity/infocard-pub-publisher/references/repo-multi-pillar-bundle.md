# Repo Multi-Pillar Bundle Pattern

This note captures a reusable publishing pattern observed when a single GitHub repository naturally splits into several distinct functional pillars.

## When to split into multiple cards
Use a multi-card bundle when the repo can be cleanly decomposed into separate audiences or capabilities, for example:
- engineering / backend / infra
- frontend / design system / UI
- content / distribution / operations
- core product / workflows / supporting docs

If each pillar would need a different framing, different stats, or a different visual mood, one monolithic card usually becomes thin. Split instead.

## Bundle rules
1. Start with a repo-level thesis, then identify the pillar boundaries.
2. Create one card per pillar, not one card per folder.
3. Give each card a distinct style when the audience or function differs.
4. Keep the bundle date and release window aligned so the cards read as a coordinated set.
5. Publish all cards in the same repo commit chain and sync the generated index together.

## Verification rules
- Verify every card page independently with a cache-busted live URL.
- Do not treat one 200 response as proof that the whole bundle published correctly.
- After push, check that the bundle is searchable from the homepage/index as a set, not only by raw URL.

## Practical signal
If the repo has a clear internal product architecture and the content for one card would have to omit major modules, prefer a bundle. The published result should feel like a coordinated release, not a forced compression.