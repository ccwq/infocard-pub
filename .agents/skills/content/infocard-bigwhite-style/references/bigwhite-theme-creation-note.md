# BigWhite theme creation note — 2026-06-17

## Context

User provided two GLM-5.2 reference images and selected `C` for broad theme boundary: a general-purpose big-white business style, not only AI model release pages. User then asked to preview via LAN service and specifically corrected the workflow: **reference other existing `theme/*.html` files** rather than building an isolated one-off demo.

## Durable workflow

When creating or updating `infocard-bigwhite-style` in `infocard-pub`:

1. Inspect existing theme previews first:
   - `theme/hardblue.html`, `theme/wood.html`, `theme/darkgreen.html`, etc.
   - `_themes.yaml`
   - `scripts/rebuild_themes.py`
   - `themes.html`
2. Build the theme as part of the established theme system:
   - create/update `theme/bigwhite.html`
   - append a `bigwhite-style` entry to `_themes.yaml`
   - run `python3 scripts/rebuild_themes.py`
   - verify `themes.html` contains `infocard-bigwhite-style` and iframe `./theme/bigwhite.html`
3. If the user says “按推荐选择” after the A/B/C alignment, do the full recommended path:
   - component preview page
   - real demo card under `docs/`
   - `.meta.yaml`
   - skill update / reference note
   - build + verify
   - LAN preview links
4. Start/keep a LAN preview server on port `5588` from the repo root and return both direct theme and demo-card URLs.

## Visual extraction from reference images

Core tokens and rules:

- pure white main canvas
- extremely light gray outside background
- deep blue as the only strong accent (`#003399`)
- black hero titles
- large numeric hero blocks
- thin gray separators
- report/deck metadata line at top or footer
- ghost cards in very light gray
- sparse charts using blue tints rather than multiple strong colors

## Pitfalls

### Do not create an isolated demo only

The user explicitly asked to reference other theme HTML files. A correct theme update must integrate with the repo theme registry and preview system, not just produce `theme/bigwhite.html` in isolation.

### Do not accidentally replace adjacent theme entries

When patching `_themes.yaml`, avoid replacing the entire last existing theme block. Prefer appending the new entry after re-reading the surrounding lines. After patching, verify the previous last theme, such as `darkgreen-style`, still exists.

Verification snippets:

```bash
python3 scripts/rebuild_themes.py
python3 - <<'PY'
from pathlib import Path
text = Path('_themes.yaml').read_text()
assert 'darkgreen-style' in text
assert 'bigwhite-style' in text
html = Path('themes.html').read_text()
assert 'infocard-bigwhite-style' in html
assert './theme/bigwhite.html' in html
PY
```

### Keep the one-accent rule honest

A visual review caught that chart bars using orange/green contradicted the theme’s `1+1` rule. For BigWhite charts, use deep blue plus blue tints (`#4b73bd`, `#9db3dd`) unless the user explicitly wants multi-color business charts.

## Verification used in this session

- `python3 scripts/rebuild_themes.py` → `Written themes.html with 13 themes`
- `npm run build && npm run verify` → `[verify-index] OK: 262 cards`
- Browser DOM checks:
  - `theme/bigwhite.html` loads
  - `docs/20260617-bigwhite-style-demo.html` loads
  - `themes.html` contains `infocard-bigwhite-style`
  - homepage search for `BigWhite` finds the demo card
  - mobile width 390px had no horizontal overflow for demo and theme page
