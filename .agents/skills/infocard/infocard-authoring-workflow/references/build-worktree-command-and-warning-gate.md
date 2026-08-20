# build-worktree command & warning gate

## Correct build command in worktree

**Context**: The worktree IS the repo root. Scripts like `build-site.js` resolve relative to the current working directory.

**Symptom**: `pnpm run build` fails with:
```
Volta error: Could not find executable "pnpm"
```

Or with `npm run build`:
```
npm error ENOENT: no such file or directory, open '/home/ccwq/package.json'
```

**Root cause**: `npm` / `pnpm` commands try to resolve `package.json` from the shell's CWD, not from the worktree. In a worktree at `/tmp/infocard/<slug>`, these commands either fail (npm looks in the wrong place) or find the wrong package.json (volta intercepts and looks in the primary checkout).

**Correct pattern**:
```bash
cd /tmp/infocard/<slug>  # worktree IS the repo root
node scripts/build-site.js
```

`scripts/build-site.js` runs directly from Node.js, resolves its own relative paths, and does not go through npm/pnpm.

## Benign build output: what is NOT an error

Typical successful build output for a new card:
```
[fix-meta-shape] WARN docs/20260815-deepseek-harness-2026.html.meta.yaml | slug mismatch: deepseek-harness-2026 != 20260815-deepseek-harness-2026
[fix-meta-shape] mode=write scanned=775 changed=0 warnings=141 errors=0
fatal: path 'docs/20260815-deepseek-harness-2026.html.meta.yaml' exists on disk, but not in 'HEAD'
[verify-meta-timestamps] OK: 1 changed meta sidecar(s), 0 taxonomy-only skipped
[build-site] wrote _index.yaml and injected index.html (775 cards)
```

**What each line means**:
| Line | Meaning | Action needed |
|------|---------|---------------|
| `slug mismatch: deepseek-harness-2026 != 20260815-deepseek-harness-2026` | Sidecar slug is `deepseek-harness-2026` but HTML file is named `20260815-...` — build script warns about this naming convention | None (warning, not error) |
| `changed=0 warnings=141` | Meta shape fixer made 0 changes to THIS file, 141 total warnings across all files | None |
| `exists on disk, but not in 'HEAD'` | New untracked file is not yet committed to git | This is normal — commit will follow |
| `wrote _index.yaml and injected index.html (N cards)` | Build succeeded | None |

**Success indicator**: Look for `wrote _index.yaml and injected index.html` + **exit code 0**. The `fatal:` line is a git HEAD status check, not a build failure.

## Commit staging after build

After `build-site.js` succeeds, both `_index.yaml` and `index.html` are regenerated. Stage them along with the new files:
```bash
git add docs/<slug>.html docs/<slug>.html.meta.yaml _index.yaml index.html
git commit -m "feat: add <slug> card"
# no push per user instruction
```

## Session evidence

DeepSeek Harness card (`20260815-deepseek-harness-2026.html`, 49,326 bytes):
- Worktree: `/tmp/infocard/harness-20260815`
- `node scripts/build-site.js` → exit 0, all cards indexed
- Git add + commit → `f43e923`
- Dist output confirmed: `dist/docs/20260815-deepseek-harness-2026.html` ✅
