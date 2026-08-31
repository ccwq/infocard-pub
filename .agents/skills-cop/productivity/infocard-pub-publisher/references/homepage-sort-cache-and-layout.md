# Homepage sort, cache, and dense-layout notes

Session-derived maintenance notes for `infocard-pub` homepage/index work.

## Sort contract
- Sort the homepage by the latest source modification time.
- Count either `docs/*.html` or its companion `.meta.yaml` as a modification.
- The sort timestamp should be the max mtime of those two source files.
- Use stable tie-breakers so equal timestamps do not reshuffle:
  1. `title`
  2. `slug`
  3. `path`

## UI rendering contract
- Preserve all visible data elements on the homepage list.
- For high-density mode, keep title, category, tags, and summary.
- Use a two-line date rail when the user wants both created and updated dates.
- Prefer compact spacing changes over removing information.

## Cache / verification workflow
- When the live browser shows an old label or old layout, do not assume the source is wrong immediately.
- Verify the public HTML response, then the rendered DOM, then browser cache/service worker state.
- A versioned query string is useful for quick verification of the deployed HTML.
- If the public DOM still disagrees with the HTML, clear the site registration/cache in the verification browser session and re-check.
