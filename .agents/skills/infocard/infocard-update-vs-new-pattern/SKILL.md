---
name: infocard-update-vs-new-pattern
description: "Light-route: update vs. new card + leak false-positive fix."
category: infocard
version: 1.0.0
---

# Infocard Update vs. New Card + Leak Fix

## When an Old Card Exists for the Same Project

Decide BEFORE creating new HTML files:

| Signal | Action |
|--------|--------|
| Different narrative angle, new major feature/version | **New card** |
| Old from GitHub, new from X/WeChat | **New card** |
| Substantially different target audience | **New card** |
| >30% new content | **New card** |
| Same narrative, Stars/version bump only | **Update existing** |
| Same audience, data refresh only | **Update existing** |

## Read-Only Duplicate Audit Before Authoring

For a new project or topic, audit both the live public index and the freshest local `origin/main` before deciding new-vs-update. Separate findings into three buckets:

1. **Exact match** — same canonical repository/source URL, project identity, or existing slug: route to update/duplicate decision.
2. **Adjacent-topic match** — similar concepts, tools, or audience (for example knowledge graph, Markdown memory, Rust CLI, or MCP memory) but a different repository: treat as context, not as an existing card for the requested project.
3. **No relevant match** — no exact or materially overlapping card: new card is appropriate.

Always report the evidence paths/URLs and the decision. A broad keyword hit such as `memory`, `Rust`, `MCP`, or `knowledge graph` is not by itself a duplicate.

Before a release worktree is selected, verify `origin/main` freshness and inspect registered worktrees. Do not reuse a detached-HEAD, dirty, stale, or unrelated worktree; create a clean worktree from the fetched `origin/main` when publishing is authorized. In a read-only audit, do not reset, stash, clean, write files, commit, or push.

## Update Workflow (do NOT create a new HTML file)

```bash
# Step 1: verify old card exists
ls docs/<OLD-SLUG>.html docs/<OLD-SLUG>.html.meta.yaml

# Step 2: patch HTML content in-place
python3 << 'PY'
import re
with open('docs/<OLD-SLUG>.html', 'r+') as f:
    html = f.read()
# Patch: title tag, h1, kicker, subtitle, badge-row, stats, alert
# ... incremental re.sub patches ...
    f.seek(0); f.write(html); f.truncate()
PY

# Step 3: update meta.yaml in-place — preserve slug, path, original date
# Only change: title, desc, updated, tags, source_url
# Do NOT create a new path or slug — keep original path

# Step 4: build → verify → commit → push
npm run build && node scripts/verify-index.js
git add docs/<OLD-SLUG>.html docs/<OLD-SLUG>.html.meta.yaml _index.yaml index.html
git commit -m "feat: update <slug> to <new-data-point> Stars + <source>"
git push origin HEAD:main
```

**Common mistake**: `cp old.html new.html` then edit — creates orphaned files, pollutes index, noisy git history. **Update in-place.**

## Leak Scanner False Positive: `git@github.com`

`scripts/check-info-leak.js` flags `git@github.com` as a personal email. This is a **false positive** — valid SSH Git URL syntax.

**Fix immediately after any HTML write that includes Git commands:**
```bash
sed -i 's|git@github\.com|github.com|g' docs/<SLUG>.html
node scripts/check-info-leak.js docs/<SLUG>.html  # must return 0 issues
```

Do NOT suppress or ignore the HIGH alert — replace the string and re-verify.
