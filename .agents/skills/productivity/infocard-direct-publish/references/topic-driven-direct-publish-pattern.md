# Topic-Driven Direct Publish Pattern

> Session-specific notes for infocard-direct-publish when the user gives a topic/report instead of a single GitHub URL.

## What changed in this session

- The user said only `发布信息卡`, then provided a tool-evaluator style report about **Resilio 资源分享站有哪些**.
- There were multiple plausible targets already present in the repo/worktrees:
  - `docs/20260803-resilio-sync-p2p-sync.html` in the repo
  - `/tmp/infocard/resilio-sync` worktree with a cleaner publish/audit lineage
  - `wt-resilio-sync-20260803/` (older reference worktree from prior context)
- The right move was **not** to assume a new card or blindly pick a random worktree. Ask one disambiguating question when multiple targets exist.

## Publish outcome

- Selected the existing Resilio Sync card path and published to GitHub Pages.
- The worktree branch was behind `origin/main` and `git push origin HEAD:main` was rejected as `non-fast-forward`.
- Fix: `git fetch origin main && git merge origin/main -m "merge: integrate main into <branch>" && git push origin HEAD:main`.
- Verified with:
  - `curl -I https://ccwq.github.io/infocard-pub/docs/20260803-resilio-sync-p2p-sync.html` → `HTTP 200`
  - SHA256 of deployed HTML matched the expected artifact hash.

## Reusable takeaway

- For topic-driven publishes, the first job is **candidate anchoring**, not writing.
- When a worktree push is rejected as non-fast-forward, do not redo the card; sync `origin/main` into the worktree and push again.
- Always remove the temporary worktree after a successful publish.

## Cross-links

- Governing skill: `infocard-direct-publish`
- Related support file: `references/worktree-isolated-commit.md`
