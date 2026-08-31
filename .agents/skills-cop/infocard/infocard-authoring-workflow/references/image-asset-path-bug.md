# infocard Image Asset Path — Critical Bug Pattern

## Bug: `docs/` HTML with relative `assets/` src → broken images

**Symptoms (2026-08-04 production incident)**:
- CDN returns `HTTP 200 image/gif` — file exists and is served
- Browser shows broken-image icon + alt text
- `curl` to the HTML file shows `src="assets/img/stickman-video-director/demo.gif"`
- Pages HTML at `https://ccwq.github.io/infocard-pub/docs/<slug>.html` shows the broken src

**Root cause**:
HTML files in infocard-pub live at `docs/<slug>.html`. A relative `src="assets/img/..."` resolves to `docs/assets/img/...` — that path does NOT exist on GitHub Pages (assets are served from root, not from `docs/`). CDN serves the file correctly at root, but the HTML references the wrong path.

**Correct solutions** (always use solution 2 for fresh cards):

### Solution 2: Absolute CDN URL (RECOMMENDED)
```html
<!-- ❌ WRONG — relative path breaks in docs/ HTML -->
<img src="assets/img/stickman-video-director/demo.gif">

<!-- ✅ CORRECT — absolute URL, always resolves -->
<img src="https://ccwq.github.io/infocard-pub/assets/img/stickman-video-director/demo.gif">
```

### Solution 1: `../` relative path (if CDN root unavailable)
```html
<img src="../assets/img/stickman-video-director/demo.gif">
```
This goes up one level from `docs/` to the repo root where `assets/` actually lives.

## Prevention checklist for every fresh card with images

Before committing any card that contains `<img>` tags:

1. **Check where the HTML lives**: `docs/<slug>.html` → must use absolute CDN URL or `../assets/`
2. **Check where assets live**: `assets/img/<slug>/` → served from repo root CDN
3. **Verify after push**: wait for Pages deploy, then confirm browser shows the image (not alt text + broken icon)
4. **Large binary files**: download from GitHub raw with `curl -sL --max-time 30 -o <dest>`; check `stat -c%s` to confirm size

## GitHub Pages routing rules for this repo

| Asset location | CDN URL | Works from `docs/*.html`? |
|---|---|---|
| `assets/img/foo/bar.gif` | `https://ccwq.github.io/infocard-pub/assets/img/foo/bar.gif` | ❌ relative `assets/` → 404 |
| `assets/img/foo/bar.gif` | `https://ccwq.github.io/infocard-pub/assets/img/foo/bar.gif` | ✅ absolute URL always works |
| `docs/assets/img/foo/bar.gif` | `https://ccwq.github.io/infocard-pub/docs/assets/img/foo/bar.gif` | ✅ relative `assets/` works |

## Detection command

```bash
# After any push, check the src attribute in deployed HTML
curl -s --max-time 15 "https://ccwq.github.io/infocard-pub/docs/<slug>.html" \
  | grep -o 'src="[^"]*assets[^"]*"'
```

If any result starts with `src="assets/` (no `../` and no `https://`), it will be broken.

## Repair command (if already pushed)

```bash
# Fix in worktree, then force-push to main
sed -i 's|src="assets/|src="https://ccwq.github.io/infocard-pub/assets/|g' \
  docs/<slug>.html
git add docs/<slug>.html
git commit -m "fix: use absolute CDN URL for assets"
git fetch origin main && git rebase origin/main
git push --force origin HEAD:refs/heads/main
```
