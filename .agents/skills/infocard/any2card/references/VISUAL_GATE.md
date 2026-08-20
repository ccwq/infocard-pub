# Visual evidence record

Use this reference after `any2card` has read Protocol v3. It specifies how to inspect and record a two-viewport review; Protocol v3 decides publication disposition and retry budget.

## Review sequence

1. Read the target repository preview command and route.
2. Start or reuse the correct preview service and verify a unique expected identity on the target page.
3. Capture and inspect desktop `1440×900` and mobile `390×844` separately.
4. Record viewport, preview URL, expected identity, file version/hash, timestamp, result path, score if available, and issues for each viewport.
5. If a result finds `critical` or `major`, return `VISUAL_BLOCKED`. A repair may address only reported issues; any artifact change invalidates earlier evidence.

## Record shape

```json
{
  "file_version": "hash",
  "preview_url": "...",
  "expected_identity": "...",
  "identity_verified": true,
  "desktop": {"viewport": [1440, 900], "result_path": "...", "issues": []},
  "mobile": {"viewport": [390, 844], "result_path": "...", "issues": []},
  "attempt": 1,
  "recorded_at": "ISO-8601"
}
```

## Infrastructure failures

An unavailable runner, browser startup failure, or capture timeout produces no visual result. Preserve the error and attempt in the run bundle, then follow `infocard-publish-sop/references/visual-infrastructure-failure.md`. Do not equate static checks with a screenshot review.

## Completion criterion

Both viewports have current evidence, or the run bundle truthfully records `VISUAL_BLOCKED` or `VISUAL_PENDING` under Protocol v3.
