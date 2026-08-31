# CI build artifact mismatch: root cause and fix

## Symptom

After running `npm run build && npm run verify` locally (both pass), pushing to GitHub triggers CI failure:

```
Verify committed generated artifacts | completed | failure
  4. Verify committed generated artifacts | completed | failure
```

The CI workflow step "Ensure build does not mutate tracked files" fails because `_index.yaml` and/or `index.html` changed during the local `npm run build` but were NOT committed.

## Root cause

`npm run build` (specifically `node scripts/build-site.js`) regenerates `_index.yaml` and injects updated data into `index.html`. These are tracked files. If they changed since the last commit, CI's `git diff --exit-code` catches the mismatch.

The typical sequence that creates this:

1. Write HTML + meta.yaml for new card
2. Run `npm run build && npm run verify` → both pass
3. `git add` + `git commit` + `git push` → **CI fails** because build modified _index.yaml/index.html AFTER the previous commit

This happened with `20260702-planning-with-files-cookbook.html` and `20260702-dagu.html`.

## Fix: two-step commit

After `npm run build && npm run verify`:

```bash
# Check which files changed
git status -s

# If _index.yaml or index.html changed, add and amend the commit
git add _index.yaml index.html
git commit -m "chore: rebuild index after <card-slug> (fix CI artifact mismatch)"
git push origin main
```

## Prevention

The safest sequence for new card publishing:

1. `git status -sb` at start → stash if branch diverged
2. Write HTML + meta.yaml
3. `npm run build && npm run verify`
4. `git status -s` → if _index.yaml or index.html changed: `git add _index.yaml index.html`
5. `git add docs/<slug>.html docs/<slug>.html.meta.yaml`
6. Commit and push together

This ensures the index rebuild is in the same commit as the new card.

## CI workflow reference

```yaml
# .github/workflows/pages.yml
- name: Verify committed generated artifacts
  run: |
    if (git diff --exit-code); then
      echo "PASS: no uncommitted generated artifacts"
    else
      echo "FAIL: _index.yaml or index.html changed. Run 'npm run build' and commit the result."
      exit 1
    fi
```

The CI does NOT run `npm run build` — it only checks that YOU already ran it and committed the result.
