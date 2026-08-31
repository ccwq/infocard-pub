# Mobile CSS Grid Overflow Pitfall (Update Existing Card)

## Context

When patching an already-published card with new HTML sections (e.g. adding "07 快捷键速查表" + "08 场景化配置" + "09 设置同步" + "10 插件系统" + "11 Keymap" to a Fresh editor card), new CSS class names like `.scenario-grid`, `.arch-grid`, `.install-grid`, `.lsp-grid` were written into the HTML `<body>` but the corresponding CSS rules were never added to the `<style>` block.

Result: the grid containers default to `width: auto` (content-driven), overflow their parent at any viewport width, and appear truncated on mobile.

## Root Cause Anatomy

1. **Theme templates** (hardblue/redswiss/graph-paper) define `.install-grid` and `.lsp-grid` in their base `<style>` block.
2. `.scenario-grid` and `.arch-grid` are NOT in any standard theme template — they are arbitrary class names that happen to be used in some card content.
3. When authoring new sections, if the author copies HTML structure from other cards (e.g. scenario cards from another context) without also copying the matching CSS rules, the classes exist in HTML but not in CSS.
4. `search_files` / `grep` in terminal can find the HTML class usage but not confirm whether CSS definition exists — both return matches from different files.

## Diagnosis Command

```bash
# Step 1: find all grid class usages in the target HTML
grep -n 'scenario-grid\|arch-grid\|install-grid\|lsp-grid\|feature-grid' docs/<slug>.html

# Step 2: check if those classes have CSS definitions in the same file
# (only works if CSS is in same HTML file, which it is for infocard-pub cards)
for cls in scenario-grid arch-grid install-grid lsp-grid feature-grid; do
  count=$(grep -c "\\.${cls}{" docs/<slug>.html || echo 0)
  echo "$cls: ${count} CSS rules"
done
# Output "cls: 0 CSS rules" = CSS not defined but HTML uses it
```

## Standard Fix (3 Steps)

### Step 1: Add missing CSS grid definitions

Find the nearest existing grid CSS block (usually near `.install-grid` or `.lsp-grid`) and inject:

```css
.scenario-grid{display:flex;flex-direction:column;gap:8px}
.scenario-item{border:2px solid var(--line);background:#fff;overflow:hidden;box-shadow:4px 4px 0 rgba(10,10,10,.08)}
.scenario-tag{font-weight:900;font-size:11px;color:var(--red);padding:6px 10px 0;border-bottom:1px solid #eee;line-height:1.3}
.scenario-body{padding:6px 10px 10px}
.arch-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.install-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.lsp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.feature-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.arch-diagram{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
```

### Step 2: Add mobile media query rules

In `@media (max-width: 760px)` block, add the grid classes to the single-column collapse rule:

```css
@media (max-width: 760px){
  .feature-grid,.lsp-grid,.install-grid,.arch-grid,.scenario-grid,.preview-wrap{grid-template-columns:1fr}
  table,thead,tbody,tfoot,tr,th,td{display:block;overflow-x:auto}
  .quick-cmd,pre{max-width:100%;overflow-x:auto}
}
```

### Step 3: Fix quick-cmd overflow

Code blocks need `overflow-x:auto` + `white-space:pre`:

```css
.quick-cmd{
  /* ... existing styles ... */
  overflow-x:auto;
  white-space:pre;
}
```

## Scenario-item layout pitfall

`scenario-item` uses `display:grid; grid-template-columns:36px 1fr`. If `.scenario-tag` is a block element (`<div>`), it overflows the 36px column. **Fix**: use pure flex column layout for scenario-item instead, or make `.scenario-tag` an inline element (`<span>`). The recommended clean approach:

```css
.scenario-grid{display:flex;flex-direction:column;gap:8px}
.scenario-item{border:2px solid var(--line);background:#fff;overflow:hidden;box-shadow:4px 4px 0 rgba(10,10,10,.08)}
.scenario-tag{font-weight:900;font-size:11px;color:var(--red);padding:6px 10px 0;border-bottom:1px solid #eee;line-height:1.3}
.scenario-body{padding:6px 10px 10px}
```

## Session Log (2026-07-23)

- Card: `20260711-fresh-terminal-editor.html`
- Added sections 07-11 with `.scenario-grid` + `.arch-grid` + `.quick-cmd`
- Bug reproduced: code blocks truncated on mobile screenshot
- Fix: CSS grid definitions added + media query updated
- Commits: `e33afe7` (CSS grid definitions) → `d09a7ab` (media query + table overflow)
