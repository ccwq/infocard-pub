# GitHub Repo Technical Card: html-video Pattern

## Context
Card: `docs/20260605-html-video.html` (nexu-io/html-video)
Style: infocard-main-style (红黑白主骨架)
Published: commit `1d3605d`

## Source Extraction Strategy

### 1. README → raw + shallow clone
```bash
# Fastest evidence path (GitHub API often rate-limited)
curl -sL --max-time 15 "https://raw.githubusercontent.com/nexu-io/html-video/main/README.md" -o /tmp/readme.md

# Fallback: shallow clone for directory listing
git clone --depth 1 --filter=blob:none --sparse "https://github.com/nexu-io/html-video" /tmp/repo
cd /tmp/repo && git sparse-checkout set templates packages
```

### 2. Template/asset discovery
- GitHub file tree API: `curl .../contents/{path}` (may 403 on rate limit)
- Browser: navigate to `github.com/{org}/{repo}/tree/main/{dir}`, extract `data-file-` attributes or `a[data-pjax]` links
- **Pattern**: if README lists template names, cross-reference against browser-discovered files

### 3. Image download (Wikimedia)
**Critical**: Wikimedia CDN blocks session-less curl → follow the three-step method:
1. Browser open Wikipedia/Commons page
2. `Runtime.evaluate` extract `upload.wikimedia.org` img src
3. curl with `-H "Referer: https://en.wikipedia.org/"`

For the html-video case: hero from `docs/assets/hero.png` (raw GitHub, direct download), template previews from `templates/` screenshots via `git sparse-checkout` or browser.

## Card Structure for Coding-Agent/Video-Generation Repo

```
Banner: title + one-liner + tags (Apache-2.0, N agents, N templates, local MP4, no per-call billing)
Stats: Stars / Forks / Agent backends / Template count
Lead: core positioning (meta-layer = agent brain + templates + pluggable engines)
Showcase: N template screenshots in 2-col grid with name/meta/description
Pipeline: numbered flow diagram (Source Fetch → Agent Loop → Content Graph → HTML → Render → Export)
Agent table: 6 backends with detection method + invocation
Engine comparison: table (name / paradigm / tradeoff / status pill)
Architecture: package directory list
Quick start: 3 CLI commands
Roadmap: feature + status pill table
Footer: repo link + license + sister projects
```

## Key Lessons

### Filename date conflict
Created `docs/20250605-html-video/` by mistake (wrong year). Detected via `git status` before push, deleted and recreated with correct `20260605` slug. Always verify date prefix before first commit.

### Image validation after push
Browser CDP `XMLHttpRequest` on the live page showed 404s for all showcase images → root cause: CDN cache served old HTML before new push. Solution: `sleep 30 && curl ...` to let GitHub Pages deploy, then recheck.

### GitHub API fallback chain
When `api.github.com/repos/.../contents/` returns 403 or empty, fall back to:
1. raw `.githubusercontent.com` README
2. Browser navigate to file tree → extract file names
3. `git sparse-checkout` for actual file content

## Files in This Session
- `docs/20260605-html-video.html` — 25KB main-style card
- `docs/20260605-html-video.html.meta.yaml` — sidecar
- `docs/assets/images/20260605-html-video/` — 7 PNG images (hero + 6 template previews)