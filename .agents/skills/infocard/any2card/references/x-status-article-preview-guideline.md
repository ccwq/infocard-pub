# X article-preview guidance

Session note: some X status URLs resolve to an `article` card where `text` is only a jump URL, but the useful content lives in `article.title`, `article.preview_text`, and `article.image`.

## What to trust first
- `article.preview_text` when it reads like a full claim or thesis
- `article.title` for the article headline
- `article.image` as a visual anchor, especially when it is a conceptual poster or infographic
- `text` only as a fallback when it contains more than a bare URL

## What not to do
- Do not title the card from the bare `x.com/i/article/...` URL when preview text is available.
- Do not treat a jump URL as if it were the actual post content.
- Do not assume a conceptual poster is a paper figure or a formal flowchart.

## Card-writing pattern
1. Open with the claim from `article.preview_text`.
2. Use the image caption to explain what kind of evidence/visual this is.
3. Separate the claim into:
   - main thesis
   - structural components
   - what is inferred vs directly shown
   - external corroboration / benchmark framing
4. If the article preview is the only meaningful source, say so explicitly in the opening block.

## Extraction fallback
If the X page is login-gated or the rendered status page is sparse, the article preview payload is still often enough to produce a valid high-density card. Prefer that over inventing unsupported detail.
