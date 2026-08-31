# Publish Recovery and Verification

Load this reference only after a frozen batch reaches build, Git synchronization, push, or public verification.

## Generated index

After `npm run build`, synchronize the generated root artifacts before staging:

```bash
cp dist/_index.yaml _index.yaml
cp dist/index.html index.html
```

For every candidate, confirm its slug is present in both the generated and root index. `dist/` is ignored and is not itself staged. See `build-index-sync-gotcha.md` for the underlying repository behavior.

## Exact staging

Derive the allowed staged paths from the frozen batch manifest. Inspect the real staged set before committing/pushing:

```bash
git diff --cached --name-only
```

It must equal the union of candidate allowlists plus `_index.yaml` and `index.html`. Do not stage process files, screenshots, agent logs, `.tmp/`, `.hermes/`, or unrelated worktree changes.

## Git recovery

Before build/commit/push, inspect the remote state. If the branch is behind, rebase before regenerating generated artifacts:

```bash
git fetch origin
git rebase origin/main
npm run build
cp dist/_index.yaml _index.yaml
cp dist/index.html index.html
```

If a generated index conflict occurs during rebase, regenerate/synchronize the index and continue the rebase. Never use `git rebase --skip` for an index-only conflict: it discards the entire candidate commit, not merely the generated file conflict.

On an agent timeout, inspect actual evidence in this order:

```text
working-tree status/diff → target gate → local commit/log → origin/main → public URL
```

Reuse a valid partial artifact. Rebuild only the missing or invalid part.

## Public page evidence

Use a cache-busting URL for every candidate. GitHub Pages may return a transient 404 after a successful push. Poll with a fixed budget: wait 10 seconds, then up to two additional 20-second attempts.

For every successful response, verify all of:

1. HTTP status is 200;
2. page title matches the candidate;
3. at least one card-specific expected keyword is present; and
4. root/public index includes the slug.

HTTP 200 with an old title or missing expected keyword is stale propagation, not success. A bounded polling failure leaves that card `PARTIAL` or `FAILED`.

## Browser, mobile, and visual evidence

Use a fresh isolated browser target/context and a cache-busting URL. Verify at desktop and at 390px:

- `document.documentElement.dataset.theme` and the sidecar style agree;
- document/body scroll width does not exceed client width at 390px;
- images and fonts settle before capture;
- the screenshot belongs to this URL, theme, and time; and
- visual review confirms the expected theme/layout rather than merely HTML tokens.

A CDP/browser failure is `SKIPPED`, never PASS. It blocks a complete-publication claim until the user explicitly accepts another disposition. Static CSS checks are diagnostic only; they do not replace the 390px browser result.

## Historical debt

Record repository-wide verify failures that are demonstrably unrelated to every frozen candidate. Do not auto-fix them in the current batch. Any failure involving a candidate's HTML, sidecar, asset, index entry, or required verification remains blocking.

## Completion criterion

Every candidate has exact staging evidence, push evidence, public title/keyword/index evidence, 390px evidence, and a fresh visual check. Missing Wiki closure is tracked separately as `PARTIAL`.
