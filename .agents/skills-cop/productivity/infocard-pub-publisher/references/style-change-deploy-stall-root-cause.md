# Style-change deploy stall: root-cause analysis

## Scenario
Card's `.meta.yaml` has `style: color-material` but the live Pages deploy still shows old style. The workflow ran but the card didn't update.

## Root causes (two independent failure modes)

### 1. `_index.yaml` not rebuilt after `.meta.yaml` style change
**Signal**: GitHub Actions step 4 "Verify committed generated artifacts" **fails**. Step 5+ skipped.

**Cause**: You changed `style: hardblue` to `style: color-material` in `docs/{slug}.html.meta.yaml` but did NOT run `npm run build` to regenerate `_index.yaml`. The index still has the old `style` value. The CI `npm run verify` catches this mismatch and blocks deployment.

**Fix**:
```bash
npm run build
npm run verify
git add _index.yaml index.html
git commit -m "fix: sync _index.yaml style field for {slug}"
git push
```

### 2. Concurrent push cancelled the deploy
**Signal**: Workflow shows `cancelled` status (not `failure`). Deployed card is still old version despite the workflow having a `success` run for the same commit.

**Cause**: You pushed two commits within seconds. The second push triggered a new run that cancelled the first run via `concurrency.group: pages / cancel-in-progress: true`. The first run's deploy step was killed before it finished.

**Diagnostic via API**:
```bash
curl -s "https://api.github.com/repos/ccwq/infocard-pub/actions/runs?per_page=5&branch=main" | \
  python3 -c "import json,sys; [print(r['conclusion'], r['head_commit']['message'][:50]) for r in json.load(sys.stdin)['workflow_runs'][:5]]"
```

**Fix**: Wait for the current workflow to complete, then re-push or trigger `workflow_dispatch` via GitHub Actions UI.

### Combined failure (this session)

Three commits in tight sequence:
1. `adcb00b` — TokDoc hardblue → success, deployed
2. `04ef477` — Chubby color-material → success run, but **cancelled** by next push → old version kept
3. `37cd044` — TokDoc color-material → **verify failed** (_index.yaml still said `hardblue`) → not deployed

Net result: both cards visible on Pages were old versions despite committed files being correct. No single error message — just a silent deploy stall.

### Recovery resolution (2026-06-11)
Fix: run `npm run build` in a fresh `/tmp` clone to regenerate `_index.yaml` from all `.meta.yaml` files. This corrects any `style` field in `_index.yaml` that drifted from the committed `.meta.yaml`. Then commit all four files (`docs/slug.html`, `docs/slug.meta.yaml`, `_index.yaml`, `index.html`) and push. A single-commit fix is sufficient — the HTML files themselves were already correct; only the index was out of sync.