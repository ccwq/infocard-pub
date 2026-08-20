# Theme rebrand and rename workflow (session note)

## What this workflow covered
A full rename of the theme `infocard-mcp-forge-style` to `infocard-color-material-style`, including the paired preview theme and example card assets.

## Sequence that worked
1. Patch the style skill first:
   - rename the skill name and title
   - update wording to the new theme semantics
2. Rename the theme assets in the repo:
   - `_themes.yaml`
   - `themes.html` generation source
   - `theme/{slug}.html`
   - preview assets under `docs/assets/images/{slug}/`
3. Batch-replace old names in all affected files with a scripted pass, not hand edits.
4. Rename asset filenames when the old basename leaks semantic residue.
5. Run a repository-wide search for the old identifiers until it returns zero hits in the managed files.
6. Rebuild themes (`python3 scripts/rebuild_themes.py`).
7. Run `npm run build` and `npm run verify`.
8. Commit, rebase if needed, push, then verify the live Pages output.

## Pitfalls
- Renaming only the visible text is not enough; old identifiers can remain in alt text, source notes, filenames, or generated preview HTML.
- If you change the theme registry but do not rebuild `themes.html`, the public gallery can keep showing stale names.
- If a full repo search still shows old identifiers, treat that as incomplete cleanup, not as an acceptable leftover.

## Acceptance checks
- No old theme identifiers in managed files.
- `themes.html` shows the new theme name.
- The preview iframe points at the renamed `theme/{slug}.html`.
- The sample card links to the renamed docs page.
- All image paths match the new slug.
- Build + verify pass before push.
