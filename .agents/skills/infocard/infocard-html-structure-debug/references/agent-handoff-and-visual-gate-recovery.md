# Agent Handoff and Visual-Gate Recovery

Use this when an isolated publishing delegate stops with a provider quota / API error after making partial progress.

## Durable rule

A delegate result that ends in an API quota error is **not** proof that its requested delivery steps were skipped or completed. Treat it as `UNKNOWN_PARTIAL`, not success and not failure.

## Recovery sequence

1. Read the delegate live transcript to determine the last verified action.
2. Inspect the actual worktree / branch / remote state independently.
3. Resume only the missing gate(s); do not repeat a successful build or recreate a worktree blindly.
4. Before stating a published result, independently verify:
   - commit exists and is reachable from `origin/main`;
   - Pages URL returns HTTP 200;
   - target page contains its identifying keyword;
   - `_index.yaml` contains the slug.
5. Report the visual gate separately from structural/mobile DOM evidence.

## Visual evidence taxonomy

- **VISUAL_VERIFIED**: screenshots were successfully inspected and had no blocking visual findings.
- **PUBLISHED_PENDING_VISUAL**: build, static, public HTTP and 390px DOM checks pass, but screenshot interpretation infrastructure failed after approved retries.
- **NOT_PUBLISHED**: do not use a visual status to imply publication if commit/push/public checks are absent.

`scrollWidth <= viewport`, complete document flow, and computed mobile grid rules are strong layout evidence, but they are **not a replacement** for screenshot inspection. Never phrase them as "视觉通过".

## Status cadence for long publish recovery

When a delegated run lasts long enough that the user is waiting, send a concise status update at meaningful gates (content reconstruction, static/build gates, public verification) and immediately report a terminal delegation error plus the next recovery action. Do not wait for the user to ask why there was no update.
