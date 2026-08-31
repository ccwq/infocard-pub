# Investigation report + info card bundle pattern

Use this pattern when the user asks for a research task and explicitly wants both a report and a published infocard.

## What to produce
- `docs/{slug}/report.md`: evidence-first writeup with the research question, source split, ranking/decision, and caveats.
- `docs/{slug}.html`: compressed, screenshot-friendly card that mirrors the report conclusion.
- `docs/{slug}.html.meta.yaml`: include the publish timestamp and stable metadata required by the build.

## Research split
- Separate **official docs / product docs** from **community usage**.
- Keep the two evidence layers distinct in the report and in the card.
- If community guidance contradicts docs, call out the contradiction instead of averaging it away.

## Card design for technical investigations
- Prefer a high-density technical style (often hardblue for Hermes / tooling / workflow topics).
- Put the ranking, recommendation, and evidence layer near the top so the card reads well in a screenshot.
- Include a small config block when the output is actionable.

## Publish sequence
1. Write report + HTML + meta together.
2. Run `npm run build`.
3. Run `npm run verify`.
4. Commit the card bundle **including** `_index.yaml` and `index.html` when the build mutates them.
5. Push to `main`.
6. Wait for Pages propagation, then verify the public page.
7. Check both the detail URL and the rendered page content, not just HTTP status.

## Verification notes
- New cards should be verified in browser, not only by file inspection.
- If the report is the long-form source of truth, keep it in the same directory as the card so future edits stay synchronized.
- Do not report success until the published page is visible and the repo state is clean after the release.
