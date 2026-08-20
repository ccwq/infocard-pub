# HTML-first authoring for complex handline cards

This note captures a reusable pattern observed while building an OpenSkynet handline card for infocard-pub.

## When to choose full HTML instead of markdown-ish card bodies
Use a full HTML document when the card needs:
- handline-specific layout control across multiple blocks
- several custom section types (tables, skill grids, use-case grids, quick-ref tiles)
- precise spacing / mobile behavior
- custom CTA/footer treatment
- no dependency on the default markdown renderer for structure

In practice, a full HTML card is safer than trying to force the content through a markdown stub and hoping the theme injects the right scaffolding.

## Metadata contract
For `docs/YYYYMMDD-slug.html` cards, the matching `.meta.yaml` must include at least:
- `slug`
- `path`
- `category`
- `title`
- `date`
- `tags`

If these are missing, `npm run build` fails fast with an index-build error.

## Reusable failure signature
A common failure mode is creating the HTML successfully but leaving meta incomplete. The build then reports missing `slug`, `path`, or `category` even though the card content itself is fine.

## Practical checklist
1. Write the full HTML card first.
2. Add the meta file with explicit `slug`, `path`, and `category`.
3. Run `npm run build`.
4. Run `npm run verify`.
5. Check the live page and `_index.yaml` after push.

## Scope note
This note is about authoring workflow, not a permanent rule that every handline card must be full HTML. Use the simplest shape that preserves the intended layout and visual language.
