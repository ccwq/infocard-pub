---
name: infocard-publish-pipeline
description: Unified preview, direct and delegated delivery pipeline consuming an accepted quality report.
version: 1.0.0
---

# Infocard Publish Pipeline

Trigger only with an artifact and quality report. `quality.status` must be `passed`; otherwise return `blocked`.

Modes: `preview` produces a local preview and capture handoff with no public side effect; `direct` performs promotion, build, index/resource checks and public URL smoke verification when explicitly authorized; `delegated` emits a complete handoff package and never publishes itself.

Input: accepted artifact, promotion manifest, quality evidence and delivery authorization. Output: mode-specific result with actions, URLs, smoke evidence and rollback reference.

This stage does not reinterpret source content or repeat full visual acceptance. Partial build/deploy failures are `failed`, never success. Existing preview, build, publisher and delegated skills remain compatibility adapters to this pipeline.
