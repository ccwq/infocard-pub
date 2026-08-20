# GitHub Repo Technical Share Card Workflow

Batch creation and publishing of technical share info cards for GitHub repositories. Five consecutive cards published in one session: Obscura (14142aa), Superlog (6e00701), ApkMCP-Auto (4911e2b), TokDoc (7a87046), Codex (87cdf45).

## Workflow

### Step 1 — Clone to clean temp directory

```bash
git clone https://github.com/ccwq/infocard-pub.git /tmp/infocard-pub-{slug}
cd /tmp/infocard-pub-{slug}
```

Isolate each card in its own temp clone. Keeps the main working directory clean, avoids rebase conflicts, and makes git worktree always clean after push.

### Step 2 — Collect repository facts

```bash
# Structured data: stars, topics, license, description, forks
curl https://api.github.com/repos/{owner}/{repo}
# README: try main first, then master
curl https://raw.githubusercontent.com/{owner}/{repo}/main/README.md
```

If API returns 429 (rate limit), fall back to raw README only. Extract key facts: star count, topics, license, description, language, fork count.

**GitHub API null handling**: `license.spdx_id` is `null` for Creative Commons (CC BY-NC-SA 4.0 etc.). GitHub API returns `None` in Python. Use a safe accessor:
```python
license = d.get('license', {}).get('spdx_id') or d.get('license', {}).get('name') or 'CC'
```

**Subdirectory repos** (e.g. `yaojingang/yao-open-tools/tools/TokDoc`): use the subdirectory raw URL for README:
```
curl https://raw.githubusercontent.com/yaojingang/yao-open-tools/main/tools%2FTokDoc%2FREADME.md
```
`/` in paths becomes `%2F`. Set `source_url` in meta.yaml to the subdirectory path.

### Step 3 — Download avatar / logo asset

```bash
# Owner avatar for icon use
curl -sL https://avatars.githubusercontent.com/u/{user_id} -o docs/assets/images/{slug}/avatar.png
```

Always localise the asset before writing the card HTML. Referencing remote URLs in the card is forbidden — assets must be committed to the repo.

### Step 4 — Write files

| File | Purpose |
|------|---------|
| `docs/{slug}.html` | The info card (hardblue style) |
| `docs/{slug}.html.meta.yaml` | Sidecar with all 8 required fields |
| `docs/{slug}/report.md` | Post-mortem / research notes |

**hardblue style structure:**
- Hero: kicker + title + badge-row (stars, topics, license) + alert (what it is in one line)
- Sections: 核心定位 / 技术架构 / 安装入口 / Quick Start / Open-core 模型 / 适合不适合
- Badge-row uses `<span class="badge red">16.1k ⭐</span>` style inline badges

**meta.yaml always needs all 8 fields:**
`slug`, `path` (= `docs/{slug}.html`), `title`, `desc`, `date`, `updated` (= date), `tags`, `category`.

> ⚠️ `category` is the most commonly forgotten field — without it, `npm run verify` aborts with:
> ```
> Error: Index build failed:
> - docs/{slug}.html.meta.yaml: missing fields category
> ```
> Fix: add `category: "open-source-tool"` (or appropriate category value).

**HTML element rules:**
- Use `<span class="tag">`, NOT `<tag>` — `<tag>` is not valid HTML5; html-validate fails with "is not a valid element name"
- Use `<span class="badge">` for hero inline badges

### Step 5 — Build + Verify

```bash
cd /tmp/infocard-pub-{slug}
export PATH="/home/ccwq/hehome/hermes-data/home/.volta/bin:$PATH"
npm run build
npm run verify
```

Expected: `errors: 0` in build output, verifier confirms N cards.

### Step 6 — Commit + Push (atomic)

**⚠️ CRITICAL: include ALL files in the same `git add` before the first commit.** See `references/github-repo-card-git-pitfalls-20260611.md` for the full root-cause analysis.

```bash
git add docs/{slug}.html \
       docs/{slug}.html.meta.yaml \
       docs/{slug}/report.md \
       docs/assets/images/{slug}/ \
       _index.yaml \
       index.html
git commit -m "Add {title} technical share card"
git push origin main
```

**When remote has diverged** (rejected push): do NOT use `git stash && git pull --rebase && git stash pop` — that causes merge conflicts. Instead:
```bash
git fetch origin
git reset --hard origin/main  # get clean remote state
# re-apply the fix (rewrite HTML, etc.)
git add docs/{slug}.html
git commit -m "Update {slug} card with full content"
git push origin main
```
If someone else already pushed the fix (e.g., the HTML file you forgot), just `fetch && reset --hard` and verify — no rebase needed. See `references/github-repo-card-git-pitfalls-20260611.md` for the full incident analysis.

### Step 7 — Wait + Online verify

```bash
sleep 85  # GitHub Pages CDN propagation ~85s
curl -sI https://ccwq.github.io/infocard-pub/docs/{slug}.html | head -3
```

Expect `HTTP/2 200`. If 404, wait longer and retry with cache-bust `?v=N`.

## Style choices

- **hardblue style** for technical tool / CLI / MCP server cards
- **redswiss style** for open-source ecosystem comparison / tool catalogs
- **q-style** for lightweight single-tool / tutorial cards
- Badge-row as primary stats display: `<span class="badge red">16.1k ⭐</span>` inline (replaces .stats 4-column grid for compactness)