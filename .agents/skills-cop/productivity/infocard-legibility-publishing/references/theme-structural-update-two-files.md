# Theme structural update = two files always

When absorbing a header pattern from a card into a theme (e.g. updating `theme/redswiss.html` with a new topbar structure), **both files must be updated and committed together**:

1. The theme HTML (`theme/{name}.html`) — CSS + HTML structure
2. The theme demo page — must include a dedicated section demonstrating the new structure (e.g. a `★ NEW` section block)

## Why this matters

The demo page (`theme/{name}.html`) IS the documentation of the theme. If you update the CSS but not the demo, future agents open the demo page and see the old pattern — they will not know the new structure exists or how to use it. The theme file alone is not self-documenting.

## The failure mode

Updating only the theme HTML and pushing:
- Theme file: new CSS exists
- Demo page: shows old header structure
- A future agent sees the demo, copies the old HTML pattern, and overrides the new CSS

This is a silent regression — no error, no warning, just the new structure being ignored.

## The commit rule

```bash
# Always commit both files together
git add theme/{name}.html docs/fact-store.html   # or the corresponding demo card
git commit -m "style: absorb {card} header into {theme} header"
git push
```

## The demo page section pattern

When adding a new header structure to a theme demo, include a `★ NEW` section block:

```html
<div class="section" style="margin-bottom:14px">
  <div class="sec-head" style="background:var(--red)">
    <span class="num">★</span>
    <span class="label" style="color:#fff">NEW · DIAGONAL HERO · FACT_STORE STYLE</span>
  </div>
  <div class="sec-body">
    <h3>新的顶栏结构：diagonal hero + 右侧 meta pill 列</h3>
    <p>description of what changed</p>
    <!-- Old vs New comparison -->
    <!-- Key CSS snippet -->
    <!-- Mobile responsive note -->
  </div>
</div>
```

This makes the new structure self-evident without requiring the reader to parse raw CSS.

## Related

- `references/redswiss-header-absorption.md` — the CSS and structure of the diagonal hero absorbed from fact-store
- `infocard-pub-publisher` — always check `git status --short` before starting any card/theme work
