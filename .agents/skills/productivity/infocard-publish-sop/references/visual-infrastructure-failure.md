# Visual infrastructure failure

Use only when a visual attempt cannot produce evidence because the runner, browser, or capture path failed. This is distinct from a completed review that found a page defect.

## Attempt record

For every failed attempt append one object to `bundle.gates.visual.attempts`:

```json
{
  "number": 1,
  "viewport": [1440, 900],
  "tool": "agent-browser|chrome|browser_vision",
  "command_or_route": "...",
  "started_at": "ISO-8601",
  "timeout_seconds": 45,
  "outcome": "infrastructure_failure",
  "error": "..."
}
```

Use desktop for attempt 1. Retry the failed viewport/path for attempts 2–5; do not invent a visual result for the other viewport.

## Procedure

1. Preserve the attempt record before retrying.
2. Retry only the failed infrastructure path. Do not rewrite card content or theme because a screenshot is unavailable.
3. Stop after one initial attempt plus four retries.
4. If any attempt returns a review with `critical` or `major`, set `VISUAL_BLOCKED` and stop publication.
5. If five attempts are infrastructure-only and all other required Pages gates are green, set `VISUAL_PENDING`; the publisher may use `PUBLISHED_PENDING_VISUAL`.

Static mobile checks and local HTTP may be recorded as support, never as visual PASS.

## Completion criterion

The bundle has current visual evidence, a blocking visual defect, or five numbered infrastructure-only records with a truthful pending disposition.
