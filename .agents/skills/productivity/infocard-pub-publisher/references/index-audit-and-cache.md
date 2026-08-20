# infocard-pub Index Audit + Cache Verification

Session-derived recovery pattern for cases where a card exists but the public list page does not show it.

## Hard release rule

A card is not fully published until all three are true:

1. The card URL returns `200`.
2. `_index.yaml` contains the card `slug` / `path`.
3. The public homepage/list page renders the card from the index.

Do not report success after only checking the raw card URL.

## Audit every card against the index

Run this from the `infocard-pub` repo whenever the user asks whether anything is missing from the list page:

```bash
python3 ./.hermes/scripts/audit-index.py
```

If that script is not copied into the repo, use the skill support script at `scripts/audit-index.py` as the source.

The audit must check:

- `docs/*.html` count, ignoring support pages such as `docs/index.html`.
- every card HTML has a companion `docs/<name>.html.meta.yaml`.
- every meta has required fields: `slug`, `path`, `category`, `title`, `date`, `tags`.
- every meta path is present in `_index.yaml`.
- every `_index.yaml` path points to an existing file.
- duplicate `slug` and duplicate `path` are zero.

## Typical missing-index root cause

A legacy sidecar may have only:

```yaml
title: ...
desc: ...
version: ...
date: ...
path: docs/name.html
tags: [...]
```

That is not enough. Normalize it to:

```yaml
slug: name
path: docs/name.html
category: docs
title: ...
date: "YYYY-MM-DD"
tags:
  - ...
```

Optional fields such as `desc` and `version` may remain after required fields are present.

## Rebuild and push sequence

1. Add/fix missing `*.meta.yaml`.
2. Rebuild `_index.yaml` from all valid meta files.
3. Commit meta + `_index.yaml` together.
4. If `git pull --rebase` conflicts on `_index.yaml`, regenerate `_index.yaml` after the rebase conflict, then `git add _index.yaml <meta>` and continue.
5. Push.

## Public verification + stale homepage cache

GitHub Pages may serve the fresh `_index.yaml` while the browser homepage still renders old data because of service worker / Cache Storage.

Verification order:

1. Fetch `https://ccwq.github.io/infocard-pub/_index.yaml?t=<timestamp>` with cache bypass and decode bytes as UTF-8 before YAML parsing.
2. Confirm `_count == len(cards)` and the target slug is present.
3. Open `https://ccwq.github.io/infocard-pub/?t=<timestamp>` in CDP/mobile viewport.
4. If the page still shows the old count, clear site caches and unregister service workers in that tab, then reload:

```js
await caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))));
await navigator.serviceWorker.getRegistrations().then(rs => Promise.all(rs.map(r => r.unregister())));
location.reload(true);
```

5. Re-check page text and links for the target card.

Do not confuse a stale service-worker-rendered homepage with a failed index rebuild if `_index.yaml` is already correct.
