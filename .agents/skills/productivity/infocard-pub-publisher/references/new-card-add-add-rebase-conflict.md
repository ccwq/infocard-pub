# New-card add/add rebase conflict

Use this when a freshly created infocard was committed locally, then the branch moved remotely before the final push, and `git rebase origin/main` reports an **add/add** conflict for the card HTML.

## Symptom pattern

- First push of the card succeeded, or a previous commit for the same slug already exists remotely.
- Local card was then amended for layout/legibility fixes.
- Re-push fails with non-fast-forward.
- Rebase stops on `CONFLICT (add/add): Merge conflict in docs/<slug>.html`.

## Recovery

1. **Inspect the HTML directly.** Do not rely only on earlier grep/search output; the conflict markers may now exist inside the file.
2. Remove `<<<<<<<`, `=======`, `>>>>>>>` markers.
3. Keep the **latest validated variant** — usually the branch that contains the more recent font-size / spacing / mobile-legibility fixes.
4. Re-stage the card bundle if needed:
   - `docs/<slug>.html`
   - `docs/<slug>.html.meta.yaml`
   - `docs/<slug>.report.md`
   - `_index.yaml`
   - `index.html`
5. Continue with:
   - `GIT_EDITOR=true git rebase --continue`
6. Re-push with:
   - `HOME=/home/ccwq GIT_HTTP_VERSION=HTTP/1.1 git -c http.version=HTTP/1.1 push origin HEAD:main`

## Verification gate

After recovery, re-check:

- local worktree is clean
- local `HEAD` equals `origin/main`
- public detail page is still `HTTP 200`
- `_index.yaml` and homepage still contain the slug

## Why this matters

A new-card add/add conflict is easy to misread as a normal rebase hiccup. If you continue without inspecting the HTML, you can leave conflict markers inside the published card or accidentally keep the older, pre-fix layout branch.