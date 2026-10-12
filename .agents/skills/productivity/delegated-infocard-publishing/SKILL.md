---
name: delegated-infocard-publishing
description: Use when infocard-publish-sop routes a complex card to bounded research handoffs stored in .docs.
version: 5.0.0
---

# Delegated Infocard Publishing: Material → Author → Verify → Publish

## Purpose

This skill governs the practical delegation loop for infocard-pub: material gathering → subagent authoring → main-line verification → publish. It is a lightweight wrapper over the formal SOP and the theme gate. It does not replace either; it supplies the exact command sequence and decision rules for the common single-card case.

## When to use

Every time the user says "publish infocard" or "发布信息卡" with a URL, GitHub repo, or social post — unless the request is query-only or preview-only.

## Steps in order

### Step 1 — Gather material (main agent)

1. Fetch source facts via API (GitHub API, fxtwitter, HuggingFace API, web_extract).
2. Write `/tmp/<slug>_material.txt` with all confirmed facts + unverified items marked ❓.
3. Create authoring directory: `.docs/<run-id>/<slug>/`.
4. **THEME DECISION BEFORE DELEGATION** (see Theme Gate below).

### Step 2 — Delegate authoring

Use `delegate_task()` with a context that:
- Points to the material file.
- Points to the authoring directory.
- **Does NOT contain `data-theme`, `Theme:`, or any theme preselection**.
- References only `theme-decision.json` for the selected theme.

Response schema required. Await completion.

### Step 3 — Main-line verification (main agent)

After subagent returns:

1. **info-leak**: `node scripts/check-info-leak.js .docs/<run-id>/<slug>/card.html`
2. **size gate**: `wc -c .docs/<run-id>/<slug>/card.html` → must be ≥ 28,000 bytes. Below 28K requires manual supplementation via `patch` targeting specific short sections, then recheck info-leak.
3. **theme match**: `grep -o 'data-theme="[^"]*"' .docs/<run-id>/<slug>/card.html` → must match `theme-decision.json.selected_theme`. Mismatch = BLOCKED_AT_THEME_MISMATCH, return to subagent.
4. **meta completeness**: check `.meta.yaml` has `category` field, no `---` YAML header, correct slug/path, correct double-suffix filename (`<slug>.html.meta.yaml`).
5. **Fix known subagent failure modes**:
   - Missing `data-theme` attribute → patch `<html>` tag directly
   - Meta missing `category` → patch directly
   - Filename without double suffix → rename `meta.yaml` → `<slug>.html.meta.yaml`

### Step 4 — Publish

```bash
cp .docs/<run-id>/<slug>/card.html docs/<slug>.html
cp .docs/<run-id>/<slug>/<slug>.html.meta.yaml docs/<slug>.html.meta.yaml
npm run build
# verify → leak → commit → push → sleep 50s → curl public URL → Wiki sync
```

## Theme Gate (mandatory before Step 2)

**This step was skipped in the 2026-10-12 session, resulting in two theme violations: Termany and Strata both preselected `darkgreen` without a decision record, and both were published anyway.** This must not recur.

```
cd /home/ccwq/qbox/opendir/project/infocard-pub

# 1. Recent 6 themes (rolling window, not by date — count from most recent)
grep -h 'data-theme=' docs/202610*.html | grep -o 'data-theme="[^"]*"' | tail -6

# 2. Read themes.json to know available themes
grep '"label"' theme/themes.json

# 3. Call infocard-theme-assignment workflow:
#    - Read content_type / content_shape from material
#    - Filter themes.json candidates by capability
#    - Exclude recent 6 + any in-flight
#    - Generate theme-decision.json in .docs/<run-id>/<slug>/
# If infocard-theme-assignment is unavailable: manually read themes.json,
# apply capability filter, exclude recent 6, write theme-decision.json, proceed.
# Never skip this step.

# 4. Verify delegation prompt does not contain theme preselection
grep -i 'data-theme\|Theme:\|Create a.*card' <delegation-prompt.txt>
# nonzero = VIOLATION, rewrite prompt before dispatching
```

**Post-authoring theme verification**:
```bash
grep -o 'data-theme="[^"]*"' .docs/<run-id>/<slug>/card.html
# Compare to: jq -r '.selected_theme' .docs/<run-id>/<slug>/theme-decision.json
# → mismatch = BLOCKED_AT_THEME_MISMATCH, return card to Author
```

## Known subagent failure modes

| Failure | Fix |
|---|---|
| Iteration cap hit → incomplete card (<28K bytes) | Main agent supplements via targeted `patch`, then recheck info-leak |
| Unregistered theme invented (`q-style`, `q2`) | BLOCKED_AT_THEME_MISMATCH. Only `theme/*.html` bare slugs from `theme/themes.json` are valid |
| Missing `category` in meta.yaml | `patch` to add `category:` field directly |
| YAML header `---` in meta.yaml | `patch` to remove it; single-doc YAML starts with `slug:` |
| Missing `data-theme` attribute | `patch` `<html>` tag to add `data-theme="<selected>"` |
| Meta filename missing double suffix | `mv meta.yaml <slug>.html.meta.yaml` |

## What this skill does NOT cover

- Batch parallel delegation (→ `infocard-publish-sop` full route)
- Visual mobile verification gate (→ `visual-verification-gate`)
- Update-card timestamp sync (→ `infocard-publish-sop`)
- Theme rebuild or redesign (→ `infocard-style-man-skill`)
- Research A / Research B handoffs (→ `delegated-infocard-publishing` prior v4 schema)

These are out-of-scope and must not be mixed into the delegation loop.
