# Push-all with dirty main worktree and generated index conflicts

Use when the user says “全部 git push” / “push all” while `infocard-pub` has multiple worktrees or an old local draft in the main worktree.

## Durable pattern

1. Enumerate relevant repos/worktrees first:
   - `infocard-pub` main worktree
   - any temporary publish worktree, e.g. `/tmp/infocard-*`
   - LLM Wiki repo if the card is high-value and was synced
2. For each repo, record:
   - `git status --short --branch`
   - `git log --oneline -1`
   - local vs upstream count: `git rev-list --left-right --count @{u}...HEAD` when upstream exists
3. If main `infocard-pub` is behind remote and has local draft changes:
   - `git stash push -u -m '<reason>'`
   - `git pull --rebase origin main` or fast-forward pull when possible
   - `git stash pop`
4. If stash pop conflicts only in generated files such as `_index.yaml` and `index.html`, do not hand-resolve them. Run:
   - `npm run build`
   - `npm run verify`
   Then `git add _index.yaml index.html` plus the actual draft files/assets.
5. Commit only after build/verify passes.
6. Push with normal `git push`; on transient TLS failure retry with `git -c http.version=HTTP/1.1 push`.
7. Verify push completion with `git status --short --branch` and `git ls-remote origin refs/heads/main`, not with local HEAD alone.

## Pitfalls

- A detached temporary publish worktree may already be pushed even if the main worktree is behind. Do not push detached HEAD again unless it has unique unpushed commits.
- Stash entries can remain after `stash pop` conflicts. If the files are successfully restored and committed, report the leftover stash instead of silently dropping it.
- `git push` failure from a behind main branch is not a network problem; reconcile remote changes first.
- Public HTTP verification can fail due local network/TLS while the push itself is complete. For the specific “all git push” request, `ls-remote` is the push-completion proof; do not conflate that with public Pages verification.
