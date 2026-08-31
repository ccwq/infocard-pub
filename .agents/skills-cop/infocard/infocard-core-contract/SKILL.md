---
name: infocard-core-contract
description: Versioned contracts shared by the infocard orchestrator, domain, quality and delivery stages.
version: 1.0.0
---

# Infocard Core Contract

This is the single source of truth for stage inputs, outputs and serialized run state. Every stage returns `status` (`completed`, `blocked`, `failed`), `summary`, `artifacts`, `issues` and `next`.

## Run state

`task.mode` is one of `create | update | rebuild | repair | publish`; `artifact.status` is `absent | draft | repaired | accepted`; `quality.status` is `pending | passed | blocked`; `delivery.mode` is `preview | direct | delegated`.

Stages may only read fields produced by earlier stages and may not silently rewrite task mode, audience or source claims. A `Blocker` or unresolved `Major` prevents delivery. Quality repair loops are bounded to two rounds per failure category.

## Contract records

The machine-readable registry is `contracts/architecture.json`. Compatibility entries are explicit and remain callable during migration. References use `standards`, `examples` or `archive`; active references declare scope, trigger, updated date and replacement.

## Failure protocol

`blocked` means a user decision, evidence gap or quality defect must be resolved. `failed` means an execution error with a retryable or terminal cause. Neither status may be reported as success, and publish must reject any quality result other than `passed`.
