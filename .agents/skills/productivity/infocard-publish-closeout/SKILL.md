---
name: infocard-publish-closeout
description: Use when finishing an infocard publish and you need a deterministic closeout pass for residues, worktrees, wiki sync, and final cleanliness.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [devops, publishing, infocard, cleanup, verification, workflow]
    related_skills: [infocard-pub-publisher, delegated-infocard-publishing, infocard-mobile-verifier]
---

# Infocard Publish Closeout

## Overview

This skill turns “the card is already published” into a stricter state: the target deliverable is done, and the workspace is clean enough that the next publish does not inherit residues from the previous one.

Use this after an infocard has been built, verified, pushed, and checked on Pages, when you still need to clear leftover files, temporary worktrees, stale branches, or other ambient debris.

It is intentionally narrower than the main publishing skill:
- `infocard-pub-publisher` handles build / push / verify.
- `infocard-publish-closeout` handles what remains after publication.

## When to Use

Use this skill when:
- A publish is complete but `git status` is not clean.
- Temporary worktrees or `/tmp` publishing directories still exist.
- Untracked asset directories were left behind by a subagent or rescue pass.
- You want to make sure “done” means “done and cleaned”.
- You want a final pass before reporting completion to the user.

Do not use this skill for:
- Initial research or card drafting.
- The first build / verify / push sequence.
- Pure wiki editing unrelated to publish residues.

## Closeout Procedure

### 0) No-publish / worktree-only variant

When the requested outcome is a committed draft in an isolated worktree rather than a public release:

- Start the worktree from freshly fetched `origin/main`.
- Do not run publish, push, Pages, or public-URL verification steps.
- Reuse an existing main-repository `node_modules` only when needed; do not install dependencies for the draft task.
- Run the repository build/verify/check-leak gates, then inspect the diff because build can rewrite generated `_index.yaml`, `index.html`, or timestamps.
- Restore unrelated generated changes, remove temporary symlinks/helper files, stage only the requested card bundle, commit, and verify the final worktree is clean and ahead of `origin/main` without pushing.
- Report the absolute worktree path, commit SHA, exact artifact paths, and actual command output summary.

### 1) Separate deliverable from residue
Write down two buckets:
- **Target deliverable**: the card(s), wiki pages, and their commit(s).
- **Ambient residue**: temporary worktrees, untracked asset folders, scratch files, backup exports, and unfinished local branches.

Never treat residue as part of the deliverable.

### 2) Verify the publish is truly complete
Before cleanup, confirm the card is not only present locally but also actually published:
- Public URL returns HTTP 200.
- Required keywords appear on the page.
- The local `dist/docs/<slug>.html` and public HTML both contain at least one newly added, release-specific content fingerprint; build exit code alone is insufficient.
- `_index.yaml` contains the slug.
- 390px mobile layout has no horizontal overflow.
- Save button exports a real PNG, not print dialog behavior.
- Wiki raw + concept/entity + index + log are written and pushed when the card is high value.

### 3) Check the workspace
Run:
```bash
git status -sb
git worktree list
```
Look for:
- untracked `docs/assets/...` directories
- unexpected modified files
- detached or behind worktrees that are no longer needed

**Capacity guard:** enumerate and size every temporary worktree before a new publish run. A released card can leave a full repository copy plus `dist/`, so repeated worktrees multiply storage quickly. After public verification, remove only worktrees that are clean and whose commits are reachable from the confirmed release branch. If an otherwise stale worktree has untracked residue, inspect and classify it before using `--force`. Do not leave an unregistered former-worktree directory behind: inspect its `git status`, preserve a patch if it holds unique work, then remove it only under explicit cleanup authorization.

### 4) Remove only the residue
Safely delete or archive leftover artifacts that are not part of the publish bundle.

Typical removals:
- scratch files in `/tmp`
- untracked asset subdirectories created during a failed or partial publish
- obsolete temporary worktrees after verification

Never delete a file that has not already been verified as residue.

### 5) Recheck cleanliness
After cleanup, repeat:
```bash
git status -sb
```
The expected result is either:
- completely clean, or
- only the explicitly intentional branch/worktree that you decided to keep.

### 6) Report with separation of concerns
When you answer the user, separate:
- what was published
- what was cleaned
- what remains intentionally open, if anything

## Common Pitfalls

1. **Calling publish “done” while the workspace is dirty.**
   That hides the next failure behind the current success.

2. **Deleting assets before confirming they are residue.**
   Some untracked asset folders are still needed for the committed page.

3. **Mixing old worktree state with current publish state.**
   Always inspect `git worktree list` separately from the main repo.

4. **Reporting only the target deliverable and omitting cleanup state.**
   The user asked for a completed publish, not just a published URL.

5. **Forgetting wiki closeout.**
   For high-value infocards, wiki sync is part of completion, not an optional appendix.

## Verification Checklist

- [ ] Published page returns HTTP 200
- [ ] Required keywords are visible
- [ ] `_index.yaml` contains the slug
- [ ] 390px mobile layout has no horizontal overflow
- [ ] Save button exports a real PNG
- [ ] Wiki raw / concept / index / log are synced if required
- [ ] `git status -sb` is clean or intentionally scoped
- [ ] Temporary residue has been removed
- [ ] Final report clearly separates deliverable vs cleanup
