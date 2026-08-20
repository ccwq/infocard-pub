# Generated index as Pages artifact migration

## Context

`infocard-pub` historically committed `_index.yaml` and the homepage `index.html` with a huge injected `home-index-data` JSON block. This made every publish fight over global generated files and caused repeated `Ensure generated artifacts are committed` failures, especially when multiple subagents pushed cards in parallel.

## Durable fix pattern

Move generated index artifacts out of source history and into the GitHub Pages artifact:

1. Source tree keeps a small `index.html` shell only.
2. `npm run build` creates `dist/` and copies the static tree there.
3. Build writes:
   - `dist/_index.yaml`
   - `dist/index.html` with injected `home-index-data`
4. Pages workflow uploads `dist/`, not `.`.
5. `_index.yaml` and `dist/` are ignored in git.
6. CI verifies generated artifact, not committed generated files.

## Key code changes

### `scripts/index-build-lib.js`

- Add `DIST_DIR = path.join(ROOT_DIR, "dist")`.
- Point `INDEX_PATH` and `INDEX_HTML_PATH` to `dist/`.
- Keep `SOURCE_INDEX_HTML_PATH = path.join(ROOT_DIR, "index.html")`.
- Before writing generated files, remove/recreate `dist/` and copy source files into it, skipping `.git`, `node_modules`, `dist`, `.claude`, `.DS_Store`.
- Read source `index.html`, inject data, write the result to `dist/index.html`.

### `index.html` / `assets/home/index.js`

- Remove committed `<script id="home-index-data">…</script>` from source `index.html`.
- Source `index.html` must load `assets/home/vendor/js-yaml.min.js` before `assets/home/index.js`.
- Homepage loader should:
  - use injected data if `#home-index-data` exists (artifact path), else
  - fetch `./_index.yaml?t=${Date.now()}` with `cache:'no-store'` and parse via `jsyaml.load`.

### workflows

`pages.yml`:

```yaml
- name: Build site artifact
  run: npm run build

- name: Verify generated artifact
  run: npm run verify

- name: Verify taxonomy completeness
  run: npm run verify-taxonomy

- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: dist
```

Smoke test should compare remote `_index.yaml` with `dist/_index.yaml`, and extract injected data from `dist/index.html`.

`index.yml` should also stop self-mutating commits. Run build/verify/verify-taxonomy only; do not run `fix-taxonomy` with auto-commit and do not gate on `git diff --exit-code` after build.

## Validation checklist

```bash
npm run build
npm run verify
npm run verify-taxonomy
test -f dist/_index.yaml
test -f dist/index.html
grep -q 'home-index-data' dist/index.html
! grep -q 'home-index-data' index.html
```

Optional local HTTP check:

```bash
python3 -m http.server 4174 -d dist
curl -s -o /tmp/home.html -w '%{http_code}\n' http://127.0.0.1:4174/
curl -s -o /tmp/index.yaml -w '%{http_code}\n' http://127.0.0.1:4174/_index.yaml
```

Expected: both 200, home contains `home-index-data`, YAML contains `cards:` and the latest slug.

## PR workflow guardrails

- Do this migration on a branch/PR, not directly on `main`.
- Before committing, inspect `git status -sb` and stage explicit files. Do not sweep in unrelated untracked card assets from concurrent publishing work.
- If main advances while preparing the PR, merge/rebase `origin/main` into the migration branch, rerun build/verify, then push the branch.

## Why this is better

- Future card publishes only commit source HTML/meta and supporting assets.
- Parallel agents stop conflicting on `_index.yaml` and injected homepage payload.
- Pages deploys exactly the artifact it smoke-tests.
- Git history stops accumulating `ci: commit generated artifacts` noise.
