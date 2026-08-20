---
name: infocard-publish-parallel-batch-pattern
description: "Light-batch publish 2–3 cards in parallel."
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, publish, batch, parallel, light-route]
    related_skills: [infocard-publish-sop]
---

# Parallel Light-Batch Infocard Publishing

## When to use

- 2 or 3 self-contained cards, each with a different theme (e.g. hardblue + pixelstack)
- Each card has its own fixed facts (no shared research handoff)
- Total API budget fits in one round (`max_concurrent_children=3`)
- All cards belong to one user-facing batch release

## Anti-pattern

Do NOT use this when:

- Cards share heavy research (use the full `infocard-publish-sop` batch with `content.json` + main renderer)
- Each card needs deep cross-source verification (use the full SOP)
- Batch size is ≥4 (split into rounds of ≤3, wait between rounds)

## Batch cardinality and artifact ownership (2026-07-29)

The user's requested number of independent cards is a release invariant. If the user says "发布 7 张卡", author and verify exactly 7 card identities; never collapse them into one collection card. A later "go/继续" means execute without another confirmation.

All author outputs must land in a declared handoff location before integration. Prefer one run-local handoff directory or `/tmp/infocard-<slug>/` per card, then copy by allowlist into the single publisher worktree. A subagent claiming "created" is not evidence until the orchestrator verifies the exact HTML and meta paths, byte sizes, and matching slug/path pair.

Before build, run a cardinality preflight:

1. Expected slugs = actual HTML files = actual sidecars = index candidates.
2. Every sidecar `slug` and `path` must match the dated HTML filename exactly when the repository convention requires date-prefixed identities.
3. Do not trust an HTTP 200 alone. Parse the public `_index.yaml` and assert every expected slug is present, with the expected `date`, `updated`, `path`, and title.
4. If one card is missing or indexed under a different slug, stop the closeout, normalize the sidecar, rebuild `_index.yaml` and `index.html`, then push and re-run the full per-card public check.

This is especially important when a subagent writes outside the repository or returns a legacy sidecar: a page can return HTTP 200 while remaining absent from the public index.

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)" || exit 1
cd "$REPO_ROOT"
git fetch origin main --quiet
git branch -f infocard/<batch-slug>-YYYYMMDD origin/main
WT=$(node scripts/infocard-worktree.js resolve --run-id <run-id> --slug <batch-slug>-YYYYMMDD --plain)
git worktree add "$WT" infocard/<batch-slug>-YYYYMMDD --quiet
```

## Social-to-repository research handoff

When a social post names an open-source project or contains a shortened GitHub link, use the repository as the primary implementation source before authoring. Resolve the canonical repository via GitHub API/search when redirect resolution is unreliable; verify `full_name`, description, stars, forks, license, language, timestamps, and canonical URL, then read README plus architecture/knowledge/configuration docs. Keep social claims, first-party repository facts, and community leads as separate evidence classes. For a detail card plus a beginner/advanced guide, use one shared fact pack and one isolated publisher worktree, but give each card a distinct outline. See `references/social-to-repo-research-20260729.md` for the reusable evidence boundary, AutoDev Studio fact pack, benchmark wording, and release-evidence checklist.

### Step 2 — Dispatch parallel Author subagents

Each `delegate_task` call:

- goal: produce a complete HTML file for ONE card, theme X, content Y
- context: theme file path, crayon-r5 references, hardblue Overview CSS reminder
- explicit output rule: "write the HTML to `/tmp/infocard-<slug>.html`, do NOT touch the worktree, do NOT git add/commit/push"

Why `/tmp/`: avoids concurrent mtime shifts on `_index.yaml` / `index.html` from parallel writers, and keeps the publisher as the sole Git writer.

Each subagent must end by reporting:

- absolute file path
- byte size
- completion status (COMPLETE / PARTIAL)

### Step 3 — After all subagents finish

In the orchestrator:

```bash
WT=<path returned by node scripts/infocard-worktree.js resolve --run-id <run-id> --slug <batch-slug>-YYYYMMDD>
cp /tmp/infocard-<slug1>.html $WT/docs/<slug1>.html
cp /tmp/infocard-<slug2>.html $WT/docs/<slug2>.html

# Write meta.yaml for each (write_file, NO trailing ---)
# Required fields: slug, title, desc, date, updated, tags, category,
#                  author, source, source_url, style, path
```

### Step 4 — One build, one verify, one commit, one push

```bash
cd $WT
npm run build
git add docs/<slug1>.html docs/<slug1>.html.meta.yaml \
        docs/<slug2>.html docs/<slug2>.html.meta.yaml \
        _index.yaml index.html
git commit -m "feat: publish <batch-title>"
git push origin infocard/<batch-slug>-YYYYMMDD:main --force
```

### Step 5 — Public verification (all cards)

```bash
sleep 60
curl -sI https://ccwq.github.io/infocard-pub/docs/<slug1>.html | head -1
curl -sI https://ccwq.github.io/infocard-pub/docs/<slug2>.html | head -1
```

Both must return `HTTP/2 200`.

### Step 6 — Retained worktree report

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)" || exit 1
cd "$REPO_ROOT"
npm run worktree:list -- --repo .
```

Do not remove the batch worktree automatically. Report historical worktrees and prompt the user: `如需清理可安全删除的历史 worktree，请回复：del-rm`. If the user replies exactly `del-rm`, re-scan and run `npm run worktree:cleanup -- --repo . --confirm del-rm`; never use `--force`.

## Pitfalls

- **meta.yaml trailing `---`**: `write_file` overwrites the whole file. If the existing file ends with `---` and your new snippet starts with `---`, the on-disk YAML becomes two documents. Re-read first; write without trailing `---`. Detection: `grep -c "^---$" docs/*.meta.yaml` returns 0.
- **Section padding-left:14px on mobile**: every theme's `section-head` (with red 01/02/03 number block) needs `@media (max-width:720px) { .section-head { padding-left: 14px; } }`. Otherwise the number block touches the left edge.
- **Table → case-card-list**: 5+ column tables need mobile collapse to `.case-card-list` (use `data-label` + `::before` per row). A squeezed single-character-per-line screenshot is FAIL.
- **`Overview` block mandatory for hardblue**: between topbar and stats row, must include `.overview-sentence` (red, ≤50 chars) + `.overview-body` (100–400 chars).
- **One branch per batch**: never dispatch parallel subagents to multiple worktrees. The main publisher owns exactly one worktree.

## Verified run

2026-07-28 PPT batch: 2 cards (hardblue + pixelstack), ~5 minutes total, both cards HTTP 200, single commit `2fcd752`.
