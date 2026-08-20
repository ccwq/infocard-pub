# Pitfall 2026-07-28: All Author subagents fail with HTTP 429 → orchestrator becomes Author

## What happened

When dispatching 3 parallel Authoring subagents for a multi-card batch (one hardblue main card, one crayon pipeline card, one pixelstack hard-rules card), all three returned within 15-20 seconds with identical failure messages:

```
API call failed after 3 retries: HTTP 429: 已达到 Token Plan 用量上限：
请升级 Token Plan 套餐或购买积分补充用量。 (2056)
```

The brief was well-scoped (theme + content outline + source URL). The failure was **platform quota exhaustion** — the LLM never started, no token was charged. The subagent pattern was healthy; the platform was not.

## Critical recovery path: orchestrator = Author

1. **Detect ratelimit vs content failure.** Subagent finishes in <25s with `"HTTP 429"` or `"Token Plan"` in the error message → platform quota issue, not content problem. **Do not redispatch** — the next batch will hit the same wall.
2. **Take ownership of authoring.** The user authorized the publish; ratelimit on one path doesn't void authorization. Switch to **light-route** (orchestrator writes directly) — the SOP default for self-contained content.
3. **Clone the registered theme template, don't synthesize from memory**:
   ```bash
   cp $WT/theme/hardblue.html $WT/docs/<slug>.html
   ```
   This guarantees the live CSS variable system, hero-bar, grid background, and section modules match the registered style. See skill `infocard-hardblue-style` for the canonical token conventions (`--bg --paper --ink --blue --red --line`).
4. **Body swap.** Keep `<style>` block intact; overwrite only `<main class="page">…</main>`. Replace `<title>` in `<head>`, then write the full content body following the same `.section` / `.section-head` / `.section-no` skeleton.
5. **Continue the standard release chain.** write `meta.yaml` → `npm run build` → fix any meta.yaml format errors → `npm run verify` → `git add` → `git commit -m "feat: publish …"` → `git push --force origin <branch>:main` → `sleep 80 && curl -sI` for HTTP 200.

## Why this is safe

- Light-route subagent budget is **0 by default** in `infocard-publish-sop` — we're not skipping any deliberate division of labor.
- The user authorized publish for this run; we have not violated scope.
- `theme/<style>.html` is the registered source of truth for the style; cloning it preserves all signature components (42px grid, hero-bar, numbered blocks, etc.) without requiring an LLM to recall them.

## Prevention / detection

- **Before dispatching ≥2 parallel Authoring subagents**, query `minimax-account-status` skill for quota headroom. If quota is below the card budget, skip delegation entirely.
- **Group failures by error class** before retrying. If all three subagents share the same HTTP 429, do not retry — escalate or fall back.
- **For multi-card batches under quota pressure**, serialize: publish one card at a time, parent thread writes each directly. The `infocard-publish-sop`'s `max_concurrent_children=3` cap exists for LLM throughput, not quota — splitting batches below that cap doesn't help if quota is the bottleneck.

## Cross-reference

- `infocard-direct-publish` SKILL.md "常见陷阱 §5" — the inline entry pointing here.
- `infocard-publish-sop` §"Light route: orchestrator writes directly" — explains when parent-thread authoring is the chosen path.
