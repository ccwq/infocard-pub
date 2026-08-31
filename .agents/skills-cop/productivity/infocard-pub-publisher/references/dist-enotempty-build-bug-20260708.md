# `dist/` ENOTEMPTY Bug in Build Artifact Mode

**Date**: 2026-07-08
**Trigger**: `npm run build` on refactor branch (where `_index.yaml` and `index.html` are generated into `dist/`)

## Problem

When running `npm run build` twice without clearing `dist/`, the second invocation fails:

```
历史现场值（不可复制执行）：Error: ENOTEMPTY, Directory not empty: '/home/ccwq/infocard-pub/dist'
    at Object.rmSync (node:fs:1222:18)
    at copyStaticTreeToDist (.../index-build-lib.js:298:6)
```

**Root cause**: `copyStaticTreeToDist()` calls `fs.rmSync(DIST_DIR, { recursive: true, force: true })` then re-creates it. On second run, if any files in `dist/` are still held open or if the rmSync races, removal fails leaving `dist/` partially populated and causing subsequent `mkdir` to fail with `EEXIST` or `ENOTEMPTY`.

## Fix

Rename the existing `dist/` to `dist_bak/`, then create fresh `dist/`:

```bash
mv dist dist_bak && mkdir dist && npm run build > /tmp/build.log 2>&1 && npm run verify
# optionally rm -rf dist_bak after successful build
rm -rf dist_bak
```

## Prevention

If `dist/` exists before build, always rename rather than trust `fs.rmSync`:

```yaml
# In CI before build:
- run: |
    rm -rf dist
    npm run build
```

## When This Bug Is Relevant

Only on the dist-artifact migration branch (`refactor/ci-generated-index-artifacts`, PR #1). Main branch still writes `_index.yaml` and `index.html` in-place to repo root — this bug does not affect current publishing workflow.
