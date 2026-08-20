# infocard rebuild: hardblue from-scratch lesson (2026-07-08)

## What happened

File: `20260708-harness-self-improv.html`

First attempt: patched old HTML to add 3 new data blocks → introduced structural bugs (unclosed divs, orphan `</div>` inside `.risk`).

**Root cause:** The old layout used a non-theme CSS system (`.hero + .grid3 + .wide` hybrid) that wasn't the hardblue theme skeleton. Adding content to it meant patching inline styles on a broken structure.

Second attempt: complete rebuild from scratch using the full hardblue CSS skeleton from `theme/hardblue.html` → 10 sections with proper `.section-no` 96×96 numbered blocks, `.grid-3`, `.risk-grid`, `.grid-2`, `.quote-block`, table — all using the theme's CSS classes.

## The lesson

For **hardblue** theme rebuilds:
- Read `theme/hardblue.html` fully first (475 lines)
- Hardblue uses: `.hero` + `.hero-bar` (3-color left-red/middle-black/right-blue) + `.hero-copy` + `.hero-visual`
- Section structure: `.section > .section-head (.section-no [96×96 colored block] + .section-meta) + .grid-3|.grid-2|.matrix|.risk-grid`
- `.section-no`: red by default, `.b` = blue, `.k` = black (96×96 colored number block)
- `.risk`: use `data-accent="red|blue|dark"` for 8px top color bar
- `.footer-block`: closing block with `<h3>` + `<p>` body
- `.rule`: 3px black horizontal rule before footer

**Critical:** The hardblue CSS lives entirely in `<style>` — no external file needed. Copy the `:root` vars + all class definitions verbatim, then build the HTML using those classes.

## Darkblue vs Hardblue distinction

| | Darkblue | Hardblue |
|---|---|---|
| CSS vars | `--bg:#0c1020` etc (dark) | `--bg:#f6f4ef` etc (light paper) |
| Body bg | Radial gradient + dark | Grid paper pattern + radial color spots |
| Section no | Cyan label bar | 96×96 colored number block |
| Borders | `1px solid rgba(255,255,255,.12)` | `3px solid var(--line)` |
| Font | Light on dark | Dark on light |
| Default palette | cyan/blue/green/yellow/purple | red/blue/black |

Use the right theme skeleton depending on card category:
- **Darkblue**: AI tools, hot topics, live data, real-time dashboards, trend monitoring
- **Hardblue**: technical manuals, research deep-dives, architectural analysis, survey reports
