---
name: debug-layout
description: Specialist repairer for one layout-overlap or overflow defect routed by infocard-quality-gate.
version: 1.0.0
---

# Debug Layout

Trigger only when the quality report identifies `layout-overlap` or a desktop layout defect. Input is the frozen artifact and one issue; output is a repaired draft plus evidence. Do not investigate source facts, change theme identity, run a full quality gate, promote, commit or publish.

After repair, return `next: infocard-quality-gate`. A repairer cannot announce delivery success or bypass the two-round repair limit.
