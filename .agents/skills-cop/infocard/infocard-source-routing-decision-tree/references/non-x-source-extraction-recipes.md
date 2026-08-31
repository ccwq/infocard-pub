# Non-X source extraction recipes

Concise curl + python snippets the orchestrator can copy verbatim. Each recipe is one fetch + one parser; if the parser returns `NONE` for a key field, stop and ask the user rather than guessing.

## YouTube watch page → metadata blob

```bash
VIDEO_ID="8RedSkw1UjE"
curl -sL "https://www.youtube.com/watch?v=$VIDEO_ID" \
  -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
  | python3 -c "
import sys, re, json
h = sys.stdin.read()
m = re.search(r'var ytInitialPlayerResponse = (\{.+?\});', h)
if not m:
    print('NO_PLAYER_RESPONSE')
    sys.exit(1)
d = json.loads(m.group(1))
micro = d.get('microformat',{}).get('playerMicroformatRenderer',{})
print('title:', micro.get('title',{}).get('simpleText',''))
print('channel:', micro.get('ownerChannelName',''))
print('lengthSeconds:', micro.get('lengthSeconds',''))
print('publishDate:', micro.get('publishDate',''))
print('description:', (micro.get('description',{}).get('simpleText','') or '')[:2000])
print('viewCount:', micro.get('viewCount',''))
print('likeCount:', micro.get('likeCount',''))
"
```

If the response is empty or the title is "YouTube", the request was routed wrong (mobile vs desktop UA, geo-blocking, or 404).

## YouTube captions (signed URL, expires in minutes)

```bash
# Step 1 — extract the baseUrl from ytInitialPlayerResponse
BASE=$(curl -sL "https://www.youtube.com/watch?v=$VIDEO_ID" \
  -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36" \
  | python3 -c "
import sys, re, json
h = sys.stdin.read()
m = re.search(r'var ytInitialPlayerResponse = (\{.+?\});', h)
d = json.loads(m.group(1))
for tr in d.get('captions',{}).get('playerCaptionsTracklistRenderer',{}).get('captionTracks',[]):
    if tr.get('languageCode','').startswith('zh'):
        print(tr['baseUrl']); break
")
# Step 2 — fetch the captions (srv3 format = JSON3 with timestamps)
curl -sL "${BASE}&fmt=srv3" -A "Mozilla/5.0" > /tmp/captions.json
```

If the second call returns 404, the signature expired. Re-extract the baseUrl from a fresh watch-page fetch; **do not retry** the same URL.

To extract the snippet near a specific timestamp:

```python
import json
with open('/tmp/captions.json') as f:
    d = json.load(f)
target = 952  # seconds
events = d.get('events', [])
nearby = [e for e in events if abs((e.get('tStartMs', 0) / 1000) - target) < 30]
for e in nearby:
    segs = e.get('segs', [])
    text = ''.join(s.get('utf8', '') for s in segs)
    print(f"[{e['tStartMs']/1000:.1f}s] {text}")
```

## arXiv abstract page → metadata

```bash
ARXIV_ID="2501.01234"
curl -sL "https://arxiv.org/abs/$ARXIV_ID" \
  -A "Mozilla/5.0" \
  | python3 -c "
import sys, re
h = sys.stdin.read()
m = re.search(r'<meta name=\"citation_title\" content=\"([^\"]+)\"', h)
print('title:', m.group(1) if m else 'NONE')
authors = re.findall(r'<meta name=\"citation_author\" content=\"([^\"]+)\"', h)
print('authors:', ', '.join(authors))
m = re.search(r'<meta name=\"citation_date\" content=\"([^\"]+)\"', h)
print('date:', m.group(1) if m else 'NONE')
m = re.search(r'<meta name=\"citation_arxiv_id\" content=\"([^\"]+)\"', h)
print('arxiv_id:', m.group(1) if m else 'NONE')
# Abstract is in <blockquote class=\"abstract\"> on the abs page
m = re.search(r'<blockquote class=\"abstract[^\"]*\">\s*<span[^>]*>Abstract:</span>\s*(.+?)</blockquote>', h, re.DOTALL)
print('abstract:', (m.group(1).strip() if m else 'NONE')[:1500])
"
```

For PDFs (full text), prefer `https://arxiv.org/pdf/$ARXIV_ID` only if you have a parser ready; the abs page is enough for an information card's hero section.

## Generic web article → meta tags

```bash
curl -sL "$URL" -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36" \
  | python3 -c "
import sys, re
h = sys.stdin.read()
# Title (try og:title → twitter:title → <title>)
title = None
for prop in ['og:title', 'twitter:title']:
    m = re.search(rf'<meta (?:property|name)=\"{prop}\" content=\"([^\"]+)\"', h)
    if m: title = m.group(1); break
if not title:
    m = re.search(r'<title>([^<]+)</title>', h)
    if m: title = m.group(1)
print('title:', title or 'NONE')
# Description
desc = None
for prop in ['og:description', 'twitter:description', 'description']:
    m = re.search(rf'<meta (?:property|name)=\"{prop}\" content=\"([^\"]+)\"', h)
    if m: desc = m.group(1); break
print('description:', (desc or 'NONE')[:600])
# Author
m = re.search(r'<meta name=\"author\" content=\"([^\"]+)\"', h)
print('author:', m.group(1) if m else 'NONE')
# Published
m = re.search(r'<meta property=\"article:published_time\" content=\"([^\"]+)\"', h)
if not m:
    m = re.search(r'<meta name=\"pubdate\" content=\"([^\"]+)\"', h)
print('published:', m.group(1) if m else 'NONE')
"
```

## Hacker News thread → top comment + article URL

```bash
HN_ID="49081241"
curl -sL "https://news.ycombinator.com/item?id=$HN_ID" \
  -A "Mozilla/5.0" \
  | python3 -c "
import sys, re
h = sys.stdin.read()
# Article URL is in the first <span class=\"titleline\"><a href=\"...\">
m = re.search(r'<span class=\"titleline\"><a href=\"([^\"]+)\"', h)
print('article_url:', m.group(1) if m else 'NONE')
m = re.search(r'<span class=\"titleline\"><a[^>]*>([^<]+)</a>', h)
print('article_title:', m.group(1) if m else 'NONE')
# Top comment is the first <div class=\"comment\"> ... <div class=\"commtext\">
m = re.search(r'<div class=\"commtext[^>]*>(.+?)</div>', h, re.DOTALL)
print('top_comment:', (m.group(1)[:600] if m else 'NONE').replace('<p>','').replace('</p>',''))
# Score
m = re.search(r'<span class=\"score\"[^>]*>(\\d+) points?', h)
print('score:', m.group(1) if m else 'NONE')
"
```

HN's HTML is plain enough that grep + regex work; for richer extraction use the Algolia HN API (`http://hn.algolia.com/api/v1/items/<id>` returns JSON).

## Paywall / login gate detection

If the fetched HTML contains any of these strings, the source is gated — do not pad with L3 community speculation:

```bash
curl -sL "$URL" -A "Mozilla/5.0" | grep -E -i 'subscribe to read|sign in to read|paywall|forbidden|please log in|access denied|verify you are human|cloudflare|just a moment' | head -5
```

If any line is non-empty, report the gate to the user and ask for an alternative source.

## When not to use these recipes

- The user explicitly says "use this summary that I provide" — bypass fetches.
- The source is private/internal (corporate intranet, paid API) — recipes cannot help.
- The source is a live data feed (RSS, websocket) — different toolchain, not in scope here.