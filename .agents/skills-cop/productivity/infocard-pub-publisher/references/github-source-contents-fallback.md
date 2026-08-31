# GitHub source retrieval fallback for repo cards

When GitHub repo cards need source text and the direct raw README fetch is awkward or flaky, use the GitHub Contents API and decode the `content` field.

## Preferred order
1. GitHub REST metadata for repo facts: stars, forks, license, topics, default branch, updated/pushed time.
2. GitHub Contents API for source text:
   - `GET /repos/{owner}/{repo}/contents/README.md`
   - `GET /repos/{owner}/{repo}/contents/main.go`
   - decode `content` from base64.
3. Raw URLs only when they are convenient and stable.

## Minimal Python probe
```python
import base64, json, urllib.request
url = 'https://api.github.com/repos/{owner}/{repo}/contents/README.md'
req = urllib.request.Request(url, headers={'Accept':'application/vnd.github+json','User-Agent':'Hermes'})
with urllib.request.urlopen(req, timeout=20) as r:
    obj = json.load(r)
text = base64.b64decode(obj['content']).decode('utf-8', errors='replace')
print(text)
```

## Notes
- Use this for README, entrypoint files, and other small text sources.
- Keep the source-order hierarchy unchanged: metadata first, README second, code only when it clarifies deployment or interface shape.
- This is a retrieval fallback, not a replacement for the normal repo-card workflow.
