---
name: infocard-theme-contract
description: Versioned adapter contract for theme identity, tokens, components, responsive rules and theme-specific prohibitions.
version: 1.0.0
---

# Infocard Theme Contract

Every `infocard-*-style` package is an adapter implementing `infocard-theme-contract@1`. Adapters declare applicability, tokens, typography, color/border/shadow/background rules, supported components, mobile exceptions, prohibitions, template and asset entry points.

Theme adapters do not own source governance, information architecture, generic HTML generation, browser verification, quality disposition or publishing. They must preserve explicit theme identity and may report an incompatibility risk without replacing the requested theme.

Contract output: `{theme_id, contract_version, capabilities, tokens, components, mobile, prohibitions, template, assets, status}`. Invalid or missing adapters block authoring before quality review.
