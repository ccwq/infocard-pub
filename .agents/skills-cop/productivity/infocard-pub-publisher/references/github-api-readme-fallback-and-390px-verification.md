# GitHub API fallback + 390px verification notes

## When to use
Use this note for publishing info cards about GitHub repositories, skills/tool registries, or other technical products where the source is a public repo and the first pass hits rate limiting or dense mobile rendering.

## Session-derived rules
- If GitHub API requests return `403` / rate-limit errors while gathering repository details, fall back to the public raw README or other raw repository files first.
- Do not treat the API error as a source failure if the raw content is publicly available.
- For dense GitHub tool-registry cards, always do a mobile pass at roughly `390px` width.
- If the page is *readable but cramped*, fix mobile typography first:
  - increase root/body size on mobile,
  - enlarge headings, labels, and buttons,
  - tighten only the whitespace that is making the first fold feel sparse or hard to scan.
- Change structure only after confirming the cramped feeling is not just a typography issue.

## Practical verification order
1. Read the repo's raw README / raw source.
2. Build the report and the page in the same slug directory.
3. Rebuild `_index.yaml` from sidecars instead of hand-editing generated state.
4. Verify the public Pages detail URL returns `200`.
5. Do a browser-based visual pass at 390px width.
6. If the page is visible but dense, keep the density unless it hurts readability.

## GitHub image download via API base64 (raw.githubusercontent.com blocked)

From this environment, `raw.githubusercontent.com` returns empty/timeout for all file types. The GitHub Contents API works reliably and returns base64-encoded content.

**Python pattern** (tested 2026-06-18):
```python
import urllib.request, base64, json
files = [('intro1.png', '.github/imgs/intro1.png'), ('intro2.jpg', '.github/imgs/intro2.jpg')]
for fname, path in files:
    url = f'https://api.github.com/repos/{owner}/{repo}/contents/{path}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Hermes'})
    with urllib.request.urlopen(req, timeout=20) as r:
        data = json.load(r)
    content = base64.b64decode(data['content'])
    with open(f'/tmp/{fname}', 'wb') as f:
        f.write(content)
    print(f'{fname}: {len(content)} bytes, sha={data["sha"][:8]}')
```

**Key points**:
- Returns `content` (base64 string) + `sha` + `size` + `download_url`
- Decode with `base64.b64decode(data['content'])`
- A 0-byte response means the API also failed — always check `size`
- Resize to ≤720px wide before embedding: `PIL.Image.resize((720, int(ratio*h)), LANCZOS)`
- Commit resized images to `docs/assets/images/{slug}/` alongside the HTML

## GitHub Pages deployment timing (updated 2026-06-18)
After `git push`, SHA appears in `git ls-remote origin refs/heads/main` within ~90 seconds — not 18–20 minutes. Use 90s as the wait threshold.

## Notes
- This is a reusable publishing pattern, not a task log.
- Keep source evidence and public verification separate: raw source for extraction, browser/Pages for render acceptance.
