# Tool / docs-site share card source hierarchy

This note captures a repeatable pattern for cards built from a live product documentation site rather than a GitHub repo.

## When to use
Use this pattern when the input is a tool homepage, docs site, or product landing page whose real value is in the documentation flow, not in a social post shell.

## Source hierarchy
1. **Homepage / hero** — capture the product promise and one visual anchor.
2. **Installation / getting started** — identify the shortest first-use path.
3. **FAQ / boundary docs** — confirm cost, compatibility, limits, and open-source status.
4. **GitHub / source repo** — verify claims or inspect implementation details when needed.

## Card framing
- Treat the card as a **tool-share / docs-share** card, not an evidence-only card.
- The first fold should answer:
  - what it is,
  - who it is for,
  - how to start,
  - what outcome it produces.
- Prefer one homepage screenshot or hero visual as the main anchor when the page has no richer diagram.

## Mobile legibility note
If the card uses a fixed `Save PNG` button, and 390px vision shows it touching or covering content, fix the content safe area first by increasing bottom padding on the page/card. Keep the button fixed unless the overlap persists after spacing is corrected.

## Session example
- `curl.md` session: homepage → installation → FAQ → GitHub/source gave a clean source order for a tool-share intro card.
