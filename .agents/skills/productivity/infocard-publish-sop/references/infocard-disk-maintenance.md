# infocard-disk-maintenance

## Disk space guard thresholds

| Free space | Status | Action |
|---|---|---|
| > 2 GB | `OK` | Proceed normally |
| 1–2 GB | `WARN` | Note in status; proceed if task fits |
| < 1 GB | `BLOCKED_AT_CAPACITY` | Must clean up before creating worktrees |

Run `df -B1 /` before any `git worktree add`. Threshold is per-run, not cumulative.

## Known space hogs and safe cleanup commands

### 1. Legacy path: /tmp/infocard-runs (old pattern, now superseded)

The actual worktree location is `/tmp/infocard/` — not `/tmp/infocard-runs/`.
Multiple worktrees can accumulate here, each a full repo clone (~344 MB), and orphan
directories persist even after `git worktree remove` if not tracked by the git index.

**Primary pattern: /tmp/infocard/** — this is where worktrees live.

```bash
# List all worktrees with sizes and modification times
du -h --max-depth=1 /tmp/infocard 2>/dev/null | sort -hr

# Check if a specific worktree's card was already published
git -C ~/hehome/hermes-data/home/qbox/opendir/project/infocard-pub \
  log --oneline --all | grep <slug>

# Check for recent writes (active worktrees have recent mtimes)
ls -la /tmp/infocard/<worktree>/integration/

# Remove cleanly-registered worktree
git -C ~/hehome/hermes-data/home/qbox/opendir/project/infocard-pub \
  worktree remove /tmp/infocard/<worktree> --force 2>/dev/null

# Remove unregistered orphan
rm -rf /tmp/infocard/<worktree>
```

**Orphan detection:** A worktree absent from `git worktree list` but still holding full
docs/dist/assets is an orphan. Always scan `/tmp/infocard/` directly — worktree list is
not authoritative for cleanup state.

### 2. Orphaned worktrees — detection and safe removal (2026-07-22)

**Root cause of cleanup failures:** A script that creates worktrees via `cp -r` or `git clone` instead of `git worktree add` produces directories invisible to `git worktree list` and immune to `git worktree remove`. The cleanup step silently skips them, leaving ~344 MB orphans per worktree.

**Detection:** A worktree is orphaned if it has a full repo structure (docs/dist/assets) but is absent from `git worktree list`.

```bash
# Step 1: find all directories with a .git file under /tmp/infocard
for d in /tmp/infocard/*/; do
  if [ -f "$d/.git" ]; then
    git -C "$d" branch --show-current 2>/dev/null || echo "detached"
    echo "WORKTREE: $d"
  else
    echo "NOT_WT:  $d"
  fi
done

# Step 2: cross-reference against git worktree list
cd ~/hehome/hermes-data/home/qbox/opendir/project/infocard-pub
git worktree list

# Any .git-file directory absent from worktree list = orphan → rm -rf
```

**Safe removal conditions:**
- Card already published to main (slug exists in docs/ with matching date), OR
- Explicit user authorization to discard

**Prevention:** Always create worktrees via `git worktree add`. Do NOT use `cp -r` or `git clone` as a substitute for the creation step.

**This session (2026-07-22):** 5 orphaned worktrees × ~344 MB = ~1.7 GB cleared. Pre: 92% / 3.9 GB free. Post: 90% / 5.0 GB free.

### 3. npm _npx temporary execution cache

```bash
rm -rf ~/.npm/_npx   # regenerable; next npx re-downloads
```

**This session**: 935 MB freed.

### 4. Buildah build cache

```bash
rm -rf /var/tmp/buildah-cache-1000   # regenerable
```

**This session**: 427 MB freed.

### 5. Large stale log files (truncate in-place to preserve inode)

```bash
> /home/ccwq/hermes-data/logs/automation-chrome.log
# or: truncate -s 0 /home/ccwq/hermes-data/logs/automation-chrome.log
```

**This session**: 304 MB truncated.

### 6. Duplicate infocard-repo copies

```bash
# Check staleness
git -C ~/infocard-pub rev-parse HEAD origin/main
# Remove regenerable dist/
rm -rf ~/infocard-pub/dist
```

**This session**: 709 MB freed from dist/; 914 MB remains.

### 7. Hermes state.db — DO NOT while Hermes is running

```bash
# Safe dry-run pruning
hermes sessions prune --older-than 30d --dry-run
hermes sessions prune --older-than 14d --dry-run
# Actual (irreversible) — requires explicit authorization
hermes sessions prune --older-than 30d
```

**This session**: 30d threshold → 2,328 / 3,672 sessions eligible; NOT executed without explicit authorization.

## Cleanup workflow

```
1. df -B1 /  → check threshold
2. BLOCKED_AT_CAPACITY:
   a. Remove completed worktrees via git worktree remove
   b. Detect and remove /tmp/infocard orphans (see section 2 above)
   c. Clear regenerable caches (_npx, buildah)
   d. Truncate oversized logs
3. df -B1 / → confirm > 1 GB free
4. Report what was removed, how much recovered, current free space
```

## NOT safe to clean blindly

- `/var/log/journal` — requires root; vacuum may be rejected for non-root users
- `~/.volta` — breaks volta-managed Node.js toolchain
- `~/.local` — pip/uv tools; partially unreadable without elevation
- `chrome-profile` / `.chrome-cdp-profile` — may be in use; check `lsof +D /tmp` first
- `state.db` while Hermes is running

## Lessons

- Infocard worktrees are the #1 sudden spike source during active production
- Cleanup should happen as part of each card's closeout step
- Subagent timeouts create abandoned worktrees that don't self-clean
- A 50 GB root fills fast with full-repository worktrees + dist/ + node_modules
- **Worktree creation method determines whether cleanup works** — `git worktree add` is the only safe creation path; non-git clones are invisible to cleanup and silently accumulate
