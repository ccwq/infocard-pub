# Append-only update pipeline for an existing infocard

Use this when the user says things like:
- "继续"
- "新的内容追加到后面"
- "加入信息卡和报告然后完成"
- "只补后置内容，不改前面"

## Checklist
1. **Locate the exact published card path** from the public URL or repo path.
2. **Read the tail of the HTML before patching**. Existing cards often end with a final note/footer; replace that ending cleanly instead of appending a duplicate ending.
3. **Append content in the right scope**:
   - Keep the original structure intact.
   - Only add the requested back matter, addendum, or end sections.
   - Do not silently rework earlier conclusions unless the user asked for a rewrite.
4. **Sync the paired knowledge artifacts** when the card is high-value:
   - public infocard HTML
   - wiki query page
   - wiki raw record
5. **Preserve the user’s requested emphasis order**.
   - Example from this session: stability/maintenance first, price second, comfort third.
6. **Verify the landing point** by re-reading the edited tail or checking the exact inserted section title.

## Common pitfalls
- Replacing the whole page when the user only asked for an appendix.
- Forgetting to update wiki/query/raw after changing the public card.
- Editing the wrong ending block because the HTML has multiple notes or tips sections.
- Turning a scoped append request into a strategy rewrite.

## Verification target
A successful append-only update should leave the earlier card readable unchanged, while the new addendum appears as the final substantive section before the footer.
