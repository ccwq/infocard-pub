# Direct-Write to Integration Worktree Pattern

## When to Use This Pattern

User provides an **existing worktree path** and explicitly says **"不要 git/build/push/安装"** (no git operations, no build, no install, no subagent). The orchestrator writes files directly to the worktree and stops. No subagent dispatch, no `npm run build`, no commit, no push.

**Typical trigger phrases:**
- "在 worktree=… 中写"
- "不要 git/build/push/安装"
- "从零创作" + "直接写入"
- "不使用 subagent"

**Contrast with light-route**: Light-route still dispatches an Authoring subagent. This pattern skips that entirely — main thread writes all three files directly.

## Required Files (always write all three)

1. `docs/<slug>.html` — visual infocard (darkblue or hardblue theme)
2. `docs/<slug>.html.meta.yaml` — sidecar metadata with evidence boundaries
3. `docs/<slug>.md` — plain-text companion

## Step-by-Step

### 1. Determine worktree and read theme template

```bash
ls /path/to/worktree/theme/           # list available themes
ls /path/to/worktree/docs/           # check existing card patterns
```

Typical themes: `darkblue.html` (AI/architecture/system) or `hardblue.html` (tutorial/评测/CLI).

### 2. Read theme template + 1-2 existing cards for style reference

Read the full theme HTML (check line count first — darkblue is ~739 lines, use offset for tail). Read 1-2 existing cards in the same worktree to match metadata format and visual style conventions.

### 3. Write HTML

Key darkblue conventions observed from existing cards:
- CSS variables: `--bg:#0b1020`, `--cyan:#59c7ff`, `--blue:#5b7cff`, `--green:#38d996`, `--yellow:#f3ca57`, `--purple:#a17cff`, `--red:#ff7698`
- Responsive breakpoints: `@media(max-width:900px)`, `(max-width:600px)`, `(max-width:380px)`
- Min font: 11-12px (body text, captions, metadata)
- Hero grid: `grid-template-columns:1.08fr .92fr`
- Include `postMessage` height report in `<script>` block at bottom
- Sections use `.section > .section-head + .section-body` pattern
- `.badge` and `.chip` classes for inline metadata

### 4. Write meta.yaml

Evidence boundary structure (required for X-sourced cards):
```yaml
sources:
  verified:
    - github.com/NousResearch/hermes-agent README（明确标注的能力）
  unverified:
    - X 帖文 URL（收入/人物/案例全部未核验）
evidence_boundary:
  verified_facts: [...]
  unverified_claims: [...]
  risk_notes: [...]
```

### 5. Write .md

Plain-text companion: title, section headers, tables, inline lists, source links.

### 6. Verify files written

```bash
ls -lh docs/<slug>.*
```

Report file sizes to user — no git, no build, no push.

## Darkblue Theme — Key CSS Patterns

```css
/* Hero grid */
.hero { display:grid; grid-template-columns:1.08fr .92fr; gap:14px; }

/* Phase cards grid */
.phase-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px }

/* Evidence box */
.ev-box { border:1px solid var(--line); border-radius:14px; padding:12px; font-size:12px }
.ev-box.verified { border-color:rgba(56,217,150,.4); background:rgba(56,217,150,.06) }
.ev-box.unverified { border-color:rgba(255,118,152,.4); background:rgba(255,118,152,.06) }
.ev-box.boundary { border-color:rgba(243,202,87,.4); background:rgba(243,202,87,.06) }

/* Capability table */
.cap-table { width:100%; border-collapse:collapse; font-size:12px }
.cap-table th { background:rgba(91,124,255,.18); color:var(--cyan); padding:8px 10px }

/* Responsive */
@media(max-width:900px){ .hero{grid-template-columns:1fr} .phase-grid{grid-template-columns:repeat(2,1fr)} }
@media(max-width:600px){ .phase-grid{grid-template-columns:1fr 1fr} }
@media(max-width:380px){ .phase-grid{grid-template-columns:1fr} }
```

## Evidence Boundary Requirements

For cards sourcing claims from X posts, social media, or unverified case studies:

1. **Unverified claims box** — explicit HTML box with red border (`--red`) stating all income figures, person backgrounds, and specific cases are unverified
2. **Meta.yaml sources** — `sources.unverified` array with exact X URL, timestamp, and "未核验" label
3. **Footer link** — footer must include verified source link (official GitHub/README) and mark unverified sources with ⚠
4. **No conclusion language** — do not use "证实", "确认", "证明" for unverified items

## Common Pitfalls

- **Forgetting postMessage height script** — parent iframe won't resize correctly
- **Missing responsive breakpoints** — test at 900px, 600px, 380px manually
- **Evidence boundary not explicit** — if X post has unverified claims, must add unverified box, not just mention in text
- **Wrong theme** — darkblue for AI/architecture/system, hardblue for tutorial/评测/CLI
