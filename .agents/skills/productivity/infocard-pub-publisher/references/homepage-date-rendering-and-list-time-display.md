# Homepage date rendering and list-time display

Session note for `infocard-pub` date complaints.

## What the homepage actually does

From `assets/home/index.js`:

- `buildTimeMeta(card)` resolves time using this precedence:
  1. `updated_at` / `updated`
  2. `date`
  3. `_effective_at`, `_modified_at`, `modified_at`, `_modified_date`
  4. `_submitted_at`, `_created_at`, `created_at`, `created`
- `formatDateTime()` and `formatDateMinute()` are used for display.
- The hero summary uses `latestTimeLabel = normalizedCards[0]?.__time?.full`.
- Each list row shows:
  - `rail-time` → `card.__time.minuteFull`
  - `rail-date` → `card.__time.date`
  - `rail-clock` → `card.__time.minuteClock`

## Practical consequences

- A card can have second-level precision in `meta.yaml`, but the list row may show only **minute precision**.
- If `updated` differs from `date`, the homepage will prefer `updated` for the displayed time.
- If the user says “the list page date looks wrong”, verify both:
  - the sidecar values (`date`, `updated`)
  - the actual rendered homepage row

## Verification checklist

- Read `docs/*.meta.yaml`
- Read the built `_index.yaml`
- Inspect `assets/home/index.js` precedence and formatting
- Confirm the browser-rendered list row, not just the raw JSON
