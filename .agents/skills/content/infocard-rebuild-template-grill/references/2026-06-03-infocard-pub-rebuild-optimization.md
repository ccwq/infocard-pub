# Session-Specific Infocard Rebuild Notes

- 2026-06-03: `female-portrait-director`, `claude-code-tcm`, `skillopt-cookbook`, `impeccable-design-system`.
- Key Lessons:
  - Density: Content should reach 3x expansion when user flags 'too sparse'.
  - Layout: Mobile-first 390px/720px is not an add-on, it's a structural requirement. Buttons are flow-based (not sticky). 
  - Typo: Global 1.4x scaling for small/helper text is the new baseline.
  - Conflict resolution: `rebuild_index.py` → `add` → `rebase --continue` is the only safe path for conflicting `_index.yaml`.
  - Asset management: Always solidify external images locally in `docs/assets/images/`.
