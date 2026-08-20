# Female Portrait Director rebuild notes (2026-06-03)

This session showed three durable lessons for infocard rebuilds:

1. **Rebuild means rebuild.**
   - Do not treat a rebuild request as content expansion on top of an existing buggy layout.
   - Rebuild the structure, visual hierarchy, and spacing from scratch when the user says the card is wrong.

2. **If the user says the content is sparse, add substance, not padding.**
   - Prefer new sections such as workflow, usage, FAQ, caveats, selection guidance, and examples.
   - Expanding substance is better than repeating the same idea in more words.

3. **Structure-heavy sections need a different layout pattern.**
   - For repository structure, file lists, and route lists, avoid mixing filename/path/explanation into one cramped row.
   - Use stacked file cards or name/description rows so mobile readers can scan the section quickly.

4. **Global typography changes should be intentional.**
   - When the user asks for a bigger minimum font, raise the entire small-text system together: meta, captions, helper text, code captions, labels, and footer text.

5. **Sticky actions must not overlap正文.**
   - If a save/download button sits on top of content, move it into normal document flow before calling the page done.

See also `references/2026-06-03-female-portrait-director-mobile-fix.md` for the mobile-specific variant of the same pattern.
