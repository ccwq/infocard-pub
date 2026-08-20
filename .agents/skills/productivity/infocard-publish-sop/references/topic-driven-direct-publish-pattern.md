# Topic-Driven Direct Publish Pattern

## When to Use This Pattern

User provides a **topic/title** (no external URL, no GitHub repo) and asks to write a specific-theme infocard. The agent does inline authoring based on known facts or explicit user context — no research subagent needed.

**Typical trigger phrases:**
- "Write [theme] infocard for [topic]"
- "Write [theme] HTML + meta.yaml for [topic] in [path]"
- "做[主题]信息卡"

**Contrast with light-route**: Light-route is URL-driven (GitHub API → inline research). This pattern is topic-driven (user-provided context → inline authoring, no external research).

**Contrast with protocol-v3**: Protocol-v3 uses worktree isolation, bundle contracts, and subagent handoffs. This pattern skips all of that — direct write to repo, build, commit.

## Execution Sequence

### 1. Read theme template (full file)

```bash
# Always read the theme file first — it IS the CSS/SHTML reference
cat /path/to/infocard-pub/dist/theme/darkblue.html
# darkblue is ~739 lines; use offset=500 to read the content body
# hardblue is shorter; read in full
```

Theme files live in `dist/theme/` in the infocard-pub repo (built output of `theme/` source).

### 2. Read 1-2 existing cards for metadata format + content structure

```bash
cat /path/to/infocard-pub/dist/docs/[recent-same-style-card].html.meta.yaml
cat /path/to/infocard-pub/dist/docs/[recent-same-style-card].html | head -50
```

Use same-style cards for consistent structure. For darkblue: use `agent-loop-to-graph-evolution` or similar.

### 3. Write files

**Write meta.yaml first** (determines structure), then HTML.

Key meta.yaml ordering requirement (verified 2026-07-22):
- `desc` MUST come before `title` — build script enforces field order
- Date format: `"YYYY-MM-DD HH:MM:SS"` in Asia/Shanghai timezone
- Required fields: `slug`, `path`, `title`, `desc`, `category`, `subcategory`, `tags`, `author`, `date`, `updated`, `style`, `status`

### 4. Create output directory + write to it

```bash
mkdir -p /tmp/infocard-[topic]/docs
# Write HTML and meta.yaml to /tmp/...
```

Write to `/tmp/` staging first, then copy to repo. This keeps repo clean if authoring is interrupted.

### 5. Copy to repo + build

```bash
cp /tmp/infocard-[topic]/docs/[slug].html /path/to/infocard-pub/docs/
cp /tmp/infocard-[topic]/docs/[slug].html.meta.yaml /path/to/infocard-pub/docs/

cd /path/to/infocard-pub && npm run build
# Expected: "wrote _index.yaml (N cards)" — 0 errors
```

### 6. Commit

```bash
cd /path/to/infocard-pub
git add docs/[slug].html docs/[slug].html.meta.yaml
git commit -m "feat: publish [slug] ([style], YYYY-MM-DD)"
git rev-parse HEAD   # get commit SHA
```

**Commit format**: `feat: publish <slug> (<style>, YYYY-MM-DD)`

## darkblue Content Structure Reference

This session (Graph Engineering, 2026-07-22) established a content-block pattern for darkblue:

```css
/* Two-column shell layout */
.shell { display:grid; grid-template-columns:minmax(0,1fr) minmax(260px,.86fr); gap:14px }

/* Panel component */
.panel { background:var(--panel); border:1.5px solid rgba(255,255,255,.08); border-radius:20px; box-shadow:var(--shadow) }
.panel-head { display:flex;justify-content:space-between;align-items:center;padding:12px 14px 10px;border-bottom:1px solid rgba(255,255,255,.07) }
.panel-head h3 { margin:0;font-size:13px;font-weight:900;letter-spacing:.02em;color:#fff }
.badge { font:800 10px/1 ui-monospace;background:rgba(74,120,255,.25);color:#7a9fff;border:1px solid rgba(74,120,255,.35);border-radius:999px;padding:3px 9px }

/* Bug card (4-across grid) */
.bug-card { background:var(--panel-2);border:1.5px solid rgba(255,255,255,.07);border-radius:14px;padding:12px 13px;display:grid;gap:6px }
.bug-card .num { font:900 11px/1 ui-monospace;color:#f4c84c;letter-spacing:.06em;text-transform:uppercase }
.bug-card .name { font-size:13px;font-weight:900;color:#fff }
.bug-card .desc { font-size:11.5px;color:#a8b7df;line-height:1.6 }
.bug-card.red { border-color:rgba(244,100,100,.25);background:rgba(244,100,100,.07) }
.bug-card.yellow { border-color:rgba(244,200,76,.2);background:rgba(244,200,76,.06) }
.bug-card.purple { border-color:rgba(132,89,255,.2);background:rgba(132,89,255,.06) }
.bug-card.cyan { border-color:rgba(88,195,255,.2);background:rgba(88,195,255,.06) }

/* Graph node flow (4-column) */
.graph-flow { display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px }
.node-card { background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.03));border:1.5px solid rgba(255,255,255,.09);border-radius:14px;padding:11px 9px;text-align:center;display:grid;gap:7px }
.node-icon { width:32px;height:32px;border-radius:10px;margin:0 auto;display:grid;place-items:center;font-size:16px }
.node-name { font-size:11.5px;font-weight:900;color:#fff }
.node-desc { font-size:10.5px;color:#8da0c8;line-height:1.5 }

/* Anchor list */
.anchor-list { display:grid;gap:8px }
.anchor-item { background:var(--panel-2);border:1.5px solid rgba(255,255,255,.07);border-radius:12px;padding:10px 12px;display:grid;grid-template-columns:28px 1fr;gap:10px;align-items:start }
.anchor-icon { width:28px;height:28px;border-radius:8px;display:grid;place-items:center;font-size:13px }
.anchor-name { font-size:12px;font-weight:900;color:#fff;line-height:1.3;margin-bottom:2px }
.anchor-desc { font-size:11px;color:#a8b7df;line-height:1.6 }

/* LangGraph code box */
.langgraph-box { background:linear-gradient(135deg,rgba(74,120,255,.18),rgba(88,195,255,.10));border:1.5px solid rgba(74,120,255,.3);border-radius:16px;padding:12px 13px;display:grid;gap:10px }
.code-block { background:#0a0e1a;border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:10px 11px;font:700 11px/1.6 ui-monospace;color:#a8c4f0;overflow-x:auto;white-space:pre }

/* Responsive breakpoints (darkblue) */
@media (max-width:1080px) { .hero,.shell { grid-template-columns:1fr } .graph-flow { grid-template-columns:repeat(2,1fr) } }
@media (max-width:720px) { .page { padding:10px 0 58px } .title { font-size:clamp(32px,12vw,52px) } .shell { padding:10px;gap:10px } .graph-flow { grid-template-columns:1fr } }
```

## Build Verification Output

Successful build output ends with:
```
[fix-meta-shape] mode=write scanned=N changed=0 warnings=W errors=0
[verify-meta-timestamps] OK: N changed meta sidecar(s)
[build-site] wrote _index.yaml and injected index.html (N cards)
```

The fatal error to watch for:
```
fatal: path 'docs/xxx.meta.yaml' exists on disk, but not in 'HEAD'
```
This means `npm run build` wrote to `dist/` but the files haven't been committed yet. It is **not** a build failure — the build itself succeeded. Fix: `git add` the new files and commit.

## Common Pitfalls

1. **meta.yaml field order**: `desc` before `title` is mandatory. Build script rejects wrong order even when all fields present.
2. **Don't commit `_index.yaml` / `index.html`**: CI rebuilds these from `docs/` on every push. Committing them causes rebase conflicts.
3. **Build succeeds but shows fatal git warning**: The "fatal: path exists on disk but not in HEAD" is a git warning, not a build failure. Build itself passed. Just commit the docs/ files.
4. **Missing mobile breakpoints**: Darkblue needs 720px breakpoint minimum for 390px mobile legibility.
5. **postMessage height script**: Every darkblue card needs the `send()` postMessage block at bottom of `<body>` so parent iframe resizes correctly.
