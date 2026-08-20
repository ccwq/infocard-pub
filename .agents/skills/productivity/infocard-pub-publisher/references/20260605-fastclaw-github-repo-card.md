# GitHub Repo Card — Main Style Publish Log

**Repo**: `fastclaw-ai/fastclaw`
**Slug**: `20260605-fastclaw`
**Style**: infocard-main-style
**Commit**: `86d8031`
**URL**: https://ccwq.github.io/infocard-pub/docs/20260605-fastclaw.html

---

## What Worked

### 1. README Extraction via Browser CDP

**Problem**: `curl` with `Accept: application/vnd.github.v3+json` returned empty body; raw `raw.githubusercontent.com` returned empty; GitHub API returned 403.

**Solution**: Navigate browser CDP to `https://raw.githubusercontent.com/{org}/{repo}/dev/README.md` (use `dev` branch when `main` returns empty), then extract with `Runtime.evaluate` + `document.body.innerText`.

```javascript
// In browser CDP session targeting the raw URL:
document.body.innerText.length        // check: > 100 means real content
document.body.innerText.substring(0, 200)  // preview
```

### 2. Images from GitHub Repository

```bash
# GitHub preview images (admin.png, agent.png) are hosted at:
# https://github.com/{org}/{repo}/blob/{branch}/{path}?raw=1
# Download with -L (follow redirects):
curl -sL --max-time 15 -A "$UA" \
  "https://github.com/fastclaw-ai/fastclaw/raw/dev/docs/preview/admin.png" \
  -o admin.png
```

### 3. Stats from GitHub HTML (fallback when API fails)

```javascript
// Via browser CDP on repo homepage:
document.querySelector('[href="/fastclaw-ai/fastclaw/stargazers"]')
  .querySelector('strong').textContent  // stars
document.querySelector('[href="/fastclaw-ai/fastclaw/network/members"]')
  .querySelector('strong').textContent  // forks
```

---

## Card Structure (main-style)

| Module | Type |
|--------|------|
| Banner | h1 + lead + 6 tag pills |
| Hero | 2× preview images (admin + agent) |
| Stats | 4-column grid (Stars/Forks/Commits/Tags) |
| Lead | Dark gradient box, conclusion-first |
| Showcase | 2-column grid with img + name + meta + desc |
| Architecture | arch-list (key:value definition rows) |
| Features | 6 cards (2-col grid) |
| Agent System Files | 8-row table |
| CLI Quick Start | cmd-block with prompt/cmd/cmt spans |
| License | 5-row table with pill badges |
| Footer | repo link |

---

## Key CSS Tokens Used

```css
:root {
  --red: #d62c2c;
  --red-dark: #a31f1f;
  --black: #111;
  --ink: #1a1a1a;
  --muted: #666;
  --bg: #fff;
  --surface: #f8f7f4;
  --border: #e5e2db;
  --blue: #2563eb;
  --yellow: #f59e0b;
  --green: #10b981;
  --orange: #ea580c;
  --purple: #7c3aed;
  --font: "SF Mono","Fira Code","Cascadia Code",monospace;
  --sans: "PingFang SC","Microsoft YaHei",sans-serif;
}
```

---

## Showcase Section Pattern

For repos with UI screenshots, use 2-column showcase grid:

```html
<div class="showcase-grid">
  <div class="showcase-item">
    <div class="showcase-img-wrap">
      <img src="..." alt="..." loading="lazy" />
    </div>
    <div class="showcase-body">
      <div class="showcase-name">English Name / 中文名</div>
      <div class="showcase-meta">Category · Sub-label</div>
      <div class="showcase-desc">Description text.</div>
    </div>
  </div>
</div>
```

CSS:
```css
.showcase-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: .55rem; }
.showcase-item { background: var(--surface); border: 1px solid var(--border); border-radius: 7px; overflow: hidden; }
.showcase-img-wrap { overflow: hidden; border-bottom: 1px solid var(--border); }
.showcase-img-wrap img { width: 100%; height: auto; display: block; transition: transform .3s; }
.showcase-item:hover .showcase-img-wrap img { transform: scale(1.03); }
.showcase-body { padding: .5rem .55rem; }
.showcase-name { font-size: .7rem; font-weight: 900; color: var(--black); margin-bottom: .2rem; }
.showcase-meta { font-size: .58rem; color: var(--red); font-weight: 700; text-transform: uppercase; letter-spacing: .06em; margin-bottom: .3rem; }
.showcase-desc { font-size: .65rem; color: var(--muted); line-height: 1.55; }
```

---

## Push Flow That Worked

```bash
git add docs/20260605-fastclaw.html docs/20260605-fastclaw.html.meta.yaml \
        docs/assets/images/20260605-fastclaw/ _index.yaml
git commit -m "feat: add fastclaw infocard ..."
git fetch origin main && git rebase origin/main
# If _index.yaml conflict: python scripts/rebuild_index.py && git add _index.yaml && GIT_EDITOR=cat git rebase --continue
git push
# sleep 30 then verify
```

---

## Anti-patterns Encountered

- **Don't** use `git reset --hard origin/main` when untracked new card files exist — it deletes them
- **Don't** trust `curl` with custom Accept headers for GitHub raw content — browser CDP is more reliable
- **Don't** assume `main` branch has the README content — try `dev` branch when `main` returns empty