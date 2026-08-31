# X status / article-preview technical card pattern

Session-derived pattern for publishing a technical analysis card from an X post whose `vxtwitter` `text` field is only a jump URL, but whose `article.preview_text` and `article.image` carry the actual content.

## Extraction order
1. `api.vxtwitter.com/status/{id}` — read `article.title`, `article.preview_text`, `article.image`, `likes`, `retweets`, `replies`, `date`.
2. If `text` is only a URL or is too thin to explain the post, do **not** title the card from the URL alone. Use the preview/article claim as the content anchor.
3. Localize `article.image` before publishing; verify the download returns a real image, not an error page.
4. If the raw X page is login-gated, treat the visible article preview as the primary source and preserve that limitation in the card narrative.

## Publishing pattern
- Use the post's own claim as the title or subtitle, not the bare URL slug.
- Treat `article.preview_text` as the first-fold summary and as the basis for the section structure.
- If the image is a conceptual poster, explain whether it is a concept海报 / infographic / flowchart instead of pretending it is a paper figure.
- For technical-analysis cards, explicitly separate:
  - claim
  - visual evidence
  - benchmark or external corroboration
  - limits / what is not proven by the image alone

## Verification checklist
- Detail page HTTP 200
- `_index.yaml` contains the slug/path
- Home page DOM/search can find the title or slug
- 390px viewport has no overflow and the fixed save button does not cover正文
- If using a localized hero image, confirm the published HTML references the local asset path, not the remote hotlink

## Pitfall
When the vxtwitter payload only contains a URL, the actual technical content is often in `article.preview_text` and/or the attached hero image. Publishing a card from only the URL produces a thin, misleading result. Always promote the preview text into the card's opening judgment before laying out sections.
