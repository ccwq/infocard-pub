# Parallel Worktree Staleness: Each Worktree Independently Lags origin/main

## Problem

When multiple infocard worktrees (`publish-claude-init`, `publish-openwiki`, `publish-watermark-removal`) are created in parallel from the same base commit (`d8299f0`), they all share the same stale snapshot. Meanwhile, other PRs are merging into `origin/main`, advancing it to `16eaa6a`, then `359a361`, etc.

Each worktree is independently behind `origin/main` by a different amount. Running `npm run build` in any of them only sees the cards in its own local `_index.yaml`, producing a build with **fewer total slugs than the live site**.

## Symptom

After merging multiple PRs:
- `npm run build` in worktree reports `420 slugs` instead of expected `475+`
- GitHub Pages ends up with a regressed `_index.yaml` that drops cards that were already live
- You don't notice until after push + Pages rebuild

## Detection

```bash
# Check how many slugs each worktree would publish
for wt in infocard-openwiki infocard-watermark-removal infocard-claude-init; do
  path=/home/ccwq/infocard-pub/$wt/_index.yaml
  if [ -f "$path" ]; then
    n=$(grep -c '  - slug:' "$path")
    echo "$wt: $n slugs"
  fi
done
# Compare to live _index.yaml slug count
curl -s https://ccwq.github.io/infocard-pub/_index.yaml | grep -c '  - slug:'
```

## Verified Fix

Before building in **any** parallel worktree, sync it to `origin/main`:

```bash
cd /home/ccwq/infocard-pub/infocard-<slug>

# Option A: if no local changes
git fetch origin main
git merge origin/main -m "sync with main"

# Option B: if local changes exist (card files already written)
git stash                    # save local card files
git fetch origin main
git merge origin/main -m "sync with main"
git stash pop                # restore local card files
npm run build                # rebuild with all cards
git add -A
git commit -m "feat: add <slug> infocard after sync"
git push origin publish-<slug>
```

## Order of Operations for Parallel Publishes

```
1. Create all worktrees from origin/main (each starts at same baseline)
2. Write files to each worktree's docs/
3. For EACH worktree (sequentially, not in parallel):
   a. git fetch origin main
   b. git stash (if dirty)
   c. git merge origin/main
   d. git stash pop
   e. npm run build  ← rebuilds _index.yaml with ALL known cards
   f. git add docs/<slug>.* _index.yaml index.html
   g. git commit
   h. git push
4. Create PR + merge (per worktree)
5. After EACH merge: artifact regeneration push (see squash-merge-ci-artifact-loss.md)
```

Step 3 must be sequential per worktree — you cannot skip the sync even if the worktree feels "fresh."

## Why Parallel Worktrees Drift

Each worktree tracks only its own commits. When `publish-deepseek-lora` merges PR #3 to `origin/main`, the other worktrees (`publish-openwiki`, `publish-watermark-removal`) are still on `d8299f0`. They don't auto-advance. You must explicitly merge `origin/main` into each before building.
