---
name: infocard-html-structure-debug
description: Fix missing </div> causing infocard mobile layout collapse.
---

# Infocard HTML Structure Debug

## Trigger — load this skill proactively

Load this skill **before** starting CSS debugging on a visual issue — do not wait for failure.
Hard threshold: **3 rounds of CSS fixes with no improvement** ⇒ stop CSS work, run this skill's diagnostic SOP first.

Symptoms that confirm an HTML structural fault (skip CSS entirely):
- `.footer` / `.save-row` computed width = 56px (numbered column width) despite `width:100%` CSS
- Element top > bodyHeight - viewportHeight (unreachable by scrolling)
- "Isolated number" in card grid (a `.card-num` on its own line with blank right side)
- Footer parent in DOM is `DIV.cards-grid` instead of `MAIN`
- Multiple `.cards-grid` siblings where parent of grid[N] is grid[N-1] instead of MAIN/poster-shell
- Repeated `</div></div>…</div>` clusters at end of file (12+ stacked) — almost always compensating for an unclosed container

## Hard rules (user-mandated 2026-07-28)

1. **NEVER launch a Chromium** via `chromium.launch({headless:true})` to validate. Use `chromium.connectOverCDP('http://localhost:9222')` only. If 9222 is not listening, restart the desktop Chrome Automation; do not install a parallel playwright Chromium. The Playwright `~/.cache/ms-playwright/chromium-*` binaries must remain deleted after use.
2. **Browser screenshot evidence is for self-audit only**. Do NOT auto-attach `MEDIA:xxx.png` to user replies — the user cannot view these until they ask. The user's preferred mobile-verification default: 5 screenshots via CDP, vision_analyze applied for self-check, no image attachment unless user requests it.
3. **REWRITE the broken section, do not patch**. Pull a known-good similar card from `infocard-pub/docs/` as template and rebuild the broken block from scratch, rather than iteratively inserting `</div>`. Each iteration risks new imbalance (verified case: 9 cumulative CSS/commit rounds wasted because iteration was preferred over rewrite).

## Root Cause

Missing `</div>` in source HTML causes browser auto-correction to nest elements inside wrong containers. CSS cannot override a parent that is itself inside a 56px grid.

## Diagnostic SOP

### Step 1: DOM parent check (Playwright — always run first)

```javascript
const result = await page.evaluate(() => {
  const checks = ['.footer', '.save-row', '.poster-note', '.risk-shell'];
  return checks.map(s => {
    const el = document.querySelector(s);
    if (!el) return {s, missing: true};
    let p = el; const path = [];
    while (p && p.tagName !== 'HTML') {
      path.push(p.tagName + '.' + (p.className?.split(' ')[0] || ''));
      p = p.parentElement;
    }
    return {s, w: Math.round(el.getBoundingClientRect().width), parents: path.slice(0,4)};
  });
});
// Target: all parents[1] = 'MAIN.' or 'DIV.poster-shell'
// If 'DIV.cards-grid' or 'DIV.skill-card' → HTML fault, stop CSS work
```

### Step 2: div balance count (Python — always run first)

```python
import re
content = open('card.html').read()
opens = len(re.findall(r'<div\b', content))
closes = len(re.findall(r'</div>', content))
print(f"opens={opens} closes={closes} diff={closes-opens}")
# diff != 0 → structural fault
```

### Step 3: cards-grid nesting check (Playwright)

```javascript
const grids = Array.from(document.querySelectorAll('.cards-grid'));
const bad = [];
grids.forEach((g, i) => {
  const p = g.parentElement;
  if (p.classList.contains('skill-card') || p.classList.contains('cards-grid')) bad.push(i);
});
if (bad.length) console.log('BAD grids:', bad);
```

## Fix Method

Python script — never use sed, never BeautifulSoup:

```python
import re
content = open('card.html').read()
lines = content.split('\n')
stack = []
output = list(lines)

for i, line in enumerate(lines, 1):
    s = line.strip()
    ind = len(line) - len(line.lstrip())

    if re.match(r'<div\b', s) and 'class=' in s:
        m = re.search(r'class="([^"]*)"', s)
        stack.append((i, ind, m.group(1) if m else ''))

    if s == '</div>':
        if stack:
            for j in range(len(stack)-1, -1, -1):
                if stack[j][1] <= ind:
                    stack.pop(j); break

    if s == '<div class="cards-grid">' and stack:
        for j in range(len(stack)-1, -1, -1):
            ln, ind2, cls2 = stack[j]
            if cls2 == 'cards-grid' and ind2 == ind:
                output.insert(i-1, '  </div>')
                stack.pop(j)
                print(f"Insert </div> before line {i} to close cards-grid from line {ln}")
                break

with open('card.html', 'w') as f:
    f.write('\n'.join(output))
```

## Rebuild integrity gate (when user requests rebuild or says content cannot be lost)

A structural rewrite is **not complete** merely because DOM and mobile layout are clean. Before replacing or publishing an existing card:

1. Snapshot the old card and sidecar metadata outside the worktree.
2. Build a content inventory: every section, subheading, table columns/rows, command, source/date, warning, and L1–L4 label.
3. Mark each old item `retain`, `remove`, or `supersede`. Any substantive `remove` / `supersede` needs an explicit reason and user approval.
4. Rebuild from a known-good theme skeleton, but migrate every `retain` item before calling it a rebuild.
5. For complex rescue work, split independent roles: content preservation inventory, frontend rebuild plan, acceptance audit. Coordinator does not self-certify.
6. Never call a skeleton, shortened card, or layout-only rewrite "rebuild complete" / "可验收".

## Verification Checklist (all must pass before push)

1. `div balance = 0` (opens == closes)
2. All critical elements: `parents[1]` = `MAIN.` or `DIV.poster-shell`
3. All `.cards-grid`: parent is NOT `skill-card` or `cards-grid`
4. Content-inventory coverage: every `retain` item is in the new card; each omission has approved reason
5. `npm run build`, `npm run verify`, `npm run verify-taxonomy`, and `npm run check-leak` pass
6. CDN sync (wait 50-55s); public URL returns 200 and contains expected new-content marker
7. Mobile screenshots 4-5 screens: footer/poster-note/save-row full-width, complete, no critical/major visual issue
8. Screenshots are self-audit by default; attach only when the user explicitly requests them

### Delegation, quota errors, and honest visual status

If an implementation or publishing delegate ends with a provider quota/API error, classify its state as `UNKNOWN_PARTIAL`: inspect its live transcript and actual Git/worktree/public state before continuing. Do not infer either success or failure from the error alone.

Keep these states distinct in user-facing closeout:
- `VISUAL_VERIFIED`: screenshots were successfully inspected with no blocking visual findings.
- `PUBLISHED_PENDING_VISUAL`: build, static, public HTTP and mobile DOM checks pass, but screenshot interpretation infrastructure failed after approved retries.
- `NOT_PUBLISHED`: no commit/push/public proof exists.

`scrollWidth <= viewport`, document-flow checks, and computed mobile grid rules are strong structural evidence, but never substitute for screenshot inspection or call them “视觉通过”. If a long delegated run terminates or stalls, report the error and next recovery action at once rather than waiting for the user to ask why there was no status.

- `.grid-3`, `.grid-2`, `.brands-grid` at `@media(max-width:720px)` need `grid-template-columns: 1fr !important` — without `!important` the desktop rule wins because specificity is identical and source-order tie-breaking doesn't apply across different `@media` blocks; always use `!important` in mobile overrides for grid classes

## Common Traps

- BeautifulSoup preserves source nesting — cannot fix browser mis-parsing
- sed global substitution breaks elsewhere — use Python line precision
- Multiple partial patches accumulate new imbalances (12 `</div>` stacked in one line)
- CSS `!important` powerless when parent width = 56px
- Browser renders malformed HTML but grid layout calculations collapse
- `<p class="card-desc">` containing a `<div>` auto-closes the `<p>` → never put `<div>` inside `<p>`
