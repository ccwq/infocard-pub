# X status redirect and body-text extraction

Session-tested pattern for publishing infocards from X status URLs.

## What happened
A status opened via `x.com/i/status/<id>` can redirect to a canonical `x.com/<handle>/status/<id>` page.
The visible body text in the page is still the best source artifact when it can be read directly.

## Practical rules
- Keep the original `x.com/i/status/...` URL as provenance in `source_url`.
- Record the redirected canonical URL separately when you need author/account attribution.
- Prefer the page body text from browser/CDP as the tweet content source when it is available.
- If the page text shows the full post, no GraphQL fallback is needed.
- If the page text is partial or blocked, then use the GraphQL fallback path already documented in the parent skill.

## Verification
- Browser snapshot/body text contains the post text.
- Canonical redirected URL is captured from the live page.
- The card body and wiki raw page should reference the same source artifact.
