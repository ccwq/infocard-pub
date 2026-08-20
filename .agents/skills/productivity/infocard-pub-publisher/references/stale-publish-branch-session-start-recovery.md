# Stale `publish/*` Branch at Session Start — Recovery

## Symptom

A new session enters `infocard-pub/` and the worktree is checked out on an old
`publish/<slug>` branch from a prior, abandoned publish attempt. Running `git pull --rebase
origin main` (or any rebase-on-pull) immediately fails with conflicts in `_index.yaml` and
`index.html` because the publish branch and `origin/main` have both moved.

Typical diagnostic output:

```
## publish/ktx-agent-context-layer...origin/main
Your branch and 'origin/main' have diverged,
and have 1 and 8 different commits each, respectively.
Could not apply <sha>... feat: add ...
UU _index.yaml
UU index.html
```

## Why this happens

- A prior session checked out a `publish/<slug>` branch to isolate that release.
- That session ended before merging back to `main`.
- The shared worktree stayed on the stale branch; the new session inherited it.
- `git pull --rebase` then rebases the stale branch onto a `main` that has 8 new commits,
  hitting the inevitable `_index.yaml` / `index.html` conflict (every published card edits
  both).

## Correct recovery

Do NOT try to resolve the `_index.yaml` / `index.html` conflict on the publish branch.
That branch's commit is not what you want anymore — the slug it published may already be
on `origin/main` via a later commit, and the index files are generated artifacts.

The recovery is to abandon the publish branch and start fresh from `origin/main`:

```bash
cd infocard-pub
git rebase --abort
git checkout main
git reset --hard origin/main
git status -sb   # expect: ## main...origin/main  (no ahead/behind)
```

Then proceed with the publish (write new card files, build, verify, commit, push).

## Why `git reset --hard` is the right tool here

The current `main` may be 1-ahead with the prior session's lost commit (e.g.
`91396e8 feat: add agent loop 7 scenarios method card`). That commit is not lost
permanently — it stays in the reflog and in the publish branch ref — but it is no
longer needed because either:

(a) the same content is already on `origin/main` via a later merge commit, or
(b) it was abandoned intentionally.

`git reset --hard origin/main` aligns the local `main` with the remote `main` so that
the new card you're about to push will fast-forward cleanly.

## When NOT to do this

- Do NOT `reset --hard` if you don't recognise the 1-ahead commit. Inspect it first with
  `git log --oneline main..HEAD` and `git show --stat <sha>` to make sure it's a stale
  earlier-session card and not in-flight work from the user.
- Do NOT do this if the worktree has uncommitted local changes the user is depending on.
  `git status` should show nothing dirty before resetting; if it does, stash first and
  decide what to keep.

## Prevention

This is a class of failure that happens whenever the previous session left the worktree
checked out somewhere other than `main`. Always run as a session-start preflight inside
`infocard-pub/`:

```bash
git fetch origin main
git status -sb
git log --oneline -3
```

If `## main...origin/main` is clean, proceed. If you're on a `publish/*` branch, run
the recovery above before starting work. If you're on `main` but ahead/behind, fall
back to `references/git-multi-worker-preflight.md`.
