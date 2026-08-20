---
name: infocard-creation-preview-standards
description: Use when creating, previewing, or revising infocard HTML so PC/mobile preview entrypoints, responsive authoring constraints, and wide-table handling stay consistent across themes.
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [infocard, preview, responsive, mobile, publishing, live-server]
    related_skills: [infocard-pub-publisher, infocard-mobile-rendering-verification, infocard-legibility-publishing]
---

# Infocard Creation & Preview Standards

## Overview

This skill defines the **style-agnostic base rules** for infocard creation and preview.

It exists to keep four things stable across all infocard themes:

1. the local preview entrypoint
2. the preview URL shape
3. responsive authoring constraints that must be handled during writing/building, not only during QA
4. the specific rule for wide tables on phone-width layouts

This skill is not a theme skill. It does not control colors, typography personality, or visual language. It controls the cross-theme creation and preview contract.

## Verification Evidence Discipline

- Treat static validation and visual preview as separate gates: HTML parsing, YAML parsing, forbidden-term checks, and CSS/viewport inspection do not substitute for a real browser screenshot.
- Before claiming visual verification, confirm that the preview server actually serves the target file (HTTP status and non-empty response). If a port is occupied, inspect or choose another available port rather than assuming the existing process is healthy.
- If browser navigation is redirected to an unrelated page or the local server returns an empty response, report visual preview as incomplete; do not present static checks as screenshot evidence.
- Keep the deliverable usable even when preview infrastructure is unavailable: complete the HTML, run deterministic static checks, and clearly separate verified facts from unverified visual claims.

## When to Use

Use this skill when:
- creating a new infocard
- rebuilding an infocard from scratch
- revising layout, structure, responsive behavior, or table presentation
- previewing a card before publish
- checking whether a layout rule belongs to creation-time standards rather than one specific theme

### 重建 vs 补丁（关键区分）

**触发"重建"（从零骨架重写）的信号**：
- 用户明确说"重建"
- 用户说"样式存在问题"且非单点小修复
- HTML 文件已有多次补丁累积，结构出现裂缝（标签错位、重复闭合、空 div 残留）
- 换主题（如从 main-style 换到 hardblue）

**重建标准操作**：
1. 读取 `theme/<theme-name>.html` 完整 CSS 骨架（不是参考 HTML 片段）
2. 从零写 HTML，用 theme 的正式 CSS class（`.hero` / `.section` / `.section-no` / `.card` / `.risk` 等）
3. **禁止**用 inline style 补丁代替结构重建；禁止保留旧卡换色
4. 写完后用 Python HTMLParser 验证闭合标签
5. 更新 `meta.yaml` 的 `date` + `updated` 为当前 Asia/Shanghai 时间戳

**触发"补丁"（精准替换）的信号**：
- 已知 HTML 结构完好，只需换文案、增删一行内容
- meta.yaml 时间戳或字段修正
- 关键词增删

**禁止**：对结构已有裂缝的 HTML 打补丁。裂缝只能通过重建修复。

## Core Standards

### 0) Rule placement discipline

Cross-theme preview and responsive rules belong in this umbrella skill first.

Use this placement model:
- **This skill** owns the canonical rule for preview entrypoints, PC/mobile preview parity, creation-time responsive constraints, and desktop-vs-mobile table readability.
- **Publish / mobile / legibility skills** should reference this skill as the source of truth, then keep only their execution-specific layer.
- Do not scatter the same preview rule independently across multiple infocard skills unless a local execution note is genuinely necessary.

This prevents rule drift such as:
- preview rules being treated as mobile-only
- PC preview and mobile preview using different conventions
- wide-table handling being remembered only as QA instead of as a creation constraint

### 0.1) When a wide table rule belongs here

If the user says a wide-table rule is **style-agnostic** or says it should apply during creation rather than only during verification, treat it as a base preview/authoring rule and store it here first.

Only keep shorter execution references in downstream skills.


### 1) Standard local preview surface

All infocard local preview, including **PC preview and mobile preview**, should use the same LAN surface:

- server: `live-server`
- host: `0.0.0.0`
- port: `5588`
- preferred LAN IP: `10.6.8.14`
- URL shape: `http://10.6.8.14:5588/docs/<slug>.html`

Canonical command:

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)" || exit 1
cd "$REPO_ROOT"
live-server --host=0.0.0.0 --port=5588 --no-browser .
```

Rules:
- do not switch preview conventions between PC and mobile
- do not use old 4173/4174 preview habits unless 5588 is unavailable and that exception is stated explicitly
- do not substitute `python http.server` for the standard infocard preview workflow

### 2) Preview is not mobile-only

The same preview surface is used for:
- PC layout review
- mobile layout review
- screenshot verification
- visual debugging before publish

This avoids split-brain workflows where desktop is checked in one environment and mobile in another.

### 3) Responsive constraints belong in creation, not only acceptance

If a layout problem is predictable during authoring, it must be handled **while creating the card**, not postponed until the final mobile QA pass.

This especially applies to:
- wide tables
- multi-column blocks
- code blocks
- image galleries
- dense stat grids

Do not rely on final QA to discover a structural issue that should have been designed out earlier.

### 3.1) Author-stage trigger declaration

Before authoring, the release bundle declares `visual_review.required` and its triggers. The Author must preserve that declaration and design the responsive behavior for every listed trigger; it cannot downgrade the card to static-only review. If the card introduces a new trigger-bearing element not listed in the bundle, report it to the main thread before handoff so the bundle/evidence plan can be updated. The handoff must identify the responsive treatment for each trigger (for example: multi-column → stack, table/code → dedicated local horizontal scrolling, fixed control → normal flow or safe area on mobile).

## Wide Table Rule

### 4) Wide tables are a creation-time constraint

If a table is likely to exceed phone width, design it from the beginning with a dedicated horizontal scrolling container.

The correct strategy is:
- keep readable column widths
- preserve the rightmost columns
- allow horizontal scrolling inside the table region

The wrong strategies are:
- shrinking the entire page to force the table to fit
- scaling/zooming the viewport to fake a pass
- compressing columns until the text becomes unreadable
- clipping the rightmost columns
- replacing a structurally needed table with a broken pseudo-stack that loses comparison value

### 5) Wide-table acceptance condition on mobile

On a phone-width viewport, the table passes only if:
- the user can horizontally reach the rightmost column
- the text remains readable
- the table does not force the whole page into unusable overflow
- the rest of the page layout remains stable

This rule is **style-agnostic**. It applies across infocard themes.

### 6) Desktop readability rule for manual tables

Do not treat horizontal scrolling as the default desktop outcome for a core reference table.

If the desktop page width can reasonably accommodate the table, prefer:
- giving the table a full-width section
- moving auxiliary explanation below or above the table
- reserving split-column layouts for supporting notes rather than the main parameter matrix

Avoid putting the primary parameter/options table inside a left-right split that makes desktop users scroll sideways for information that should fit in one reading pass.

Mobile may still use an independent horizontal-scroll container when needed, but desktop should first try to preserve one-screen legibility for the main manual table.

## Standard Workflow

1. Create or revise the card in `infocard-pub`.
2. Start local preview with `live-server` on `10.6.8.14:5588`.
3. Open the draft URL on the standard LAN preview surface.
4. Review PC layout first on the same preview surface.
5. Review mobile layout on the same preview surface.
6. For any wide table, verify that the table region—not the whole page—owns the horizontal scroll behavior.
7. Only after preview is structurally correct should publish verification continue.

### Source-tree build and commit hygiene

For a new card created in an isolated worktree from `origin/main`:

1. Write the HTML, matching `.meta.yaml`, and the repository-conventional Markdown report before building.
2. Run `npm run build`; treat `_index.yaml` and the root `index.html` as generated deliverables and inspect them for changes.
3. Run `npm run verify`, `npm test`, and a file-scoped leak scan such as `node scripts/check-info-leak.js <html> <meta> <report>`.
4. Run `git diff --check` and a direct forbidden-term scan over the three authored files when the brief imposes content exclusions.
5. Build scripts may rewrite the new metadata timestamp. Preserve that generated timestamp rather than manually reverting it.
6. Stage only the authored bundle and generated index outputs. Confirm `git status --short` before committing.
7. Do not run broad `npm run fix-taxonomy` as a reflex on a fresh card: it can touch unrelated historical metadata and may fail on legacy shapes. If it has already modified unrelated files, restore only those unrelated changes, keep the target bundle, and continue with the targeted verification commands.
8. A successful build may still print historical slug-mismatch warnings; distinguish those repository-baseline warnings from errors affecting the new bundle.

### Reading `npm run build` output correctly

`npm run build` is a pipeline of scripts run sequentially. Even if one script prints a `fatal:` line, the overall build may still complete successfully — check the **last script** in the output.

Common patterns:
- `fatal: path 'docs/...html.meta.yaml' exists on disk, but not in 'HEAD'` — this is **normal and expected** for brand-new files. Git is saying the file is untracked. The build pipeline continues after this. Look for the final script output (`[build-site] wrote _index.yaml`) to confirm success.
- `[fix-meta-shape] ... errors=0` — clean.
- `wrote _index.yaml and injected index.html (N cards)` — confirmed success, where N is the total card count.
- Historical slug-mismatch warnings are **repository baseline issues**, not problems with the new card.

**Verification sequence after build:**
```bash
node scripts/check-info-leak.js docs/<slug>.html  # 0 issues = pass
git log --oneline -3                                # confirm HEAD stable
```

## Common Pitfalls

1. **Treating preview as a mobile-only rule.**
   Wrong. The live-server + LAN URL rule is for both PC and mobile preview.

2. **Putting wide-table logic only into QA skills.**
   Wrong. Wide tables are an authoring-time responsibility first, QA responsibility second.

3. **Passing by shrinking the whole page.**
   Wrong. A readable table with local horizontal scroll beats a globally shrunken page.

4. **Theme leakage.**
   Wrong. These rules belong to cross-theme creation/preview standards, not one specific style skill.

5. **Using a different local server ad hoc.**
   Wrong. Standard infocard preview should converge on `live-server` at `10.6.8.14:5588` unless an explicit exception is documented.

## Mobile Screenshot: Use Local Chrome, Not CDP

When verifying mobile layout, **do not use CDP `Page.captureScreenshot`** — it times out on headless CDP targets. Any local Chrome CLI invocation must follow `chrome-automation-safety`: unique temporary profile, owned cleanup only, and no default `--no-sandbox`.

**Correct approach (2026-06-27 confirmed):**
```bash
PROFILE_DIR="$(mktemp -d /tmp/hermes-card-profile.XXXXXX)"
google-chrome --headless=new --disable-gpu \
  --user-data-dir="$PROFILE_DIR" \
  --screenshot=/tmp/card-390.png \
  --window-size=390,844 \
  --force-device-scale-factor=2 \
  http://127.0.0.1:4173/docs/<slug>.html
rm -rf "$PROFILE_DIR"
```

This writes directly to file and returns a real PNG. The `window-size` controls viewport dimensions; `force-device-scale-factor=2` gives 2× retina quality.

**Why not CDP screenshot:** CDP `Page.captureScreenshot` on headless targets times out (~30s) even for small pages. The Chrome CLI approach is reliable and instant.

**Verification pipeline for each card:**
1. `npm run preview` (background)
2. `google-chrome --headless=new ... --window-size=390,844 ... URL`
3. `vision_analyze` or `mcp_minimax_understand_image` on the PNG

Do not attempt CDP screenshot unless a live interactive browser session is already attached.

## References

- `references/manual-table-desktop-vs-mobile.md` — when a manual/parameter table should become full-width on desktop while preserving local horizontal scroll on mobile.
- `references/rule-placement-and-table-scope-2026-06-18.md` — why cross-theme preview rules and style-agnostic wide-table constraints belong in this umbrella skill first.
- `references/darkblue-theme-classes.md` — darkblue 主题 CSS class 速查（调色板、hero、card、pill、grid 布局、SVG 简图规范），含完整参考源文件路径。

## Verification Checklist

- [ ] Local preview uses `live-server`
- [ ] Preview URL uses `http://10.6.8.14:5588/docs/<slug>.html`
- [ ] PC preview and mobile preview use the same preview surface
- [ ] Responsive constraints were handled during creation, not deferred blindly to final QA
- [ ] Wide tables use a dedicated horizontal scroll container when needed
- [ ] Mobile can reach the rightmost table columns without shrinking the entire page
- [ ] Rule application is theme-agnostic
