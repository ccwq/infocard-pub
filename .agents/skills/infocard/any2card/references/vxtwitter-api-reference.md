# vxtwitter API Reference

## Endpoint
```
GET https://api.vxtwitter.com/status/<tweet_id>
```

## Response shape (relevant fields)
```json
{
  "user_name": "显示名",
  "user_screen_name": "banzhang777",
  "date": "Mon Jun 01 14:12:34 +0000 2026",
  "text": "完整或截断的推文正文",
  "likes": 25,
  "retweets": 6,
  "replies": 1,
  "hasMedia": true,
  "mediaURLs": ["https://pbs.twimg.com/media/..."],
  "media_extended": [
    {
      "type": "image",
      "url": "https://pbs.twimg.com/media/...",
      "altText": null,
      "size": {"width": 1408, "height": 768}
    }
  ]
}
```

## Key behavioral notes

### Truncation behavior
- `text` field is truncated when original tweet is long (实测 ~100 chars after truncation)
- When `len(text) < 200` and `hasMedia: true` → content is in the image, not in text
- `mediaURLs[]` and `media_extended[]` are still complete even when text is truncated

### Image priority
- When `hasMedia: true` and text is truncated: insert `mediaURLs[0]` as the content source
- Prefer the image with largest `width` (sort `media_extended` by `size.width` desc, take index 0)
- Image dimensions typically 1408×768 (16:9) or similar — fits well in portrait/landscape card

### Author attribution
- Always use `user_screen_name` (without @) for card attribution
- `user_name` is the display name, secondary
- Date format from API: `"Mon Jun 01 14:12:34 +0000 2026"` — convert to `YYYY-MM-DD` for meta.yaml

## vxtwitter vs alternatives
- `api.vxtwitter.com` — works, returns JSON with text + media, BUT can return HTML redirect page (not JSON) when it fails (observed 2026-06-23). Also truncates long tweets to ~100 chars.
- `api.fxtwitter.com/status/<id>` — **PREFERRED JSON API**. Returns complete untruncated text, resolves t.co URLs to full URLs in `raw_text.facets[].replacement`, includes engagement stats (likes/retweets/replies/views), media URLs with dimensions. More reliable than vxtwitter.
- `fxtwitter.com` — works for HTML but requires JavaScript rendering
- `mobile.twitter.com` — blocked (redirects to x.com login)
- `vxtwitter.com/api/v1/tweet/` — 404
- `patched.to` — 404

### Recommended fallback ladder (updated 2026-06-23)
1. `r.jina.ai/https://x.com/i/status/{id}` — highest success rate for text
2. `api.fxtwitter.com/status/{id}` — best JSON API, complete text + URL resolution + stats
3. `api.vxtwitter.com/status/{id}` — fallback when fxtwitter fails (may truncate or return HTML)
4. Direct X HTML page source extraction

### fxtwitter response shape (key fields)
```json
{
  "tweet": {
    "text": "完整未截断正文",
    "raw_text": {
      "text": "原始正文含 t.co 链接",
      "facets": [
        {"type": "url", "indices": [..], "original": "https://t.co/xxx",
         "replacement": "https://full-url.com/path", "display": "full-url.com/path"}
      ]
    },
    "author": {"screen_name": "handle", "name": "显示名", "followers": N},
    "likes": N, "retweets": N, "replies": N, "views": N,
    "created_at": "Thu Jun 18 13:28:00 +0000 2026",
    "media": {"photos": [{"url": "https://pbs.twimg.com/...", "width": W, "height": H}]}
  }
}
```

### Why fxtwitter is preferred for tool-list posts
- `raw_text.facets` resolves every t.co short link to its full URL — critical when the post lists multiple tools with links
- No text truncation (vxtwitter truncates at ~100 chars for long posts)
- Engagement stats included in one call

## Card title strategy when truncated
When text is truncated and hasMedia is true:
- DO NOT: title = incomplete text excerpt
- DO: title = "这条帖在主张什么" extracted from the visible partial text
- Add note: "完整内容在配图中"
- The image becomes the primary content source, not the text

## Python fetch example
```python
import urllib.request, json
url = "https://api.vxtwitter.com/status/2061450837352923157"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
d = json.loads(urllib.request.urlopen(req).read())
text = d.get("text", "")
media = d.get("mediaURLs", [])
print(f"chars: {len(text)}, has media: {d.get('hasMedia')}")
```