# GitHub Repo → Darkblue Infocard Workflow

## Session Reference
Documented 2026-06-13. Source: baoyu-design (JimLiu/baoyu-design) card production.

## Problem

When the user says "发布信息卡" for a GitHub URL, the standard pattern for darkblue-style cards is:

1. **Investigate the repo** — collect structured data (README, package.json, stars, tech stack, capabilities, install commands, screenshots)
2. **Identify the style** — darkblue for Agent IDE / developer tool / multi-phase workflow / platform matrix content
3. **Write the card** — use `read_file` on `theme/darkblue.html` as the exact template source (not the skill reference)
4. **Publish** — standard infocard-pub flow

## Step-by-Step Workflow

### Step 1 · Investigate via delegate_task (preferred)

For GitHub repos, spawn a `leaf` subagent with `['terminal', 'web']` toolsets:

```
delegate_task → goal: "Inspect GitHub repo at {URL}. Collect: description, README, package.json, tech stack, capabilities, screenshots, stars, license, last commit. Return structured summary in Chinese."
```

Use the subagent's summary as the card content source. Do NOT try to build a card from the URL alone — the subagent's terminal calls can hit the GitHub API (`gh api`) or raw content.

### Step 2 · Load the darkblue style skill + template

```python
skill_view(name='infocard-darkblue-style')                    # get design DNA + CSS tokens
read_file(path='theme/darkblue.html')  # relative to the active repository root
```

**Critical**: Read the actual `theme/darkblue.html` file directly — it is the source of truth for HTML structure and CSS, not the skill reference docs. The skill documents the design intent; the theme file contains the exact code.

### Step 3 · Load CSS-only visual approach (if no screenshots)

```python
skill_view(name='infocard-darkblue-style', file_path='references/darkblue-css-only-visual-approach.md')
```

This gives you: orb logo, gradient strip, SVG icon system, glass panel, bar-row, phase strip — all pure CSS, no external images needed.

### Step 4 · Write the card

Structure the card following the darkblue shell layout:

```
.hero       → kicker + title + subtitle + subcn + pill-row + hero-note
.hero-visual → orb logo + stats (stars/agents/skills/components) + gradient strip
.shell      → 3-column: capabilities | workflow steps | agent compatibility bar + donut
.feature-row → 6 SVG-icon feature cards
.download   → GitHub CTA button
.footer     → stars + author + MIT + date
```

Key darkblue CSS tokens (for writing card without reading theme file):
```css
:root{--bg:#0c1020;--bg-2:#11162a;--panel:#171c2b;--panel-2:#0f1424;--ink:#eef4ff;
     --muted:#a8b7df;--line:rgba(255,255,255,.12);--cyan:#58c3ff;--blue:#4a78ff;
     --green:#2db36a;--yellow:#f4c84c;--purple:#8459ff;}
```

### Step 5 · Verify GitHub Pages propagation

GitHub Pages has ~80s CDN cache delay. After push:
```python
# Try once immediately, then wait
for i in range(20):
    try:
        with urllib.request.urlopen(url, timeout=20) as r:
            data = r.read(...)
            # Check key content
            break
    except:
        time.sleep(10)  # 10-12s between retries
```

Use `?v=N` cache-bust if needed. Check for HTTP 200 + content keywords.

## Darkblue vs Hardblue Routing

Use darkblue when content has **2+** of these:
- Agent IDE / AI programming workbench
- Multi-phase workflow (3+ steps)
- Platform support matrix (4+ platforms)
- Design system / component library
- Developer tooling / terminal / editor UI

Use hardblue when content is:
- Single CLI tool / command
- Technical manual / API reference
- Survey / investigation report

## Known GitHub Data Collection Patterns

| Data point | How to get |
|---|---|
| README + description | `gh api repos/{owner}/{repo}` or `curl https://api.github.com/repos/{owner}/{repo}` |
| Package.json | Raw URL: `https://raw.githubusercontent.com/{owner}/{repo}/main/package.json` |
| Tech stack | README content or `gh api .../languages` |
| Capabilities | README sections or subagent investigation |
| Screenshots | `gh api .../contents/assets/` → download |
| Stars / forks | `gh api ...` JSON response |
| Last commit | `gh api .../commits?per_page=1` |
| License | `gh api ...` JSON `license.spdx_id` |

## Verified Card Commit

- **Repo**: `infocard-pub` commit `03bd43f` (2026-06-13)
- **Card**: `docs/20260613-baoyu-design.html`
- **Style**: darkblue (deep blue gradient / glass panel / icon workbench)
- **Source**: github.com/JimLiu/baoyu-design (920 stars, MIT, 70+ agents)
- **Live URL**: https://ccwq.github.io/infocard-pub/docs/20260613-baoyu-design.html
- **Verification**: HTTP 200, all content keywords confirmed (baoyu / Claude / Agent / cursor / figma / 920 / shell / feature)

## Anti-patterns

- ❌ Don't try to write the darkblue HTML purely from the skill docs — read `theme/darkblue.html` for exact structure
- ❌ Don't use emoji as icons — use inline SVG with `currentColor`
- ❌ Don't skip the GitHub Pages propagation wait — always verify before reporting "done"
- ❌ Don't use warm paper textures, Q-style elements, or red fills — darkblue is cold/neutral
