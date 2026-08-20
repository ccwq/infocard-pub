# 2026-06-01 Camila X-status info card publish notes

Source: `https://x.com/i/status/2061417768323633654`

## What worked
- Treat the X status ID as the durable anchor; keep the public URL in the footer/source block.
- When the post has an attached image, download it into `docs/assets/images/` first, then reference it locally from the card.
- Use the card structure: core judgment → attached image → original post → model/claim breakdown → public interaction data → conclusion.
- If public replies are `0`, state that explicitly as `公开回复 0` / `无公开回复`; do not invent a comment thread or borrow reactions from other posts.
- Keep the report bundle and the card bundle together in the same slug directory: `report.md`, `index.html`, and `index.html.meta.yaml`.
- Rebuild `_index.yaml` from sidecars, then verify with `scripts/verify_index.py` before pushing.
- After push, the first public fetch may briefly 404 while GitHub Pages deploys; use a cache-busting URL and poll until the published page returns 200.
- Final verification should include a visual check that confirms the title, image, interaction block, and save PNG control all render on the public page.

## Pitfalls
- Do not mix different people / regions / dates into one card just because they are related.
- Do not hot-link the source image; solidify it locally or the card can break later.
- Do not treat a single 404 during deploy as final failure if the push just landed.
- Do not declare the card complete until the public Pages URL is reachable and visually matches the local build.
