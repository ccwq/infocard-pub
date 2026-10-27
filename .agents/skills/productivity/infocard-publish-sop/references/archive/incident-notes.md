# infocard-publish-sop 事故笔记归档

本文件保存按日期标记的事故笔记。默认不加载（architecture.json 将带日期/incident 的 reference 标为 archive，default_load=false）。
仅在明确命中同类事故时查阅。活动规则在 SKILL.md 正文。

---

## Build/verify exception: incremental-vs-full count mismatch (2026-10-08)

**Symptom**: `npm run build` succeeds but `npm run verify` fails with `_index.yaml is out of date`. The disk `_index.yaml` `_count` does not match `buildIndexData()` output (incremental = 1173, full = 1175 in incident).

**Root cause**: Incremental build `buildIndexData({metaPaths:[...]})` can produce a different card count than full rebuild `buildIndexData()`. This is a pre-existing build-system inconsistency. The `index.html` injection path also differs between incremental and full modes.

**Workaround sequence**:

```bash
# Step 1: confirm the mismatch with independent checks
node -e "const {buildIndexData} = require('./scripts/index-build-lib'); const r=buildIndexData(); console.log('full rebuild count:', r._count);"
node -e "const fs=require('fs'); const m=fs.readFileSync('_index.yaml','utf8').match(/_count: (\d+)/); console.log('disk count:', m ? m[1] : 'N/A');"

# Step 2: if counts differ, force full rebuild (may timeout on large repos)
node scripts/build-site.js --full

# Step 3: if --full times out, use git to restore dist/ and commit only source
git checkout -- dist/
git add index.html _index.yaml
git commit -m "build: sync index.html injection and _index.yaml"
npm run verify   # should pass

# Step 4: push
git push origin main
```

**This is a build-system bug, not a publication SOP error.** Work around and continue. Do not let this block card release. After recovery, note as known limitation.

---

## Theme enforcement gate (2026-10-12)

**Rule**: before delegating Author, `infocard-theme-assignment` MUST produce a frozen `theme-decision.json`. The delegation prompt MUST NOT contain `data-theme="<name>"`, `Theme: <name>`, `Create a <name> card`, or any equivalent preselection. It must reference only the decision record.

**Pre-delegation check sequence**:
```bash
cd /home/ccwq/qbox/opendir/project/infocard-pub
# 1. recent themes (last 6 published, grep actual data-theme values)
grep -h 'data-theme=' docs/202610*.html | grep -o 'data-theme="[^"]*"' | tail -6
# 2. check decision record exists
ls .docs/<run-id>/<slug>/theme-decision.json
# 3. verify prompt does not preselect theme
grep -i 'data-theme\|Theme:\|Create a.*card' <delegation-prompt.txt>
# → nonzero = VIOLATION, stop and regenerate prompt
```

**Post-delegation check**:
```bash
# After card.html is written, verify the theme used matches the decision
grep -o 'data-theme="[^"]*"' .docs/<run-id>/<slug>/card.html
# Compare to: jq -r '.selected_theme' .docs/<run-id>/<slug>/theme-decision.json
# → mismatch = BLOCKED_AT_THEME_MISMATCH, return card to Author
```

**Known violations from 2026-10-12 session**: Termany and Strata delegations listed `darkgreen` in the "avoid list" but did not call `infocard-theme-assignment`, did not generate a decision record, and the delegation prompts contained `data-theme` preselection. Both cards were published anyway. This must not recur.

---

## Promotion gate gotchas (2026-10-14)

`promote-infocard.js` rejects a candidate on three recurring structural errors. Fixing them up front saves a round per card.

1. `theme.html.data-theme` — the `<html>` element must carry `data-theme="<frozen theme>"`. Putting it on `<body>` does not satisfy the gate.
2. `theme.html.implementation: missing required selector .x` — the check is a literal substring test for `class="x`. A node matches only when the selector name comes **first** in the class attribute: `class="main-grid grid gap"` passes, `class="grid main-grid gap"` fails. Read `required_selectors` from `theme/themes.json` and wire each one to a real element.
3. `theme.html.colors` / `theme.html.tokens` — colour literals are forbidden outside `:root` (the checker strips `:root{...}` before scanning) and the page must consume tokens via `var(--token)`. Themes vary: `blue` ships no variables at all, `sage-swiss` requires `.stats-row/.main-grid/.analysis-grid`, `graph-paper` declares none. Declare the extra palette values as tokens inside `:root` and reference them, instead of editing the frozen theme.

Any HTML edit after promotion invalidates the manifest's `sha256`; recompute `files[].sha256` before re-running promotion.

---

## Push rejection under concurrent sessions (2026-10-14)

Several Hermes sessions share this checkout. A push can fail with `remote ref points at a non-commit object`, or `fatal: bad object refs/heads/main` alongside `did not send all necessary objects`. This is a transient read of a ref another session is rewriting, not divergence.

Recover with: `git fetch origin main`, confirm `git rev-list --left-right --count origin/main...main` shows divergence `0  N`, then re-run the ordinary `git push origin main`. **Never `--force`.**

Because parallel sessions promote cards into the same `docs/`, run `npm run build -- --full` immediately before committing; the regenerated `_index.yaml`/`index.html` will legitimately reference sibling cards produced by other sessions. Commit those two generated files with your own card, but do not commit other sessions' card HTML/sidecar files.

