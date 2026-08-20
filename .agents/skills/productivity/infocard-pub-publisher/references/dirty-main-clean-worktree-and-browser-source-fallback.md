# Dirty main worktree + browser-rendered source fallback

Use this when publishing a new `infocard-pub` card while the primary repo worktree already contains unrelated local drafts, or when terminal HTTP collection is unreliable.

## Pattern

1. **Do not publish from a dirty main worktree if unrelated drafts exist.**
   - Check `git status --short` in the primary repo.
   - If there are unrelated draft HTML/meta/index changes, create a clean worktree from `origin/main` and build only the current card bundle there.
   - This prevents unpublished drafts from being accidentally included in `_index.yaml`, `index.html`, or the publish commit.

2. **Clean worktree command shape**
   ```bash
   git fetch origin main --quiet
   rm -rf /tmp/infocard-<slug>
   git worktree add -f /tmp/infocard-<slug> origin/main
   cd /tmp/infocard-<slug>
   git status --short   # must be clean
   ```

3. **When terminal GitHub/API fetches fail, use browser-rendered GitHub as source evidence.**
   - Open the repo page via browser/CDP.
   - Extract visible README/About text, stars/forks/issues/PRs, folders, topics, language breakdown, and homepage URL from the rendered page.
   - Treat those as page-visible facts; avoid claiming API-only metadata you did not fetch.

4. **If a linked homepage fails but GitHub About links it, keep the claim bounded.**
   - It is valid to say “GitHub About links homepage X”.
   - Do not summarize homepage content unless the homepage itself was fetched/rendered successfully.
   - Record the limitation in the co-located `report.md`.

5. **Publish bundle discipline**
   - Commit only current card HTML, meta, report, localized assets if any, and generated `_index.yaml` / `index.html`.
   - After push, verify public detail page, `_index.yaml`, homepage search, and mobile rendering.
   - In final report, explicitly state if the primary repo still contains unrelated local drafts.

## Why this matters

`npm run build` rewrites global index artifacts. If run from a dirty worktree containing another draft, those global artifacts can accidentally expose or reference the wrong card. A clean origin worktree isolates the publish surface and keeps the user’s pending drafts untouched.
