---
name: infocard-source-routing-decision-tree
description: "Route non-X infocard sources before subagent dispatch."
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, source-routing, decision-tree, youtube, video, web-article, paper]
    related_skills: [infocard-publish-sop, infocard-mobile-verifier]
---

# Infocard source routing decision tree

## Trigger

Use this skill **before any Research A subagent dispatch or `publish-bundle.json` write**, whenever the user provides a source URL that is NOT `https://x.com/i/status/...`.

All infocard work stays in the current main checkout. This routing skill performs source classification only; it never creates, enters, removes, or recommends a Git worktree or clone. Authoring remains under `.docs/<run-id>/<slug>/`, and any promotion or publication is owned by `infocard-publish-sop` and its Publisher flow.

The protocol's default entry path assumes an X post: status URL → author + timestamp + body extractable in one fetch. Non-X sources break that assumption in three places:

1. **Topic detection is harder.** X post body text is captured immediately. A YouTube watch URL exposes only the page HTML; the orchestrator must first extract the title and decide if the topic matches any in-flight card. Failing this check is the 2026-08-02 incident: a 20-min YouTube video about Graph Engineering was misclassified as an AutoResearch follow-up because its `t=952s` timestamp was associated with an AutoResearch card earlier in the session.
2. **Evidence shape is different.** X posts are first-class sources with display name, handle, timestamp, and media. YouTube videos produce a single content blob (title + description + transcript) without those structured fields.
3. **Author / timestamp attribution.** The `expected_public_identity` field in the v3 bundle normally names an X account. For YouTube it must name the channel.

## Entry routing decision tree

```
Source URL provided
│
├─ x.com/i/status/<id>          → existing X source flow, no change
│
├─ github.com/<owner>/<repo>    → existing source-fallback-github.md flow
│
├─ youtu.be / youtube.com       → YouTube video flow (this file)
│                                 1. Extract metadata from ytInitialPlayerResponse
│                                 2. Topic-detect BEFORE author delegation
│                                 3. Reject "looks related to last card" without
│                                    explicit title / description evidence
│
├─ arxiv.org/abs/<id>           → Paper flow (TODO: future contribution)
│
├─ news.ycombinator.com/item?id → HN discussion flow (TODO: future contribution)
│
└─ other web URL                → Generic web article flow
                                   (blog post, podcast transcript, etc.)
```

## YouTube source extraction recipe

```bash
# 1. Fetch the watch page with a normal desktop User-Agent
curl -sL "https://www.youtube.com/watch?v=$VIDEO_ID" \
  -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

# 2. Extract title, duration, publish date from the embedded JSON blob
python3 -c "
import sys, re, json
h = sys.stdin.read()
m = re.search(r'var ytInitialPlayerResponse = (\{.+?\});', h)
d = json.loads(m.group(1))
micro = d.get('microformat',{}).get('playerMicroformatRenderer',{})
print('title:', micro.get('title',{}).get('simpleText',''))
print('lengthSeconds:', micro.get('lengthSeconds',''))
print('publishDate:', micro.get('publishDate',''))
print('description:', (micro.get('description',{}).get('simpleText','') or '')[:2000])
"
```

### Caption retrieval (optional but useful for chapter detection)

```bash
# 3a. Find the caption base URL (it is signed and time-limited)
python3 -c "
import sys, re, json
h = sys.stdin.read()
m = re.search(r'var ytInitialPlayerResponse = (\{.+?\});', h)
d = json.loads(m.group(1))
for tr in d.get('captions',{}).get('playerCaptionsTracklistRenderer',{}).get('captionTracks',[]):
    print(tr.get('languageCode'), tr.get('baseUrl','')[:300])
"

# 3b. Fetch the captions
curl -sL "<caption-baseUrl>&fmt=srv3&lang=zh-Hans" -A "Mozilla/5.0"
```

**Pitfall**: caption URLs include a signed `signature=` parameter and an `expire` timestamp. After a few minutes the URL returns 404. If `caption fetch 404`, **do not retry the same URL** — re-fetch the watch page and extract a fresh caption URL.

## Topic detection gate (the lesson from 2026-08-02)

**Symptom**: User supplied `https://m.youtube.com/watch?v=8RedSkw1UjE&t=952s` (a 20-min Graph Engineering video by 大飞说科技 / 最佳拍档). I read the URL and associated the `t=952s` timestamp with an AutoResearch card from earlier in the session, dispatched Research A + worktree + bundle, and only discovered the actual title 「什么是图工程」several minutes into the run.

**Hard rule**: Before any research delegation, verify the current main checkout, then fetch the source and report the title + description + topic in one line. Worktrees and temporary clones are prohibited. If the title disagrees with the assumed topic, **stop and re-discuss with the user** — do not let momentum push you into an off-topic run.

**Concrete check that fits in a single turn**:

```bash
curl -sL "$URL" -A "Mozilla/5.0" | python3 -c "
import sys, re
h = sys.stdin.read()
m = re.search(r'<meta property=\"og:title\" content=\"([^\"]+)\"', h) or \
    re.search(r'<meta name=\"title\" content=\"([^\"]+)\"', h) or \
    re.search(r'<title>([^<]+)</title>', h)
print('TITLE:', m.group(1) if m else 'NONE')
m = re.search(r'<meta property=\"og:description\" content=\"([^\"]+)\"', h)
print('OG_DESC:', m.group(1)[:300] if m else 'NONE')
"
```

If `TITLE: NONE`, the URL did not fetch successfully — fix the fetch before continuing. If the title is empty / generic ("YouTube"), the request was routed to a different domain.

## Bundle shape adjustments for video sources

```json
{
  "identity": {
    "slug": "graph-engineering",
    "title": "图工程（Graph Engineering）：AI 智能体架构从 Loop 到 Graph 的范式迁移",
    "expected_public_identity": "Graph Engineering (视频解读)"
  },
  "requirements": {
    "source_type": "youtube-video",
    "source_url": "https://m.youtube.com/watch?v=8RedSkw1UjE&t=952s",
    "channel": "大飞说科技 / 最佳拍档",
    "publish_date": "2026-08-02",
    "duration_seconds": 1211,
    "key_timestamps": {"952s": "视频后段 · Graph 拓扑 / 验证器"}
  }
}
```

The meta.yaml `source` field should be `youtube-video` (not `x-post`). Card section 01 should be re-labelled `VIDEO IDENTITY` instead of `PROJECT IDENTITY`, with 频道 / 时长 / 发布日 / 关键时间戳 as the four headline cards.

## When to recommend "skip the card"

After metadata extraction, refuse to publish when the source is:

- A 3-minute intro video with no real content
- A paywalled article with no abstract
- A paper with no accessible PDF

Do not auto-publish. Report the access boundary in one line and ask the user to provide an alternative source. Do not pad with L3 community speculation.

## Web-article fallback (when the source is neither X, GitHub, nor YouTube)

Same pre-flight gate applies:

```bash
# Fetch the article
curl -sL "$URL" -A "Mozilla/5.0" > /tmp/source.html
# Extract: title, author byline (look for <meta name="author">),
# published date (look for <meta property="article:published_time">),
# description (og:description)
python3 -c "
import re
h = open('/tmp/source.html').read()
for prop in ['og:title', 'twitter:title', 'title']:
    m = re.search(rf'<meta (?:property|name)=\"{prop}\" content=\"([^\"]+)\"', h)
    if m: print(f'{prop}:', m.group(1)); break
for prop in ['og:description', 'twitter:description', 'description']:
    m = re.search(rf'<meta (?:property|name)=\"{prop}\" content=\"([^\"]+)\"', h)
    if m: print(f'{prop}:', m.group(1)[:300]); break
m = re.search(r'<meta name=\"author\" content=\"([^\"]+)\"', h)
if m: print('author:', m.group(1))
m = re.search(r'<meta property=\"article:published_time\" content=\"([^\"]+)\"', h)
if m: print('published:', m.group(1))
"
```

For arXiv papers: prefer `https://arxiv.org/abs/<id>` (HTML, easier to parse) over the PDF. `og:title` is usually the full title, `<meta name="citation_author" content="...">` repeats for each author.

## References

- `references/non-x-source-extraction-recipes.md` — concrete curl + python snippets for YouTube, arXiv, podcast transcripts, and paywall-aware news sites
