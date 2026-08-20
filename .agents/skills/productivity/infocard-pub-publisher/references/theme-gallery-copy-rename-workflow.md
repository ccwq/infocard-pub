# Theme gallery copy + rename workflow

This note captures the durable workflow for `themes.html` / `_themes.yaml` / `theme/{slug}.html` updates.

## What changed in this session
- Added a top navigation affordance in `themes.html`: `选择主题` anchor jumps to the chooser section.
- Added click-to-copy behavior for the first intro panel theme list by rendering each theme as a button with `data-copy-theme`.
- Renamed the theme from `infocard-mcp-forge-style` to `infocard-qsharp-style`.
- Renamed the preview page to `theme/qsharp.html` and updated the generated gallery to point at it.

## Durable workflow
1. Treat `_themes.yaml` as the source of truth.
2. Update the matching theme entry fields together:
   - `slug`
   - `css_class`
   - `pill`
   - `title`
   - `preview_url`
3. Patch `scripts/rebuild_themes.py` when the gallery needs new interaction or structural changes.
4. Rebuild `themes.html` from the script; do not hand-edit the generated page for registry changes.
5. Rename the preview file to match the new slug and update visible text / alt labels inside it.
6. Verify in a real browser or headless browser:
   - the top `选择主题` link exists
   - clicking a theme name copies the exact theme title
   - the renamed preview page opens with the new title and no visible old-name residue

## Pitfalls
- Renaming only the preview file is not enough; the YAML source still drives the gallery.
- If the generated gallery looks stale, rebuild from the script rather than editing `themes.html` directly.
- If the preview page is cloned from an old file, update visible title/copy/alt text too, not just the filename.
