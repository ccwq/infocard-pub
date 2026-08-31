# X status extraction: approval boundary and stalled-source handling

Use this when converting an X/Twitter status URL into an infocard and the normal public extraction path fails.

## Stable lesson

A user saying “允许读取这条 X 帖” authorizes content extraction, but it may not cover broad terminal network/proxy diagnostics. If the terminal safety layer blocks a proxy or network probe and says not to retry or rephrase, stop and ask for explicit approval for that diagnostic class before continuing.

## Recommended staged ladder

1. Try structured/public readers first:
   - `xurl read <status_id>` if configured.
   - `cdn.syndication.twimg.com/tweet-result?id=<id>` / oEmbed / vxtwitter / fxtwitter / Jina reader as public fallbacks.
2. Try logged-in browser/CDP extraction:
   - Navigate existing X tab to the status URL.
   - Wait for render and extract `article.innerText`, `article img`, `article video`, and `article a[href]`.
3. If both public readers and CDP fail because the page itself cannot reach X, pause before proxy/network diagnostics.
4. Ask explicitly for: “允许网络/代理连通性测试”. Do not assume the earlier X-read authorization covers this.
5. Do not generate or publish a card from a status URL until at least one reliable content source is captured: text, media, or a screenshot that can be used as evidence.

## Avoid

- Do not keep retrying the same blocked command through a different wrapper after the safety layer says not to.
- Do not publish a speculative card from the status ID alone.
- Do not record transient TLS/proxy failures as durable facts; only capture the approval boundary and staged fallback pattern.
