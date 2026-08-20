# Light-Route URL-Driven Infocard Pattern

## When to Use This Pattern

User provides a **single GitHub/website URL** and explicitly asks to publish. The orchestrator can extract sufficient facts from the URL without deep multi-source research. This is NOT a complex batch — it is a bounded single-card run.

**Contrast with full 3-agent pipeline**: Research A/B delegation is for complex cards requiring multi-source cross-verification, risk-sensitive claims, or batch coordination with capacity/single-writer gates.

## Optimized 3-Step Pattern

### Step 1 — Orchestrator: Worktree + Inline Research + Bundle (no subagent)

Use **separate atomic terminal calls** — never combine worktree creation, bundle writing, and source fetching into one shell script. Each call should do exactly one thing.

```bash
# Call 1: Create worktree (atomic)
git fetch origin main --quiet
BRANCH=infocard/<slug>
git branch -f "$BRANCH" origin/main 2>/dev/null || true
WORKTREE=$(node scripts/infocard-worktree.js resolve --run-id <run-id> --slug <slug> --plain)
mkdir -p "$WORKTREE"
git -C "$REPO" worktree add "$WORKTREE" "$BRANCH" --quiet
echo "WORKTREE=$WORKTREE"

# Call 2: Write bundle (atomic — heredoc, no shell expansion)
cat > "$BASE/publish-bundle.json" <<'BUNDLE'
{"schema_version":3,"run_id":"...","identity":{"slug":"...","title":"..."},"route":"light",...}
BUNDLE

# Call 3: Fetch primary source (atomic)
curl -sL --max-time 15 "https://raw.githubusercontent.com/<owner>/<repo>/main/README.md" \
  -o "$BASE/sources/readme.md"
```

**node_modules check**: many `build-site.js` scripts use only Node.js built-ins (`child_process`, `path`, `fs`) — no `node_modules` symlink needed. Verify before creating it.

**t.co URL resolution**: if the source contains `t.co` short links, resolve them in a separate atomic call. Do NOT mix resolution with other steps.

## Pitfalls

**Skill name ambiguity**: `infocard-q-style` has two matches (`infocard-q-style/` and `content/infocard-q-style/`). Pass the full categorized path to `skill_view`: `name='content/infocard-q-style'`. The bare name triggers a refusal.

**Q-style guide path**: the Q-style HTML generation guide lives at `skills/content/infocard-q-style/references/q-style-html-generation-guide.md`, NOT under the top-level skill directory. Pass the correct path to subagents.

### Step 2 — Orchestrator: Delegate Authoring Only

Dispatch a single Authoring subagent per card. Keep all other work in the orchestrator (worktree setup, research, bundle creation, build, verify, commit, push, public verification).

### Step 3 — Orchestrator: Build → Verify → Commit → Push → Public Verification

**Pre-build gate**: normalize meta.yaml timestamps before running build. `verify-meta-timestamps.js` requires wall-clock `YYYY-MM-DD HH:MM:SS` format — rejects ISO/T/Z format like `"2026-07-19T16:00:00+08:00"`:
```bash
# Generate correct wall-clock timestamp
date_tz=$(TZ=Asia/Shanghai date '+%Y-%m-%d %H:%M:%S')
# e.g. "2026-07-19 16:48:00"
sed -i "s/date:.*/date: \"$date_tz\"/; s/updated:.*/updated: \"$date_tz\"/" docs/<slug>.html.meta.yaml
```

Then build, verify, and push:
```bash
npm run build && npm run verify && npm run check-leak
# ... build output ...
git add docs/<slug>.html docs/<slug>.html.meta.yaml && git commit -m "feat: publish <title>" && git push origin main
# Public: curl -I https://<user>.github.io/<repo>/docs/<slug>.html
```

## GitHub README Extraction Notes

Fallback order for `raw.githubusercontent.com/<owner>/<repo>/main/README.md`:
1. Try `main` branch (lowercase) — may return **404** even when branch exists
2. Try `master` branch — common older convention
3. Try GitHub API: `curl -sL -H "Accept: application/vnd.github.raw" "https://api.github.com/repos/<owner>/<repo>/readme"` — most reliable
4. Web search as last resort

**Case sensitivity**: GitHub hostnames are case-sensitive. `Lissy93/web-check` works but `lissy93/web-check` does not. Always use the exact case from the URL provided by the user.

**Web-check example** (2026-07-19): `raw.githubusercontent.com/lissy93/web-check/main/README.md` returned 404 (wrong case). `Lissy93/web-check` works. GitHub API with `-H "Accept: application/vnd.github.raw"` is the most reliable method and should be attempted before web search.

## Parallel Authoring (multiple cards)

When user requests multiple cards simultaneously: run Step 1 for all cards in parallel, then dispatch all Authoring subagents in parallel, then batch Step 3 (build→verify→commit→push→public-verification) for all worktrees sequentially.

## Theme Selection Heuristics

| Theme | Use Case |
|---|---|
| hardblue | Hardcore tool/CLI/tutorial/评测 |
| darkblue | Architecture/system/AI |
| graph-paper | Methodology/knowledge graph |
| q / paper-warm | Local dev/developer tutorial |
| redswiss | Open source ecosystem comparison |

## Bundle Schema v3 for Light-Route

Key fields: `route: "light"`, `asset_policy.mode: "empty"`, `repository.root` as absolute path, `author.allowlist` with exact output paths.
For new runs, `repository.root` must be the fixed temp/infocard-worktree path returned by the infocard-worktree resolve CLI, not a repo-local `wt-*` path.
