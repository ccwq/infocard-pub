# `_index.yaml` 500-Card Truncation: Build Timeout / Partial Write

## Symptom

Two new infocard files (HTML + meta.yaml) are written and committed. After `npm run build`, the new card:
- Does NOT appear in `_index.yaml` (verified: `_count: 500`, old cards only)
- Gets HTTP 404 on GitHub Pages despite being in `docs/`
- `npm run verify` still passes (it validates existing cards, not build completeness)

Build output shows the process is **timing out** at ~60s with "SKIP" lines for all 510 files, meaning the write phase completes in background after shell returns.

## Root Cause

`npm run build` runs three sub-scripts sequentially:
1. `fix-meta-shape.js`
2. `fix-meta-date.js` (scans 510 files)
3. `index-build-lib.js → buildIndexData() → writeGeneratedArtifacts()`

The Node.js process is slow enough that the shell command times out at step 3 *before* `_index.yaml` is written. The process continues in background; when it finally writes, `git status` in a fresh shell doesn't see the uncommitted change.

Consequence: old `_index.yaml` (500 cards) stays on disk, gets committed with the new HTML, deploys as 404.

## Diagnosis

After any `npm run build` that times out:
```bash
# Check _count in _index.yaml vs actual meta files
_count=$(grep "_count:" _index.yaml | head -1)
echo "_count: $_count"
meta_count=$(find docs/ -name "*.meta.yaml" | wc -l)
echo "meta.yaml count: $meta_count"
# If _count < meta_count → truncation happened
```

Or check directly:
```python
import yaml
with open('_index.yaml') as f:
    d = yaml.safe_load(f)
cards = d.get('cards', [])
print(f'_count: {d["_count"]}, actual: {len(cards)}')
```

## Fix (One-Line Node.js — No Build Script)

```javascript
// From repo root, run via node --eval (no npm install needed)
node --eval "
const { buildIndexData, serializeIndexYaml } = require('./scripts/index-build-lib');
const fs = require('fs');
const result = buildIndexData();
console.log('_count:', result._count, 'cards:', result.cards.length);
// Check card exists in memory
const found = result.cards.filter(c => c.slug === 'TARGET-SLUG');
console.log('In-memory found:', found.length);
const yaml = serializeIndexYaml(result);
fs.writeFileSync('_index.yaml', yaml, 'utf8');
console.log('_index.yaml written, size:', yaml.length);
"
```

If card exists in memory (`In-memory found: 1`) but was missing from `_index.yaml` → truncation confirmed. The `fs.writeFileSync` above fixes it.

## Prevention

1. Use a **longer timeout** for the build command (e.g. `timeout 300 npm run build` in shell, or just wait for full completion)
2. After any build that shows timeout/partial output, always verify `_count` before committing
3. CI `verify` step only validates existing cards — it does NOT catch truncated index

## Related

- `dist/_index.yaml` always has the correct 511-card count (write completes there) — can be copied as backup
- `fix-meta-date.js --write` does NOT affect `_index.yaml`, only meta sidecars
