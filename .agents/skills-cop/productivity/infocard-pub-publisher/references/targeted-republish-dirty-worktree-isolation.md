# Dirty worktree isolation before targeted republish

When the user points at one already-published card URL and asks to append/edit content + publish, first isolate unrelated in-flight work so the republish commit remains atomic.

## Pattern

1. Check worktree before editing:
   ```bash
   git status --short
   git diff --stat
   ```
2. If dirty files are unrelated to the requested URL/card, stash them with a descriptive name instead of mixing them into the republish:
   ```bash
   git stash push -u -m "wip-<topic>-before-<target-card>-republish"
   ```
3. Edit only the exact target HTML/meta sidecar.
4. Run the normal publish gates:
   ```bash
   npm run build
   npm run verify
   ```
5. Commit only the target card, sidecar, and generated index artifacts:
   ```bash
   git add docs/<slug>.html docs/<slug>.html.meta.yaml _index.yaml index.html
   git commit -m "feat: expand <slug> card"
   ```
6. If push is rejected because remote advanced, use `git pull --rebase origin main`. For generated artifact conflicts in `_index.yaml` / `index.html`, rebuild rather than hand-merging:
   ```bash
   npm run build
   npm run verify
   git add _index.yaml index.html docs/<slug>.html docs/<slug>.html.meta.yaml
   GIT_EDITOR=true git rebase --continue
   npm run verify
   git push origin HEAD:main
   ```
7. Verify public detail page with cache-bust, homepage embedded index, and worktree cleanliness.
8. Leave the unrelated stash intact unless the user explicitly asks to resume it. Mention the stash name in the final report.

## Why

This avoids three common failures:

- accidentally publishing unrelated theme/style work with a small content update;
- hiding an unfinished previous task inside a new card commit;
- manually resolving generated index conflicts and drifting from `build-site.js` output.

## Acceptance evidence

- `npm run verify` passes after rebase.
- Public URL returns 200 and contains both old and appended content.
- Homepage `#home-index-data` contains the updated card metadata.
- `git status --short` is clean.
- Any unrelated work remains in a named stash, not in the commit.