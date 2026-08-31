# X status publish source gate

Use this with `infocard-pub-publisher` when the source is an X/Twitter status URL.

## Gate

Do not create HTML/meta, build, commit, push, or sync wiki until the X status has at least one captured source artifact:

- structured text from public/official readers,
- DOM text from logged-in CDP/browser,
- media URLs downloaded/localized,
- or a screenshot/vision extraction explicitly treated as evidence.

A status ID and timestamp alone are not enough to publish.

## Approval boundary

If extraction fails and the next step is network/proxy diagnostics, ask for explicit permission for that diagnostic class. Earlier permission to “read the X post” should not be silently expanded to broad proxy probing when the safety layer blocks it.

Treat external search fallbacks (SearXNG, web search, search-engine scraping, broad status-ID discovery queries) as the same approval class when the task started as “publish this X status”. They send the status ID / handle to additional third-party or local-metasearch services and can be blocked by the tool safety layer. If a search/proxy/network diagnostic command is blocked for lack of consent, do not retry with a different search tool, do not rephrase the query, and do not proceed to HTML/meta from partial page chrome (author handle, error text, avatar only).

Before expanding beyond direct X readers/CDP into search or proxy diagnostics, ask a narrow question such as: “允许我继续进行外部搜索 / 网络源采集，用于提取这条 X 帖正文、图片和互动数据吗？” If the user supplies screenshots or copied text instead, use those as the source artifact and skip the blocked network path.

## Recovery wording

Report the exact blocked stage as “source collection blocked”, not “publish failed”. Keep build/publish todos pending until source artifacts exist. Make the non-action explicit: no HTML generated, no build, no commit, no push, no wiki sync.
