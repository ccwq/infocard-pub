# Post-publish task-loss audit

Use this after a card publish/republish session to check whether any planned work was silently dropped.

## Audit questions
- Did we complete the draft generation, build, verify, and preview checks?
- Did we perform the required public verification (`HTTP 200`, `_index.yaml`, homepage search, mobile/legibility when relevant)?
- Did we commit and push the infocard bundle?
- If the card requires wiki sync, did we create/update raw + knowledge page + index + log, then commit and push the wiki repo?
- Did we explicitly mark any planned step as skipped because it was not applicable or because the user did not authorize it?

## Reporting rule
Before closing the session, list:
1. completed steps
2. blocked steps
3. intentionally deferred steps
4. anything that was planned but not executed

If nothing is missing, say so plainly. If something was skipped, name it and explain why.
