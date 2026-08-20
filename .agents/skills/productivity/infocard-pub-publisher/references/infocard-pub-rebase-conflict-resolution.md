# infocard-pub Rebase and Conflict Resolution

Standard procedure for resolving `_index.yaml` and `index.html` conflicts during a concurrent publish or re-release.

## The Conflict Pattern
When `git push` is rejected and `git pull --rebase` shows conflicts in `_index.yaml` and/or `index.html`.
This usually happens because multiple agents or workflows are updating the manifest's `_updated` timestamp or card count simultaneously.

## Resolution Workflow
Do **not** hand-edit the conflict markers in `_index.yaml` or `index.html`. Both are derived artifacts — regenerate them from the source of truth (`.meta.yaml` files).

### Step 0: Confirm Conflict Scope
```bash
grep -n '^<<<<<<<\|^=======\|^>>>>>>>' _index.yaml index.html
```
Only `_index.yaml` and `index.html` should show conflicts. If other files have conflicts, investigate before rebuilding.

### Step 1: Regenerate Both Generated Files
```bash
npm run build
```
This runs `node scripts/build-site.js` internally, which regenerates **both** `_index.yaml` and `index.html` from all `.meta.yaml` files. This resolves the conflict because the rebuilt versions are consistent regardless of which branch's stale version was on each side.

### Step 2: Stage the Full Release Bundle
```bash
git add _index.yaml index.html \
  docs/<slug>.html \
  docs/<slug>.html.meta.yaml \
  docs/assets/images/<slug>/   # if local assets were added
GIT_EDITOR=true git rebase --continue
```
**Always include the card HTML + meta + local assets in the same staging step** — staging only the generated files risks orphaning the card content itself.

### Step 3: Final Push
```bash
git push
```

## Verification
Always verify the public index after resolution:
```bash
curl -s https://ccwq.github.io/infocard-pub/_index.yaml | grep -n "your-new-slug"
```
Then poll the detail page for HTTP 200:
```bash
curl -sI https://ccwq.github.io/infocard-pub/docs/<slug>.html
```

## Why This Works
`_index.yaml` and `index.html` are derived state. The `.meta.yaml` files are the source of truth. `npm run build` synthesizes a clean, consistent manifest from all current meta files without regard for which branch's old version was on each side of the conflict. Both generated files are regenerated from the same source regardless of the conflict — rebuilding always resolves them.
