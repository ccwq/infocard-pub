---
name: infocard-card-authoring
description: Production stage that turns a confirmed content pack and frozen theme decision into a .docs infocard artifact.
version: 1.0.0
---

# Infocard Card Authoring

Use for create, update, rebuild and repair artifact work. Do not trigger for source investigation alone or publication-only work.

Input: content pack, frozen `theme-decision.json`, existing card identity when updating, and authoring directory. Output draft HTML, sidecar metadata, asset manifest and stage result under `.docs/<run-id>/<slug>/`.

Preserve task mode, audience, source claims and selected theme. `any2card` is an internal conversion engine; rebuild mode may consume `infocard-rebuild-template-grill`, while CLI content may consume `infocard-tool-cli-pattern`.

Authoring cannot declare quality passed, run final browser acceptance, promote to `docs/`, commit or push. Success requires a structurally complete draft and deterministic promotion manifest.
