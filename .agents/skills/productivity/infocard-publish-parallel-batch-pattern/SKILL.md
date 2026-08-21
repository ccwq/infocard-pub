---
name: infocard-publish-parallel-batch-pattern
description: "Light-batch publish 2–3 cards in parallel without worktree."
version: 2.0.0
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

**No worktree is used.** All cards written directly to primary repository `docs/`.

## Anti-pattern

Do NOT use this when:

- Cards share heavy research (use the full `infocard-publish-sop` batch with `content.json` + main renderer)
- Each card needs deep cross-source verification (use the full SOP)
- Batch size is ≥4 (split into rounds of ≤3, wait between rounds)

## Batch cardinality and artifact ownership

The user's requested number of independent cards is a release invariant. If the user says "发布 7 张卡", author and verify exactly 7 card identities; never collapse them into one collection card. A later "go/继续" means execute without another confirmation.

All author outputs must land in `docs/` before build. The orchestrator writes each HTML directly into the primary repository. A subagent claiming "created" is not evidence until the orchestrator verifies the exact HTML and meta paths, byte sizes, and matching slug/path pair.

Before build, run a cardinality preflight:

1. Expected slugs = actual HTML files = actual sidecars = index candidates.
2. Every sidecar `slug` and `path` must match the dated HTML filename exactly when the repository convention requires date-prefixed identities.
3. Do not trust an HTTP 200 alone. Parse the public `_index.yaml` and assert every expected slug is present, with the expected `date`, `updated`, `path`, and title.
4. If one card is missing or indexed under a different slug, stop the closeout, normalize the sidecar, rebuild `_index.yaml` and `index.html`, then push and re-run the full per-card public check.

## Workflow

### Step 1 — Fetch and confirm

```bash
cd ~/qbox/opendir/project/infocard-pub
git fetch origin main
```

### Step 2 — Dispatch parallel Author subagents

Each `delegate_task` call:

- goal: produce a complete HTML file for ONE card, theme X, content Y
- context: theme file path, canonical URL, source content
- explicit output rule: "write the HTML to `docs/<slug>.html` in the primary repository. Commit and push after all cards are written."

Each subagent must end by reporting:
- slug
- byte size
- completion status (COMPLETE / PARTIAL)

### Step 3 — One build, one verify, one commit, one push

```bash
npm run build
git add docs/<slug1>.html docs/<slug1>.html.meta.yaml \
        docs/<slug2>.html docs/<slug2>.html.meta.yaml \
        _index.yaml index.html
git commit -m "feat: publish <batch-title>"
git push origin main
```

### Step 4 — Public verification (all cards)

```bash
sleep 60
curl -sI https://ccwq.github.io/infocard-pub/docs/<slug1>.html | head -1
curl -sI https://ccwq.github.io/infocard-pub/docs/<slug2>.html | head -1
```

Both must return `HTTP/2 200`.

## Pitfalls

- **meta.yaml trailing `---`**: `write_file` overwrites the whole file. If the existing file ends with `---` and your new snippet starts with `---`, the on-disk YAML becomes two documents. Re-read first; write without trailing `---`. Detection: `grep -c "^---$" docs/*.meta.yaml` returns 0.
- **Section padding-left on mobile**: every theme's `section-head` needs `@media (max-width:720px) { padding-left: 14px; }`. Otherwise the number block touches the left edge.
- **Table → case-card-list**: 5+ column tables need mobile collapse to `.case-card-list`.
- **`Overview` block mandatory for hardblue**: between topbar and stats row, must include `.overview-sentence` (red, ≤50 chars) + `.overview-body` (100–400 chars).
