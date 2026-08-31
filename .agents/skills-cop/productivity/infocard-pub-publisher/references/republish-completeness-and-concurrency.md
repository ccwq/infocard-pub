# Republish completeness + concurrent update recovery

When updating an existing published info card:

1. Re-read the current source of truth before editing.
2. Explicitly compare the user’s requested additions against the card sections, counters, header kicker, and source notes.
3. If concurrent writers or stale views are suspected, prefer a clean full-file rewrite over partial patch chains.
4. After writing, re-open the artifact and verify the requested additions are visible in the rendered content.
5. Do not mark the republish complete until the published artifact reflects the full requested scope.
