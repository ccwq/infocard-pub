# infocard-pub Repository State Reference

## Current (post-fix) State (as of 2026-05-27)

### index.yml workflow (`.github/workflows/index.yml`)
```yaml
name: Build Infocard Index
on:
  push:
    branches:
      - main
    paths:
      - '**/*.meta.yaml'
      - '_index.yaml'
  workflow_dispatch:

permissions:
  contents: write  # CRITICAL: must be write to push _index.yaml back

jobs:
  build-index:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build _index.yaml
        run: |
          python3 << 'PY'
          # reads all *.meta.yaml, uses git commit ts for sort, writes _index.yaml
          # outputs: _count, _updated, cards[]
          PY
      - name: Upload _index.yaml as artifact
        uses: actions/upload-artifact@v4
        with:
          name: infocard-index
          path: _index.yaml
          retention-days: 1
      - name: Commit _index.yaml to repo  # CRITICAL: keeps repo in sync
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add _index.yaml
          git diff --cached --quiet && exit 0
          git commit -m "chore: sync _index.yaml [skip ci]"
          git push
```

### pages.yml workflow (`.github/workflows/pages.yml`)
```yaml
name: Deploy GitHub Pages
on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true
```

Pages deploys the entire repo (including `_index.yaml`) as artifact.

## Known Broken State (for reference — now fixed)

- **Date of incident**: ~2026-05-27
- **Symptom**: `ccwq.github.io/infocard-pub/` showed "总卡片数 0 / 无匹配结果"
- **Root cause**: 
  1. `index.yml` lacked `contents: write` and never pushed `_index.yaml` back to repo
  2. A manual "Rebuild index" commit pushed a partial `_index.yaml` (was 196 lines, became 91 lines: only 9 of 16 cards)
  3. Two cards (`nick-team-roster-card`, `wot-coin`) had malformed meta.yaml (missing `slug`/`category` fields — format used `title`/`desc`/`version` top-level instead)
- **Recovery steps taken**:
  1. Restored `_index.yaml` from git commit `c9740b0`
  2. Fixed meta.yaml format for the two broken cards
  3. Added `contents: write` to `index.yml`
  4. Added commit step to `index.yml`
  5. Added `_index.yaml` to trigger paths
  6. Rebuilt index locally (18 cards) and pushed

## Current Card Count (as of 2026-06-05)
- HTML files in `docs/`: 23 (旧版 fact-store.html 已由 20260605-fact-store-v2.html 覆盖)
- Entries in `_index.yaml`: 23
- Homepage shows all 23 cards

## Key Verification Commands

```bash
# Check index card count
curl -s https://ccwq.github.io/infocard-pub/_index.yaml | grep "^- " | wc -l

# Check _count field
curl -s https://ccwq.github.io/infocard-pub/_index.yaml | grep "_count"

# List all slugs in index
curl -s https://ccwq.github.io/infocard-pub/_index.yaml | grep "^- "

# Compare with local meta.yaml count
ls infocard-pub/docs/*.meta.yaml | wc -l

# Find missing (have meta.yaml but not in index)
python3 -c "
import glob, yaml
meta = {}
for f in sorted(glob.glob('**/*.meta.yaml', recursive=True)):
    if '.git' in f: continue
    with open(f) as fp:
        data = yaml.safe_load(fp)
    meta[data.get('slug','')] = f
with open('_index.yaml') as fp:
    idx = yaml.safe_load(fp)
indexed = set(c.get('slug','') for c in idx.get('cards',[]))
missing = {v for v in meta.values() if v not in indexed}
print('Missing:', missing)
"
```