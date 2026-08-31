# Publish status vs ambient worktree noise

When finishing an infocard publish task, separate **target deliverable status** from **repository ambient state**.

## Rule
- If the card is published and verified, report that as complete even if the repo still contains unrelated untracked or modified files.
- Do not let an unrelated draft file or other session residue be interpreted as failure of the current card.
- Do report the stray file explicitly as a separate follow-up item or ambient risk.

## Practical reporting pattern
1. Card result: published / verified / wiki synced.
2. Ambient state: mention any unrelated dirty files.
3. Action needed: either ignore, stash, or clean up if the user asked for a pristine worktree.

## Why this matters
In shared publish repos, another session may leave an untracked draft behind. The correct response is to keep the publish verdict scoped to the current slug, not to conflate repo hygiene with task completion.