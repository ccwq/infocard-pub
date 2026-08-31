# 2026-06-03: image insertion scope error + impeccable content expansion lesson

## Image insertion scope (root cause: wrong card attribution)

**What happened:** User provided `https://impeccable.style/cases/neo-mirai/` as an image source. We inserted the image into `skillopt-cookbook.html` (the card we had been most recently editing). The correct target was `impeccable-design-system.html` (the card the user was actively describing and about to rebuild).

**Recovery:**
1. Remove image section from wrong card (`skillopt-cookbook.html`)
2. Copy/relocate image to correct card's `docs/assets/images/<correct-slug>/`
3. Insert image into correct card's appropriate section (near end, labeled "case study" or similar)
4. Update `.meta.yaml` `date`/`updated` to current issuance time
5. Verify mobile regression, rebuild index, push

**Prevention rule:** When the user provides a source URL for image insertion, always confirm the target card by name/slug before writing. If the user just gave a URL with no explicit target, ask "这张图要插入到哪张卡片？" before proceeding. The fact that we just edited Card X is NOT sufficient evidence that the image belongs to Card X.

## "Expand to 3x" specification

When the user says "expand to 3x" or "content is too sparse," the requirement means:
- Every module must have substantive explanation, not just more listed items
- Include: workflow explanation, edge cases, best practices, boundary conditions
- The 3x refers to substantive content, not item count
- For a tool card, this means: each command gets use-case + caveat, not just a one-line description
- For a library card, this means: each feature gets pros/cons/when-to-use, not just a name list
- Structure must scale to support the depth — a flat list cannot hold 3x substantive content

## Technical tool skill card class-level structure (impeccable pattern used here)

When building a technical open-source tool card, the canonical chapter order is:
1. Header / project identity (stars, license, platform badge)
2. Core take / one-sentence judgment
3. Problem it solves vs template approach
4. System architecture (visual if possible)
5. 7+ domain reference / capability modules
6. Full command reference (all commands, not just categories)
7. Anti-patterns / pitfalls (AI slop + general quality)
8. Installation / multi-platform support
9. Boundary (suitable vs unsuitable)
10. Case study / visual insert (at end, only one image)
11. Footer with source, license, author

This pattern was confirmed via the impeccable card (33K stars, pbakaus repo) rebuild.