---
name: infocard-orchestrator
description: Default entry point that classifies infocard intent, composes the minimum stages and enforces authorization boundaries.
version: 1.0.0
---

# Infocard Orchestrator

Trigger for create, query, update, rebuild, repair and publish requests. Do not trigger for unrelated web pages or generic design work.

Input: user request, optional existing card, source hints, explicit theme and delivery authorization. Output: serialized run state, selected stages, content/theme decisions, quality disposition and delivery mode.

Decision order: classify task mode → preserve existing identity → assess source risk → choose content type/density → honor explicit theme → author → run `infocard-quality-gate` → route one repairer and recheck → invoke `infocard-publish-pipeline` only after quality `passed`.

The orchestrator never writes HTML/CSS, performs visual fixes or publishes. Without explicit publication authorization it may select only `preview`. A project skill unavailable condition is terminal (`PROJECT_SKILL_UNAVAILABLE`), never a generic fallback.

Success is a complete plan whose stage outputs can be handed off without re-reading raw sources. Blocked and failed states stop downstream stages.
