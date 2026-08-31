# GitHub repo card publish: `addyosmani/agent-skills` (session note)

This note captures the reusable pattern from publishing a repo card for `https://github.com/addyosmani/agent-skills` in the wood-style theme.

## Useful facts collected
- GitHub API on unauthenticated requests may 403/rate-limit; fallback to raw README fetch.
- The repo README contains a strong hero image that can be downloaded and embedded locally.
- The README’s core framing is lifecycle-oriented: `Idea → Spec → Code → Test → QA → Ship`.
- The repo advertises `24 skills`, `7 slash commands`, and `6 lifecycle stages`.

## Reusable publish pattern
1. Fetch repo metadata from the GitHub API.
2. Fetch README from `raw.githubusercontent.com` if the API is rate-limited.
3. Download a hero image locally into `docs/assets/images/{slug}/` and reference it with a relative path.
4. Build the card around the repo’s actual workflow claims, not a generic summary.
5. Verify at 390px width so the image, chip row, and save button do not collide.
6. If a push is rejected because remote advanced, `git pull --rebase`; if the rebase opens an editor during `rebase --continue`, set `GIT_EDITOR=true`.

## Verification reminders
- `npm run build`
- `npm run verify`
- Pages detail URL returns 200 after propagation
- Homepage search / injected index contains the new slug and title
- Worktree is clean after publish
