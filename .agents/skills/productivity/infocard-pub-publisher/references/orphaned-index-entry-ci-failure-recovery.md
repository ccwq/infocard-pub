# Orphaned Index Entry: Diagnosis and Recovery (2026-06-19)

## Symptom

CI consistently fails on `npm run verify` with no local signal:
- `npm run verify` passes locally (Node 22 or 24)
- CI `Verify Generated Index Artifacts` step fails
- `Deploy GitHub Pages` then fails
- Public pages stay on an old commit

## Root Cause

`_index.yaml` and `index.html` contain entries for an HTML file that was **never committed** (always `??` in `git status`). Locally the file exists so `build`/`verify` pass. In CI, `actions/checkout` does a fresh clone — the file is absent, `build` produces a different `_index.yaml`, and `git diff` fails.

Typical trigger: `git stash pop` after a multi-step workflow pulls in an old `_index.yaml` that was edited in an earlier session but never properly resolved.

## Diagnosis (reproducible locally)

```bash
# Clone fresh to simulate CI environment
git clone https://github.com/ccwq/infocard-pub.git /tmp/ci-test --depth=1
cd /tmp/ci-test
node scripts/verify-index.js
# Exit 1 with "_index.yaml is out of date" = orphaned entry confirmed
```

## Recovery Steps

1. **Identify orphan slugs**: `git show HEAD:_index.yaml | grep -B1 -A3 "path: docs/" | grep "slug\|path:"` — slugs whose `.html` files are `??` untracked

2. **Remove from _index.yaml**: delete the orphaned card block (slug, path, title, date, updated, tags, etc.)

3. **Remove from index.html**: same — delete the JSON card object

4. **Fix _count**: decrement `_count` in both `_index.yaml` and `index.html` by 1 per orphan removed

5. **Delete orphan files**: `rm docs/<orphan-slug>.html docs/<orphan-slug>.html.meta.yaml`

6. **Rebuild and verify**:
   ```bash
   npm run build && npm run verify
   ```

7. **Commit and push**:
   ```bash
   git add _index.yaml index.html
   git commit -m "fix: remove orphaned entries from index (files never committed)"
   git push origin main
   ```

## Prevention

After any `git stash pop` that involves `_index.yaml` or `index.html`:
1. `git status` — check for `??` untracked HTML files
2. `npm run build && npm run verify` — gate before pushing
