# Subagent Detached HEAD Commit Recovery

When a subagent reports `status=timeout` but `api_calls=42+`, it may have committed to a **detached HEAD** in the worktree. The main thread's first instinct to run `git log --oneline` fails to show the new commit because it only displays the current HEAD chain.

## Symptom

```bash
$ git log --oneline -3
a53fd0f feat: add csrftoken deep dive card (hardblue, L2-L5)
172eb5d chore: add Feynman card release audit
4369af6 feat: add Feynman L1-L5 explanation card
# ← no subagent commit visible

$ git branch -a
* (no branch)
  20260718-teammate-skill
  ...
+ be6efb0 feat: publish Graph Engineering infocard (darkblue, 2026-07-22)  # ← HERE
```

The `+` prefix means the commit `be6efb0` is on a branch that doesn't exist locally.

## Recovery Steps

```bash
# 1. Verify the content exists
git show be6efb0:docs/20260722-graph-engineering.html | head -5

# 2. Create a named branch at this commit
git checkout -b publish/graph-engineering-YYYYMMDD

# 3. Verify it's the right commit
git log --oneline -1
# be6efb0 feat: publish Graph Engineering infocard (darkblue, 2026-07-22)

# 4. Continue: npm run build → git add → git commit --amend → git push → PR → merge
```

## Prevention

Tell subagents explicitly: "commit to a **named branch**, not detached HEAD."

```bash
git checkout -b publish/<slug>-YYYYMMDD   # ← always do this first in worktree
```

## Key Insight

`git log --all --oneline` shows commits on ALL refs, including detached HEAD commits. Use this instead of plain `git log` when auditing subagent worktrees.

---

Cross-ref: `references/pitfalls-20260722.md` — includes this case in the full session failure catalog.
