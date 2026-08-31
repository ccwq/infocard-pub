---
name: infocard-source-and-content
description: Domain stage for source routing, evidence boundaries, content type and traceable information architecture.
version: 1.0.0
---

# Infocard Source and Content

Use when facts, sources, disputes, assets or a content outline must be modeled. Do not choose concrete colors or publish artifacts.

Input: request, source URLs/files, audience and risk hints. Output content pack with `task_type`, `audience`, `content_type`, `outline`, `claims`, `sources`, `disputes`, `assets`, `evidence_gaps` and `recommended_theme_capabilities`.

Social sources remain discovery until a canonical source is confirmed. Separate fact, inference, dispute and rumor; preserve source and timestamp for key claims. If evidence is missing, return `blocked` with a source-gap issue and `next: infocard-source-and-content`.

Success means every required section maps to a claim or an explicit uncertainty marker and the pack is consumable by card authoring.
