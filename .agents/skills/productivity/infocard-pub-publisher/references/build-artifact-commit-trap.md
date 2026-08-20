# Build Artifact Commit Trap

## Problem

`npm run build` (which calls `scripts/build-site.js`) modifies two files in place:
- `_index.yaml` — updated entry for the new card
- `index.html` — injected card into the homepage list

If these are not included in the `git add` before `git commit`, the CI step `Verify committed generated artifacts` fails with error:
```
Error: Index build failed: [generated files not committed]
```

The card HTML and meta.yaml ARE committed, but `_index.yaml` and `index.html` are not — GitHub Actions detects the mismatch.

## Symptom

```
[build-site] wrote _index.yaml and injected index.html (N cards)
git push  →  CI: Verify committed generated artifacts → failure
```

Yet `curl https://ccwq.github.io/infocard-pub/docs/<slug>.html` returns 404 (because the deployment was skipped due to CI failure).

## Fix (Standard Commit Sequence)

Every time you create a new card, run this exact sequence:

```bash
npm run build
git add docs/<slug>.html docs/<slug>.html.meta.yaml _index.yaml index.html
git status --short   # verify all 4 files are staged (M or A)
git diff --stat HEAD -- _index.yaml index.html   # confirm they changed
git commit -m "feat: add <slug> card"
git push
```

If CI still fails after this sequence, the likely cause is a prior commit that missed the artifacts. Diagnose:

```bash
git log --oneline -3
git diff --stat HEAD -- _index.yaml index.html
```

If those show changes but `git status --short` shows nothing M, you need to amend:

```bash
git add _index.yaml index.html
git commit --amend --no-edit   # fix the prior commit
git pull --rebase && git push
```

## Why `git diff` + `git status` Together

- `git status --short` shows currently staged/unstaged files
- `git diff --stat HEAD -- _index.yaml index.html` shows what the last commit DIDN'T capture

Both are needed because `git status` alone looks clean (no unstaged changes from build perspective) but `git diff HEAD` reveals the prior commit is incomplete.

## Prevention Rule

**Always** run `git add _index.yaml index.html` together with `git add docs/<slug>.html` whenever creating or rebuilding cards. This is a two-file rule, not optional.

**Primary gate**: `git diff --stat HEAD -- _index.yaml index.html` — if output is empty, safe to push. `git status --short` alone is unreliable and can show clean even when those files differ from HEAD.