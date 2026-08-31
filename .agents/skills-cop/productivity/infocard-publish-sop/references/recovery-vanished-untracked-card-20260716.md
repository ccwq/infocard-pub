# Recovery note: vanished untracked card artifacts

## Trigger

A previous run reported that a card's HTML, metadata sidecar, and asset manifest had been written, but a later shared-worktree inspection found none of those paths. The research facts, bundle, and Wiki draft still existed as untracked files.

## Verified recovery path

1. Inspect current repository state before touching anything:
   - `git status --short --untracked-files=all`
   - `git log --all -- <target paths>`
   - `git reflog --all`
2. Search unreachable Git objects:
   - `git fsck --full --no-reflogs --unreachable`
   - inspect unreachable commits with `git diff-tree --no-commit-id --name-only -r <commit>`
   - inspect candidate blobs with `git cat-file -p <blob>` and match the card slug/title.
3. Restore only verified blobs into the target paths. Do not restore generated index files from an old object; rebuild them from the current repository.
4. Run the live repository gates, not historical claims:
   - `node scripts/verify-bundle.js --bundle ...`
   - `node scripts/verify-card-content.js --bundle ...`
   - `node scripts/verify-local-assets.js --bundle ...`
   - `node scripts/check-info-leak.js <html>`
5. Run the current build, then exact-stage only the card outputs and generated index files. Preserve unrelated `.tmp/`, cards, and agent artifacts.
6. Push only after commit scope is audited. Validate the public URL with `curl` and check distinctive body text, not just HTTP status.

## Why this matters

Re-running research for a sensitive-person/public-opinion card can introduce factual drift and amplify claims that were intentionally excluded. Git object recovery is the lower-risk path when the original artifacts are still reachable.

## Wiki layout drift

Bundle-declared Wiki paths may be stale. Before creating directories, inspect the live Wiki repository. In the recovered run, the actual layout was:

- `raw/articles/<date>-infocard-<slug>.md`
- `entities/<slug>.md` for the high-value entity page
- root `index.md`
- root `log.md`

Use the live layout and verify each written file; do not create empty legacy paths solely to satisfy an outdated bundle contract.
