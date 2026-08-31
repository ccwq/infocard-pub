# Desc Backfill and Validation for infocard-pub

This note captures the batch backfill pattern discovered while fixing homepage cards that lacked `.desc`.

## Rule
For published cards in `infocard-pub`, `desc` is treated as required metadata for good homepage legibility.
Target length: **80–210 characters**.

## Priority order for filling `desc`
1. Existing `note`
2. HTML `<meta name="description">`
3. Short title + body summary sentences
4. Category-aware clause + tag tail
5. Filler sentence only if still below 80 chars

## Validation loop
1. Scan all `docs/**/*.meta.yaml` for missing or out-of-range `desc`.
2. Backfill the field before rebuilding `_index.yaml`.
3. Run:
   - `python3 scripts/rebuild_index.py`
   - `python3 scripts/verify_index.py`
4. Confirm the homepage now shows the `.desc` block where expected.

## Pitfalls
- Missing `desc` is usually a source-metadata gap, not a frontend rendering bug.
- The homepage only renders the desc block when `desc` or `note` exists.
- Backfilling a batch of legacy cards should be treated as a source repair, not a visual-only tweak.
- Do not leave cards with a bare title-only metadata record just because the HTML page itself has content.
