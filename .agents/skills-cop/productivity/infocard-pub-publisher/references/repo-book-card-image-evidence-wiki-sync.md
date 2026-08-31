# Repo / book card: attached image as evidence + wiki sync

Use this pattern when the user gives a GitHub repo or book-like repository and also supplies an image, then asks to create/publish a card.

## Practical rule
- Treat the user-supplied image as **source evidence**, not a style reference, when the user says things like “包含此图像 / include this image”.
- Localize the image into `docs/assets/images/<slug>/` and embed it in the HTML body with a real `<img>` tag.
- Keep the image visible and captioned in the card text so the evidence is readable without expanding the image.

## Verification sequence
1. Fetch repo facts from GitHub API / README.
2. Save the evidence image locally.
3. Write HTML + `.meta.yaml`.
4. `npm run build && npm run verify`.
5. Serve preview and confirm the rendered image URL returns `HTTP 200`.
6. Use browser/CDP DOM checks to confirm the image is present and loaded.
7. Commit + push the card repo.
8. Wait for Pages propagation, then verify public `HTTP 200` and homepage search.
9. For high-value cards, write wiki raw + concept/comparison/entity page, append log/index, commit, push, and verify remote HEAD matches local HEAD.

## Notes
- For book/repo cards, the image usually carries semantic evidence, so keep it inside the content flow rather than isolating it as a hero-only decoration.
- If the task explicitly asks for publication, wiki sync is part of completion for high-value cards.
