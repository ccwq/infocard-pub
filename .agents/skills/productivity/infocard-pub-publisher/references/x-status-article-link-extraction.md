# X Article-Link Extraction Pattern

When an X status is just a short link to an article-style page, the tweet body / oEmbed can be nearly empty. Do **not** publish from the bare tweet text.

## Reliable extraction order
1. Read the X status and capture the stable `status ID`.
2. If the status text is only a t.co / x.com article link, resolve the target article page.
3. Prefer the article page's canonical metadata over the bare tweet:
   - `og:title`
   - `og:description`
   - `article:published_time`
   - canonical URL / author site URL
4. If the article page is behind X rendering or returns a shell, check the author's canonical site or the page the article redirects to.
5. Download attached or embedded images locally into `docs/assets/images/` and reference them by relative path.

## Why this matters
- The tweet may contain only the article URL, not the claim.
- The actual title / summary often lives on the article page or author site.
- The public card should summarize the article's argument, not repeat the bare link.

## Session example
- Status: `2061091767030825003`
- X article target: `2060957702340395008`
- Canonical article title: `Agent Debt: Don’t Trap Tomorrow’s Model in Today’s Prompt`
- Canonical author site: `https://pejmanjohn.com/agent-debt-don-t-trap-tomorrow-s-model-in-today-s-prompt`
- Four embedded figures were downloaded and published as local assets before release.

## Common pitfall
- `publish.twitter.com/oembed` may only return a blockquote with the article link; it is not enough for a high-density card. Use the article page / canonical site for the substantive content.
