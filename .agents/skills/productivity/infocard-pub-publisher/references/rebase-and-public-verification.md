# Rebase / publish recovery and public verification

Session-derived pattern for `infocard-pub` release flows when the local branch is ahead but the remote has new commits.

## 1) Push rejection recovery
If `git push` is rejected with `fetch first` / non-fast-forward:
1. `git pull --rebase origin main`
2. If rebase stops on `_index.yaml` with `UU` conflict, treat it as derived state.
3. Rebuild the index from sidecars:
   - `python3 scripts/rebuild_index.py`
   - `python3 scripts/verify_index.py`
4. `git add _index.yaml`
5. `GIT_EDITOR=true git rebase --continue`
6. `git push origin main`

## 2) Public verification
After push, verify three endpoints with a cache-busting query:
- detail page: `.../docs/<slug>/index.html?t=<ts>`
- public index: `.../_index.yaml?t=<ts>`
- homepage: `.../?t=<ts>`

Acceptance criteria:
- detail page returns `200` and contains the expected title text
- `/_index.yaml` returns `200` and contains the new slug
- homepage returns `200`
- rendered homepage DOM contains the new card title/slug, not just the raw `_index.yaml`

## 3) Browser fallback
If the normal browser automation path is unavailable or flaky, use a headless browser plus Selenium to inspect the rendered homepage text/DOM and confirm the new title is present.
