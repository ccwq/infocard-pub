# Batch Cardinality and Integration Reference

## Incident pattern

A user requested seven independent cards. The first interpretation collapsed them into one aggregate card. After correction, parallel authors produced a mixed set of outcomes: one author timed out, some wrote into an independent worktree or home directory, some were missing, and one sidecar retained a legacy slug/theme/path. Several pages could return HTTP 200 while one card was absent from the public `_index.yaml`.

## Required recovery sequence

1. Treat the user's explicit card count as immutable. Build an expected manifest before delegation:

```text
expected_count: 7
expected_slugs:
  - 20260729-windows-terminal
  - 20260729-alacritty
  - 20260729-pake
  - 20260729-yazi
  - 20260729-super-productivity
  - 20260729-activitywatch
  - 20260729-it-tools
```

2. Require every author to return exact absolute paths for both HTML and sidecar. Verify both files exist before integration. A subagent summary is not sufficient evidence.

3. Use one publisher-owned worktree and copy only declared HTML/meta pairs into it. Do not let parallel authors mutate `_index.yaml`, `index.html`, or Git state.

4. Normalize every sidecar before build:
   - `slug` matches the expected public identity
   - `path` matches the actual HTML path
   - `date` and `updated` are quoted publish timestamps
   - `style`, `category`, `source`, and `source_url` are present and consistent

5. Run one build and verify the local index. Assert:
   - expected count equals HTML count equals sidecar count
   - each expected slug appears exactly once
   - each index path exists on disk
   - generated `_index.yaml` and `index.html` are staged with source artifacts

6. After push and CDN propagation, verify both layers for every card:
   - `GET /docs/<expected-slug>.html` returns 200 and contains the expected title
   - public `_index.yaml` contains the exact expected slug/path/title/date

7. If a page is 200 but missing from the index, do not report completion. Fix sidecar identity, rebuild, push, and repeat the entire manifest check.

## Timeout rule

A timed-out author is `UNKNOWN`, not complete or failed. Inspect its declared handoff directory and worktree. If no usable artifact exists, author that card on the main thread using the same expected slug. Do not allow an incomplete batch to silently shrink.

## Reporting rule

Report one line per requested card, with local artifact, index presence, public HTTP status, and visual status. Aggregate claims such as "7 cards complete" are valid only after all seven lines pass. If visual evidence is unavailable, say `VISUAL_PENDING`; static build and HTTP 200 do not upgrade it to visual PASS.
