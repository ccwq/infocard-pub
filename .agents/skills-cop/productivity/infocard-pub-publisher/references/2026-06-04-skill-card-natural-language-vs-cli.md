# Skill card natural-language vs CLI — session note

## What changed
A published Skill card was corrected after the user explicitly said the usage section should be **natural language**, not manual commands.

## Durable rule
For Skill / SKILL.md info cards:
- write the usage section as **what the user says**
- then **what the Agent does**
- then **what output appears**
- then **applicability / boundaries**
- do not center the card on `npx skills add`, `node scripts/...`, or parameter walkthroughs

## Good pattern
Examples the card may show:
- “把这段 Mermaid 画得更好看一点”
- “换成深色主题”
- “导出成 SVG”
- “给我一个终端里也能看的 ASCII 版本”

## Bad pattern
Avoid making the visible card a CLI tutorial page. Repository links may remain in the resource section, but the main body should not teach manual commands.

## List time correction pattern
If the user says the list order/time is wrong:
- treat it as a visible timestamp correction, not a style tweak
- update sidecar `date` / `updated` in Asia/Shanghai wall-clock time when republishing
- rebuild `_index.yaml`
- verify the public `/_index.yaml` and the rendered homepage ordering
