# Report + InfoCard publish pair, and `_index.yaml` rebase recovery

This note captures a common infocard-pub workflow that came up during the VoxCPM publish session.

## When the user asks for a card "including a report"
Treat it as a paired publish:

- `docs/{YYYYMMDD}-{slug}/report.md`
- `docs/{YYYYMMDD}-{slug}/index.html`
- `docs/{YYYYMMDD}-{slug}/index.html.meta.yaml`

Do not publish only the card page when the user explicitly asked for a report-inclusive deliverable.

## Minimal publish checks

1. Write both artifacts into the same directory.
2. Create/update the sidecar `.meta.yaml`.
3. Rebuild `_index.yaml` from all sidecars.
4. Verify `_index.yaml` locally before pushing.
5. Push and confirm both the card and the report are reachable on Pages.

## Rebase / concurrent publish recovery observed in this session

When `git pull --rebase` conflicts on `_index.yaml` during publish:

1. Re-run the repo's index builder.
2. Re-run the repo's index verifier.
3. Stage `_index.yaml` together with the new report/card files.
4. Continue the rebase with `GIT_EDITOR=true git rebase --continue`.
5. Push again.

## Canonical repo commands used in this session

```bash
python3 scripts/rebuild_index.py
python3 scripts/verify_index.py
git add _index.yaml docs/<slug>/
GIT_EDITOR=true git rebase --continue
git push
```

## Public verification

After deploy:

- raw GitHub content should return 200
- Pages card URL should return 200
- Pages report URL should return 200
- `/_index.yaml` should contain the new slug

## Why this matters

In infocard-pub, the publication is not complete until the report and card are both published and indexed. A card-only publish leaves the deliverable half-finished when the user explicitly asked for the report to be included.
