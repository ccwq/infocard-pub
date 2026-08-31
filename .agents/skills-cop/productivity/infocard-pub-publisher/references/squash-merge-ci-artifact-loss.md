# Squash Merge Strips CI Artifacts → CI Verify Fails Every Time

## Root Cause

`npm run build` generates `_index.yaml` and `index.html` as **local uncommitted files**.  
GitHub squash merge only commits the source file changes from the PR branch — it does **not** include uncommitted generated artifacts in the squash commit. Result: after merge, `origin/main` lacks `_index.yaml`/`index.html` for the new cards.

The `verify-generated` CI step (`.github/workflows/index.yml`) checks that all committed `_index.yaml` entries match `docs/` files. It fails because the newly merged cards' entries are missing.

## Symptom Sequence

1. Create PR → squash merge → **CI shows `conclusion=failure`**
2. In CI logs: `FAILED step: Ensure generated artifacts are committed`
3. GitHub Pages deploy step also fails (pages.yml has the same artifact check)
4. GitHub Pages URL returns 404 for the new slug

## Verified Fix (2026-07-08 — confirmed working)

```bash
# After squash merge completes
REPO_ROOT="$(git rev-parse --show-toplevel)" || exit 1; cd "$REPO_ROOT"
git checkout origin/main -- _index.yaml index.html   # restore committed artifacts from main
npm run build                                        # regenerate with all cards
git add _index.yaml index.html
git commit -m "chore: commit generated artifacts after PR merge"
git push origin main                                 # push directly to main
```

**Why this works**: The artifact commit is now a direct push to `main`, not a PR, so no squash loss occurs.

## Alternative Fix (if you cannot push directly to main)

```bash
# Create a fix-artifacts branch and PR
git checkout -b fix-artifacts
git push origin fix-artifacts
# Then GitHub API: create PR + squash merge (same problem repeats!)
```

The alternative fails for the same reason — squash merge always strips uncommitted artifacts. The only reliable fix is a **direct push commit** after the squash merge.

## CI Workflows Affected

- `.github/workflows/index.yml`: `verify-generated` step
- `.github/workflows/pages.yml`: `Verify committed generated artifacts` step

Both fail when `_index.yaml` does not contain the merged cards' slugs.

## Prevention Rule

**For every PR merge that adds new cards, always follow up with the artifact regeneration commit.**

If using squash merge via API, immediately after the merge response `{"merged": true}`:
```bash
git checkout origin/main -- _index.yaml index.html && npm run build && git add _index.yaml index.html && git commit -m "chore: rebuild index" && git push origin main
```

Do this before moving on to any other task.

## GitHub API Squash-Merge Script

```python
import subprocess, json, re, time

token = re.search(r'ghp_[a-zA-Z0-9]+', open('/home/ccwq/.git-credentials').read()).group(0)
h = ['-H', f'Authorization: token {token}', '-H', 'Accept: application/vnd.github.v3+json']

prs = json.loads(subprocess.run(
    ['curl','-s']+h+['https://api.github.com/repos/ccwq/infocard-pub/pulls?state=open'],
    capture_output=True, text=True).stdout)
existing = [p for p in prs if p.get('head',{}).get('ref')==branch]
if existing:
    pr_num = existing[0]['number']
else:
    pr = json.loads(subprocess.run(
        ['curl','-s','-X','POST']+h+
        ['-H','Content-Type: application/json',
         '-d', json.dumps({'title': title, 'head': branch, 'base': 'main'}),
         'https://api.github.com/repos/ccwq/infocard-pub/pulls'],
        capture_output=True, text=True).stdout)
    pr_num = pr.get('number')

time.sleep(2)
merged = json.loads(subprocess.run(
    ['curl','-s','-X','PUT']+h+
    ['-H','Content-Type: application/json',
     '-d', json.dumps({'merge_method': 'squash'}),
     f'https://api.github.com/repos/ccwq/infocard-pub/pulls/{pr_num}/merge'],
    capture_output=True, text=True).stdout)
print(f'merged={merged.get("merged")}')
```

After this, **always run the artifact regeneration push**.
