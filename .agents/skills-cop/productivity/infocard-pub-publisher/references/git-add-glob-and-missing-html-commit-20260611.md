# Git glob pattern trap + missing HTML commit (2026-06-11)

## Symptom
A `git add docs/20260611-codex docs/20260611-codex.html.meta.yaml ...` succeeds and commits, but GitHub Pages shows 404 for the card. The `_index.yaml` shows the slug entry, but the HTML file does not exist in that commit.

## Root cause: git glob vs exact path

`git add docs/20260611-codex` (without trailing `.html`) does NOT match `docs/20260611-codex.html`.

Git's glob behavior:
- `docs/foo` matches `docs/foo/` directory — nothing matches here since there's no directory
- `docs/foo/` matches nothing (no trailing slash means "prefix match on paths", which finds nothing without a trailing slash on a .html file)
- **Correct**: `git add docs/20260611-codex.html` — exact filename

This caused only the `.meta.yaml` to be staged and committed. The HTML file remained untracked and was never included in the commit.

## Recovery steps (in order of preference)

**Option A — if you haven't pushed yet:**
```
git commit --amend
git push
```

**Option B — if you already pushed the incomplete commit (e.g. commit `440ae74`):**
```
git fetch origin
git reset --hard origin/main   # discard local incomplete state
# Now write the complete HTML fresh
git add docs/20260611-codex.html   # ALWAYS exact filename
git commit -m "Add complete card"
git push
```

**Never do** `git commit --amend` after a push to a shared repo — it rewrites history and causes rebase conflicts for any collaborator who pulled in between.

## Prevention rule

In every commit command for infocard-pub, always use exact filenames:
```bash
git add docs/{slug}.html docs/{slug}.html.meta.yaml docs/assets/images/{slug}/ _index.yaml index.html
```
Do NOT use glob patterns like `docs/{slug}` — always append `.html` explicitly.

## Related: avatar/images subdirectory staging trap (2026-06-12)

When downloading owner avatars alongside a card, the avatar lives in `docs/assets/images/{slug}/avatar.png`. A first commit that adds only `docs/{slug}.html docs/{slug}.html.meta.yaml` will **not** automatically include the images subdirectory — git add stages exact paths, not recursive subtrees.

**Symptom**: HTML loads but the avatar image shows 404 on GitHub Pages even though the path in the HTML is correct.

**Prevention**: always include the images directory in the same atomic commit:
```bash
git add docs/{slug}.html docs/{slug}.html.meta.yaml \
       docs/assets/images/{slug}/ \
       _index.yaml index.html
```

**Recovery**: commit only the missing images in a separate fix commit:
```bash
git add docs/assets/images/{slug}/avatar.png
git commit -m "fix: add missing avatar.png for {slug}"
git push
```

This is distinct from the HTML glob trap above (which stages a directory but misses the `.html` file). Both share the root cause: **exact filenames over directory globs**.

## Related: write_file overwrites git checkout
If you `git checkout origin/main -- file` to restore a file, then immediately `write_file` the same path in the same session, Hermes treats the write as a modification and git detects it as changed. This means git status can show "clean" when the file content actually differs from the committed HEAD.

Rule: after a `git checkout -- file` restore, read the file content before writing to it to confirm the content matches what you want to keep. Or skip the checkout and write directly.

## Related: git status lies for regenerated files
`git status --short` returns empty even when `_index.yaml` or `index.html` differ from committed HEAD (zero net lines changed on regenerate). Use `git diff --stat _index.yaml index.html` as the reliable detector.

## Commit messages for rebuilds
When rebuilding a card (e.g. correcting theme compliance), include the reason in the commit message:
```
git commit -m "rebuild: Codex Orange Book card uses hardblue theme correctly (no orange/amber)"
```
This makes the rebuild intent auditable.
