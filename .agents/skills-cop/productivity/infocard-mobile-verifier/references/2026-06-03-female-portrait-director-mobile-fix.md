# Female Portrait Director mobile fix notes (2026-06-03)

This session exposed a common mobile-verification pattern for infocards:

- A request to increase the minimum font should be treated as a **global typography pass**.
- Do not only enlarge正文; check meta text, badges, captions, code blocks, tables, route labels, footer text, and helper copy together.
- If a screenshot points to a specific section, fix that section's internal hierarchy first instead of only adjusting global spacing.
- For structure-heavy sections, replace cramped inline text packing with file cards or stacked name/description rows.
- Floating or sticky save buttons that overlap content are an automatic fail; demote them to normal flow and re-run browser verification.

Verification should always end with screenshot-backed confirmation, not just CSS inspection.
