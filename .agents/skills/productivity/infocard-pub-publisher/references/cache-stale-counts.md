# Stale count / cache mismatch recovery

## Symptom

The public homepage or card list shows an old count (for example 24 or 25) even though:
- `/_index.yaml` already contains the correct number of cards
- the repository is pushed successfully
- the page looks current after a hard refresh in another browser

## Root causes seen in practice

1. The homepage fetches `./_index.yaml` without a cache-busting query string.
2. An installed or previously visited browser retains an old service worker.
3. Pages/CDN cache keeps serving an older HTML shell while the manifest has already changed.

## Recovery pattern

1. Verify the live manifest directly:
   ```bash
   python3 - <<'PY'
   import requests, yaml
   text = requests.get('https://ccwq.github.io/infocard-pub/_index.yaml?t=check', timeout=20, headers={'Cache-Control':'no-cache'}).content.decode('utf-8', errors='replace')
   data = yaml.safe_load(text)
   print(data['_count'], len(data['cards']))
   PY
   ```
2. Make the homepage index fetch cache-busting and no-store:
   - `fetch(`./_index.yaml?t=${Date.now()}`, { cache: 'no-store' })`
3. Bump the service worker cache name and move `/_index.yaml` to network-first/no-store.
4. Re-verify in a clean browser context (new target, incognito, or after unregistering SW + clearing caches).

## What to verify before declaring success

- Public `_index.yaml` count matches the expected number of cards.
- Homepage DOM shows the same count.
- The target card appears in the list.
- A fresh browser session no longer shows the stale count.

## Notes

- Prefer fixing the homepage fetch and SW policy over telling users to hard refresh.
- If users see a stale count but the manifest is correct, treat it as a cache issue until proven otherwise.
