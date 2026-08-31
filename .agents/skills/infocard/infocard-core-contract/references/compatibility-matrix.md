---
kind: standards
scope: migration-period legacy entry points
trigger: compatibility routing or deprecation review
status: active
updated: 2026-08-31
replacement: ../contracts/architecture.json
---

All historical infocard skills remain callable under `.agents/skills-cop`. Their canonical replacement and status are machine-readable in `contracts/architecture.json`; deprecated entries must disclose the replacement to callers. No legacy entry is deleted or silently granted broader permissions.
