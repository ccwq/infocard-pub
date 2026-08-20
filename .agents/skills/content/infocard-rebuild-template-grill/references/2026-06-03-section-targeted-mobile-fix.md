# 2026-06-03 Section-Targeted Mobile Fix

This session produced several durable rules for infocard rebuilds:

- When the user says **rebuild**, it means a **full structural/CSS rebuild**, not an expand-on-top patch. Old layout bugs must not be carried forward.
- When the user says the card is **too sparse**, expand substance: add workflow, usage, FAQ, caveats, selection guidance, examples, or boundary notes instead of only adding whitespace or cosmetic text.
- When the user points to a **specific chapter / section** from a mobile screenshot, fix that section **structurally first** (e.g. replace inline mixed filename+description rows with stacked file cards or route rows), then re-check the whole page.
- If the user asks for the **minimum text size** to be larger, treat it as a **global typography pass**. Scale the smallest readable tokens together: meta, captions, badges, code captions, table text, footer, helper text, route labels, etc.
- Floating or sticky save/download buttons must not overlap正文; if they do, demote them to normal document flow before PASS.
- Preserve content completeness, but don’t confuse content preservation with preserving the old layout.

Use this note together with `SKILL.md` for rebuild rules and with the mobile verifier skill for acceptance checks.