---
kind: standards
scope: compatibility adapters for historical infocard skills
trigger: a legacy skill name is invoked
status: active
updated: 2026-08-31
replacement: ../contracts/architecture.json
---

Legacy entries remain callable during migration and must disclose their replacement. Adapters preserve old semantics while delegating final decisions to the new layered stages; they do not silently expand authorization.
