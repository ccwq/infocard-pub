# CI generated-artifacts failure diagnosis

This note captures a repeated publish failure mode observed during infocard-pub releases.

## Symptom
- The public Pages URL stays `404` after a push.
- GitHub Actions shows workflow runs for the same SHA, but the deploy job fails before Pages deployment.
- The failing step is often **Verify committed generated artifacts**.

## Root cause pattern
- `npm run build` mutates generated files such as `_index.yaml` and `index.html`.
- If those generated files are not staged and committed together with the card HTML/meta bundle, the verification job fails in CI.
- A local commit can look complete while still being missing the regenerated index artifacts required by the repo.

## Triage sequence
1. Check the latest workflow runs for the exact SHA.
2. Inspect the deploy job / verify job and find the first failing step.
3. If the failure is `Verify committed generated artifacts`, rerun `npm run build` locally and inspect the diff for `_index.yaml` and `index.html`.
4. Commit the regenerated index artifacts together with the content change.
5. Re-push and verify the page again only after the workflow turns green.

## Notes
- A public `404` is not enough to conclude the card HTML is wrong.
- When the deploy workflow fails before the Pages upload step, the release is blocked even if the content files themselves were committed.
- This failure mode often appears right after adding a brand-new card or after any meta/content change that affects the index.
