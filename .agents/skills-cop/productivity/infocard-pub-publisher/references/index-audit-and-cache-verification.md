# infocard-pub index audit + cache verification pattern

Session-derived pattern for cases where a card page exists but the list page does not show it, or the browser still displays an old card count.

## What went wrong

Two distinct problems can look similar:

1. **Source/index mismatch**
   - A `docs/*.html` card exists but has no `docs/*.html.meta.yaml` sidecar.
   - Or the sidecar exists but lacks required fields: `slug`, `path`, `category`, `title`, `date`, `tags`.
   - Or `_index.yaml` does not include the sidecar path/slug.

2. **Browser/PWA cache staleness**
   - Public `_index.yaml` already has the correct count, but `https://ccwq.github.io/infocard-pub/` still shows the previous count because the service worker/cache is serving stale data.
   - A cache-busted fetch from the page context can see the new YAML while the rendered list remains old until caches/SW are cleared.

## Required audit before declaring the release complete

Run from the `infocard-pub` repo root:

```bash
python3 scripts/audit-infocard-index.py
```

Expected clean output shape:

```text
HTML_COUNT N
META_COUNT N
INDEX_COUNT_FIELD N
INDEX_CARDS_LEN N
MISSING_META 0
META_MISSING_REQUIRED 0
META_NOT_INDEXED 0
INDEX_POINTS_TO_MISSING_FILE 0
DUP_SLUG 0 []
DUP_PATH 0 []
```

If the script is not present in the repo, use the copy packaged with this skill: `scripts/audit-infocard-index.py`.

## Public verification sequence

1. Verify the direct card URL returns `200`.
2. Fetch `_index.yaml` as bytes and decode explicitly as UTF-8 before YAML parsing:

```python
import requests, yaml
text = requests.get('https://ccwq.github.io/infocard-pub/_index.yaml?t=verify', timeout=20).content.decode('utf-8')
data = yaml.safe_load(text)
print(data['_count'], len(data['cards']))
```

Avoid feeding `requests.text` directly into `yaml.safe_load` when non-ASCII content is present; if encoding is guessed incorrectly, YAML may fail with an `unacceptable character #x0080` error.

3. In Chrome/CDP, if the homepage still renders the old count:

```js
await Promise.all((await caches.keys()).map(k => caches.delete(k)))
await Promise.all((await navigator.serviceWorker.getRegistrations()).map(r => r.unregister()))
location.reload(true)
```

4. Re-check DOM text for:
   - total count equals `_index.yaml` count
   - target title/link appears in the list

## Important acceptance rule

For the user's infocard workflow, **a card is not fully published until the homepage/list page shows it**, not merely because the raw HTML URL returns `200`.
