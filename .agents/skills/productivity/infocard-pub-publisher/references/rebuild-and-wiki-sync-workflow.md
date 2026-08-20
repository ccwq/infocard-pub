# Rebuild + Wiki Sync Workflow

> Session-validated pattern: 2026-06-28 (Camoufox rebuild)

## When rebuild triggers wiki sync

| Rebuild type | Wiki sync required? |
|---|---|
| Visual retheme only (colors/CSS, same content) | Optional |
| Audience/focus change (generic → Hermes users) | **Required** |
| New major section added | Required |
| `updated` timestamp changed | Optional |

## Standard rebuild sequence

```bash
# 1. Read existing HTML (public URL or local file)
curl -s "https://raw.githubusercontent.com/ccwq/infocard-pub/main/docs/<slug>.html"

# 2. write_file — overwrite with new structure + CSS (from scratch)
#    DO NOT patch/recolor — rebuild means full structure rewrite

# 3. Check if .meta.yaml exists
ls /home/ccwq/infocard-pub/docs/<slug>.html.meta.yaml

# 4a. If exists → update date/updated to current publish time, keep slug
# 4b. If not exists → create new .meta.yaml with current TZ=Asia/Shanghai date

# 5. npm run build && npm run verify

# 6. npm run fix-taxonomy

# 7. npm run build  # regenerate _index.yaml with fix-taxonomy output

# 8. git add <slug>.html [.meta.yaml if new] docs/*.meta.yaml  # all modified sidecars
#    git add _index.yaml index.html

# 9. git commit -m "docs: rebuild <name> infocard (YYYYMMDD)"
#    git push origin main

# 10. Wait ~90s for CI, then verify
curl -sI "https://ccwq.github.io/infocard-pub/docs/<slug>.html"  # HTTP 200

# 11. Verify title via raw (GitHub CDN caches titles 1-3 min)
curl -s "https://raw.githubusercontent.com/ccwq/infocard-pub/main/docs/<slug>.html" | grep '<title>'

# 12. Wiki sync (if audience/focus changed)
#     → concepts/<slug>.md: update summary, change description
#     → index.md: update the entry description
#     → log.md: append rebuild record
```

## Wiki sync for rebuild (audience change)

When rebuilding changes the target audience (e.g., Camoufox: generic → Hermes Agent users):

1. **concepts/<slug>.md**: Update the first paragraph and "一句话定位" to reflect new audience
2. **index.md**: Update the card's one-line description
3. **log.md**: Append rebuild record (not a new card, a rebuild)

Do NOT create a new `raw/` file for a rebuild — the raw source is the same repo URL. Just update the existing wiki concept page.

## GitHub CDN title verification delay

After `git push` and `HTTP 200` from `curl -sI https://ccwq.github.io/infocard-pub/docs/<slug>.html`:

```
SYMPTOM: <title> tag still shows old value
CAUSE: GitHub Pages CDN caches old HTML for 1-3 minutes
VERIFICATION: curl -s https://raw.githubusercontent.com/ccwq/infocard-pub/main/docs/<slug>.html | grep '<title>'
RESULT: raw.githubusercontent.com does NOT use CDN — content is immediate
```

This is normal behavior, not a deployment failure. The card is published once HTTP 200 + raw.githubusercontent.com shows correct title. Do not re-push or force-rebuild to "fix" the CDN delay.

## Re-fetch upstream before rebuild (mandatory)

Rebuilding means "rebuild based on latest data", not "rewrite old card with same data":

1. Re-fetch `api.github.com/repos/{owner}/{repo}` for current Stars/forks/description
2. Check if repo has migrated (compare `html_url` with what the old card says)
3. Re-fetch `raw.githubusercontent.com/{owner}/{repo}/main/README.md` for latest content
4. Compare with old HTML data — if anything is stale, update it
5. Then rebuild

## Canonical examples

**Camoufox rebuild (2026-06-28):**
- Old: paper style, generic users, 9.4K Stars, `github.com/daijro/camoufox`
- New: darkblue, Hermes Agent users, updated meta.yaml `date: 2026-06-28 02:50:00`
- New sections: Playwright/CDP integration, MCP toolchain, Hermes workflows
- Wiki synced: concepts/camoufox-anti-detect-browser.md updated
- Commit: 58e7b02

**Open Lovable rebuild (2026-06-28):**
- **Upstream data changed before rebuild**: re-fetched GitHub and found repo migrated `mendableai/open-lovable` → `firecrawl/open-lovable`, Stars 24K → 27K, Forks 5.2K added
- **Lesson**: rebuild must re-fetch upstream data first — old HTML may have stale metadata
- Old: `github.com/mendableai/open-lovable`, Stars 24K+, E2B required
- New: `github.com/firecrawl/open-lovable`, Stars 27K, Forks 5.2K, Vercel default + E2B optional, v3 last-commit 7 months ago warning
- Added: Hermes Agent workflow section, correct env config, taxonomy hermes-agent + mcp + vercel tags
- Commit: 7170cb2

## Subagent sibling conflict avoidance

When using `delegate_task` to parallelize card writing:
- **Problem**: parent and child agents may both write the same file simultaneously
- **Warning signal**: `write_file` returns `"file was modified by sibling subagent"` or similar
- **Handling**: `read_file` the current file first, then write; if child already updated it, prefer child's version
- **Prevention**: do NOT parallel-write the same slug from parent + child; parent handles push/wiki sync, child only writes HTML/meta