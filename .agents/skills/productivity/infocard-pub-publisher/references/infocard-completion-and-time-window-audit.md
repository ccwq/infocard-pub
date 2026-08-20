# Infocard completion and time-window audit

Use this when the user challenges whether a card is truly complete, asks to combine the detail page with the homepage, or asks how many cards were created after a specific time.

## Completion is multi-surface, not just detail-page live

A card is complete only after these surfaces are verified and reported separately:

1. **Detail page**: public URL returns HTTP 200 and contains expected title/keywords.
2. **Public `_index.yaml`**: contains the exact slug/path and expected style.
3. **Homepage/index UI**: search the exact title or repo keyword on `https://ccwq.github.io/infocard-pub/`; confirm the card title and link are visible.
4. **Images**: every embedded local asset returns HTTP 200; for browser rendering, key images have `complete=true` and non-zero natural dimensions.
5. **Mobile**: 390px viewport has no horizontal overflow (`bad=[]`, `scrollWidth <= innerWidth` or equivalent safe value).
6. **Repo cleanliness**: `git status --short` is empty after push.
7. **Wiki sync gate**: for high-value cards, raw/page/index/log are written and committed.

If a local preview server remains running, report it as a cleanup item only; it does not invalidate public completion.

## When user asks “创建完成了吗 / combine homepage”

Do not answer from memory. Re-check the homepage surface:

- Open homepage with cache-busting query.
- Search the card title or stable keyword.
- Confirm title + link and, if visible, card count / last update / time.
- Then answer: detail page + homepage discoverability + index + git/wiki status.

## Time-window card count audit

When asked “after HH:MM created how many cards / what time / how many”, use repo metadata as source of truth:

1. Parse `docs/*.html.meta.yaml`.
2. Use `date` first; fallback to `updated` only if `date` is missing.
3. Normalize to Asia/Shanghai (`+08:00`). Do **not** infer time from slug or git commit time.
4. Filter by the requested cutoff.
5. Return count plus rows: time, title, style, public URL, and source URL.
6. If the user references the homepage, cross-check public homepage/card count/search separately, but the count should still come from meta files.

Example output shape:

| 时间 | 标题 | 风格 | URL |
|---|---|---|---|
| 2026-06-15 21:36:51 | ... | `infocard-darkblue-style` | https://... |

End with a direct conclusion: `18 点之后共 N 个。`
