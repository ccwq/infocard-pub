# Git Worktree × Non-Worktree Repo Pollution Recovery

## The Problem

When a worktree directory sits inside a **regular Git repository checkout** (not the worktree host's own `.git`), and you run `git add -A` or `git add <worktree-dir>`, Git detects the nested `.git` and offers to create a **gitlink** (submodule-style entry with mode `160000`). If you accidentally say yes or the shell auto-commits without prompting, the gitlink gets committed as a `160000` blob entry pointing to the worktree's commit. This pollutes `origin/main`.

Symptoms:
```
[rejected] main -> main (non-fast-forward)
error: failed to push some refs
hint: Updates were rejected because the tip of your current branch is behind
```

Even `git reset --hard origin/main` doesn't help because the remote has the gitlink commit baked in.

## Diagnosis

```bash
# Check for gitlink entries in index
git ls-files -s | grep "^160000"

# Check if any worktree directories are staged
git diff --cached --stat
git status --short | grep "^A "
```

## Prevention

**Rule: Never `git add <worktree-dir>` inside a non-worktree host repo.**

When removing a worktree:
```bash
git worktree remove --force "wt-<slug>"   # proper cleanup — removes gitlink from index
rm -rf "wt-<slug>"                         # then remove directory
git reset HEAD -- "wt-<slug>"             # safety net
```

When staging for a content commit, be explicit:
```bash
git add "docs/<slug>.html" "docs/<slug>.html.meta.yaml" "assets/..." "_index.yaml" "index.html"
# NEVER: git add -A
```

## Recovery (when gitlink is already committed on origin/main)

### Situation
- Local HEAD is dirty or behind remote
- Remote main has a bad commit containing a gitlink entry
- You have a clean local commit with just the card content (no gitlink)

### Step 1: Save the clean commit SHA

```bash
# Identify your good commit
git log --oneline              # find the card content commit, e.g. abc1234
# Note: do NOT use 6201174 (the merge commit that introduced the gitlink)
```

### Step 2: Hard reset to origin/main (removes local gitlink state)

```bash
git reset --hard origin/main
# Now at same commit as remote — clean slate
```

### Step 3: Cherry-pick the good commit

```bash
git cherry-pick abc1234   # apply your content-only commit on top of clean remote state
```

### Step 4: Push (now fast-forward)

```bash
git push origin main
```

## Key Insight

`git worktree remove --force` does TWO things:
1. Removes the worktree's `.git` reference (so the nested repo no longer looks like a submodule candidate)
2. Removes the gitlink entry from the host's index

But if the gitlink was already committed (before you could run `worktree remove`), you need the hard-reset + cherry-pick sequence. The `git reset --hard origin/main` at step 2 DOES remove the gitlink from both HEAD and working tree — because on `origin/main`, the gitlink is just a file entry that gets removed when HEAD moves away from the commit that introduced it.

## Variant: Gitlink still in index after `reset --hard`

If after `reset --hard` you still see the gitlink in `git ls-files -s`:

```bash
# Remove it from the index directly
python3 -c "
import subprocess, os
os.chdir('/path/to/repo')
r = subprocess.run(['git', 'update-index', '--remove', '--', 'worktree-name'], capture_output=True, text=True)
print(r.returncode, r.stderr)
"
# Or equivalently:
git update-index --remove -- "worktree-name"
```

## Test case this was learned from

- Card: `20260724-pi-plugins精选`
- Bad commit: `6201174` — "Merge branch 'infocard/20260724-pi-plugins' into main" (introduced gitlink)
- Clean commit: `d69ff30` — "feat: publish Pi 插件精选..."
- Recovery commit: `3683a53` — removed gitlink via hard-reset + cherry-pick
- Remote polluted: `6201174..3683a53` force-pushed to restore clean state
