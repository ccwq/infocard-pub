# Republish + Localization + Rebase Recovery

When republishing an existing infocard and the user says the page is still too English-heavy, treat it as a source issue, not a cache issue.

## What to change
- Rewrite the visible contract in the card itself:
  - title
  - subtitle / hero copy
  - first-fold labels and badges
  - section headings
  - footer/source wording
  - any exposed entry names or model names that users see first
- Keep English only as a technical anchor when necessary:
  - code spans
  - parenthetical original names
  - source links / repo names

## Safe republish flow
1. Edit `docs/<slug>/index.html` and the matching `.meta.yaml` together.
2. If the republish should change ordering, update the sidecar `date` / `updated` fields using Asia/Shanghai wall time.
3. Run `python3 scripts/rebuild_index.py`.
4. Run `python3 scripts/verify_index.py`.
5. If `git pull --rebase` hits conflicts, prefer the updated card/meta version, then:
   - resolve the conflicted files to the localized republish version
   - regenerate `_index.yaml` from sidecars
   - `git add _index.yaml docs/...`
   - `GIT_EDITOR=true git rebase --continue`

## Pitfalls
- Do not stop after changing only the title when the body still reads mostly English.
- Do not hand-edit `_index.yaml` conflict markers; rebuild it from sidecars.
- Do not treat the first Pages 404 as failure if the deploy just landed; poll with a cache-busting URL.

## Verification
- Public detail page returns HTTP 200.
- Public `_index.yaml` returns HTTP 200 and contains the slug.
- Rendered page first fold is Chinese-first and matches the republish intent.
- Worktree is clean after push.
