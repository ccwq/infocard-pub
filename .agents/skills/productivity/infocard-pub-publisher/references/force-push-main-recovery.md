# Force-push / rewritten-main recovery

Use when a publish flow accidentally rewrites `origin/main`, and the user asks to recover lost commits or restore the remote branch history.

## ⚠️ Prevention: get approval before any force-push

**Force-push to `main` requires explicit user approval before execution.** Every force-push approval message must include:

1. **Why**: why a force-push is needed (remote diverged / rebase conflict / etc.)
2. **What will be overwritten**: the old vs new tip hash, how many commits are affected
3. **Rescue plan**: which commit hash anchors the lost work, rescue branch names
4. **Wait for**: user explicitly saying "可以" / "yes" / "push" before executing

Never force-push without this exchange. Doing so rewrites published history without consent.

## Recovery goals
- Keep the previously pushed history reachable.
- Preserve the current publish result.
- Rebuild generated artifacts instead of hand-merging them.
- Verify the restored branch with both git and HTTP checks.

## Checklist

1. **Read the evidence first**
   - `git log --oneline --decorate -n 8`
   - `git reflog --date=iso -n 12`
   - `git reflog show origin/main --date=iso -n 12`
   - `git branch -vv`

2. **Identify the two anchors**
   - the last known-good remote main commit before rewrite
   - the commit that should remain as the restored publish tip

3. **Create rescue branches before changing anything**
   - one branch at the lost remote tip
   - one branch at the current published tip
   - never rely on memory alone for the hashes

4. **Restore main by replaying the intended commit sequence**
   - reset or re-anchor `main` to the preserved base
   - cherry-pick the recovered publish commit(s)
   - if generated artifacts conflict, do **not** hand-merge `_index.yaml` or `index.html`
   - rerun `npm run build` and `npm run verify` to regenerate them cleanly

5. **Resolve rebase/cherry-pick conflicts safely**
   - if conflict is only in generated artifacts, restore the branch version, rebuild, and continue
   - keep the content file(s) staged; let the build regenerate derived files
   - use `GIT_EDITOR=true` / `--no-edit` to avoid stalled commits in terminal sessions

6. **Push with the least risky method**
   - if restoring a rewritten public branch, prefer `git push --force-with-lease`
   - verify with `git ls-remote origin main` after the push
   - only report recovery complete after the remote tip and public HTTP check both agree

## Common pitfall
- A successful local commit does **not** mean the branch is recovered.
- If `origin/main` was rewritten, a plain push may reject or silently leave the recovery unfinished.
- Generated-artifact conflicts are a signal to rebuild, not to manually edit index files.

## What to preserve in rescue branches
- the pre-recovery remote tip
- the current local recovery tip
- any intermediate commit that holds the user’s lost work
