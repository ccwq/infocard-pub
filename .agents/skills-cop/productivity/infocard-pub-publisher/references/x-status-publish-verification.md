# X status publish verification

## Core rule
- Preserve the X status ID as the durable anchor.
- If the post text collapses to a short article link, resolve the article page first and use the article’s actual title, hero image, and body as the content source.
- If the original post has media, solidify it locally under `docs/assets/images/` and reference it via relative paths.
- If the article image carries the real claim, embed it inside the card’s first fold or hero area and caption its role in the argument.
- See `references/x-status-article-image-card.md` for the article-link + embedded-image pattern.

## Publish shape
- `report.md` and `index.html` are a single bundle.
- Keep the source URL / article URL / author handle visible in the source block.
- Do not rely on a thin oEmbed blockquote when the article page contains the actual argument.

## Verification order
1. Local build / index verify passes.
2. Public detail page returns 200.
3. Public `/_index.yaml` contains the slug.
4. Homepage renders the card after JS runs.
5. Worktree is clean after commit and push.
