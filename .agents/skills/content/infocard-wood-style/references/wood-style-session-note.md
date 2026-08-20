# wood-style session note

## Source image / design DNA
- Reference image: Simon Willison's "Agentic Engineering Patterns" infographic.
- Key cues: warm off-white paper, deep black typography/borders, muted blue link accent, brown hero quote block, black 4-step process bar, three-column dense editorial layout.
- Title treatment: classic serif headline + sans-serif body.
- Overall feeling: calm, authoritative, engineering-manual/editorial rather than poster-like.

## Implementation notes
- The theme should feel like a *paper editorial page*, not a literal wood texture.
- Keep blue accent subdued; avoid bright/cyan blue.
- Keep the brown banner as the main emotional anchor.
- Preserve 3-column density on desktop; collapse to single column on mobile.

## Verification
- Published preview path: `theme/wood.html`
- Registry updates required: `_themes.yaml` + `scripts/rebuild_themes.py` → `themes.html`
- Verified live after publish: `themes.html`, `theme/wood.html`, and homepage were HTTP 200 on GitHub Pages.
