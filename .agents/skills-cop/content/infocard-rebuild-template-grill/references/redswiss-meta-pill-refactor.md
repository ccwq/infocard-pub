# Redswiss meta-pill refactor pattern

This note captures a repeated infocard layout correction:

## Symptom
- A visible module in the body (e.g. a 2x2 grid of failure modes) takes too much vertical space.
- The user wants the module removed from the body, but the information itself should not be lost.
- The header metadata block feels too far from the viewport edge.

## Preferred fix order
1. **Relocate first, delete second**
   - Move the module's data into `topbar-meta` / meta pills if it is summary-level information.
   - Keep the content visible, but compress it into the header layer.
2. **Tighten the header gap structurally**
   - Reduce wrapper padding/margins around the meta pill block.
   - Prefer changing the header container spacing rather than shrinking unrelated content.
3. **Preserve meaning, not layout**
   - If the original module had 4 items, try 4 compact pills or 2 larger + 2 smaller pills before discarding structure.

## Alignment rule
When the user says “remove this module” but also says the data should survive, do a short grill-me check before writing:
- Where should the data live after removal?
- Should it become header pills, stats, or a smaller body block?
- How close should the header metadata sit to the viewport edge?

## Pitfall
Do not merely hide the body module and call it done. If the data is still important, it must be re-housed in a denser, higher-priority visual location.