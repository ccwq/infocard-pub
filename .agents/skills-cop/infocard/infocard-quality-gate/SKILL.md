---
name: infocard-quality-gate
description: Single authoritative desktop, mobile, readability, evidence and pre-delivery quality disposition.
version: 1.0.0
---

# Infocard Quality Gate

Use after authoring or repair and before any delivery. Do not trigger multiple parallel visual gates for the same artifact.

Input: draft artifact, content pack, theme contract and capture environment. Output report with `status`, `blockers`, `advisories`, `environment`, `checks`, `issues` and `next`.

Checks cover completeness, source/time traceability, desktop first fold/full page, 390px mobile layout, typography/contrast/density, tables/flows/images/controls, text-image evidence consistency, built assets and public accessibility. Issues are `Blocker`, `Major` or `Advisory`; every issue includes evidence, impact, repairer and recheck.

A blocker or major cannot be published. Route one best repairer per failure category, at most two automatic rounds, then return `human-review`. Repairers never publish; every repair returns here for a fresh check.
