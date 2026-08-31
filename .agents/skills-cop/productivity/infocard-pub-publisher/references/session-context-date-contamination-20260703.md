# Session Context Date Contamination (2026-07-03)

## Symptom

planning-with-files-cookbook card was created with date `2026-07-02` in filename, meta.yaml, and topbar. Actual date was `2026-07-03`.

The session compacted summary contained a stale "date anchor" from a prior context window:
```
当前时间锚：`2026-07-02`（但具体工作发生在 `2026-07-01`）
```

The agent trusted this stale anchor instead of calling `TZ=Asia/Shanghai date` at execution time.

## Root Cause

Session compaction summary preserved a historical "time anchor" that was accurate for a prior session but stale for the current one. The agent did not re-verify the current date at the point of writing meta.yaml `date`/`updated`.

## Prevention Checklist

Every time you write a meta.yaml for a new or republished card:

- [ ] Call `TZ=Asia/Shanghai date "+%Y-%m-%d"` — do not trust session metadata
- [ ] Use the output as `date` and `updated` in meta.yaml
- [ ] Use the same output in the HTML topbar/footer date display
- [ ] Name the file as `YYYYMMDD-slug.html` using the same verified date
- [ ] If you rename an existing file (e.g. 20260702 → 20260703), update ALL three: filename, meta.yaml date, HTML display date

## What NOT to do

- Do not trust `当前时间锚` in session compacted summary
- Do not trust the filename slug as a date source (e.g. `20260702-*.html` → `date: 2026-07-02`)
- Do not trust the session timestamp shown in the system prompt

## Verification

After writing the card, run:
```bash
TZ=Asia/Shanghai date "+%Y-%m-%d"
grep -n "date:\|2026-" docs/<slug>.html.meta.yaml
```

The meta.yaml date must match the output of `date` command.
