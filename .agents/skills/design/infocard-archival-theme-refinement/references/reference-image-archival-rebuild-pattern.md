# Reference-image archival rebuild pattern

Session note: similarity-based reconstruction of a Swiss / archival infocard theme from a user-provided reference image.

## Rebuild rule
- Treat the reference image as the source of truth for typography, spacing rhythm, density, and accent hierarchy.
- Rebuild the theme from scratch; do not merely recolor an existing card.
- Preserve the reading structure first, then tune ornamentation.

## Practical token extraction
Focus on:
- font pairing and weight ladder
- spacing cadence between hero / source bar / table / notes / footer
- line density and column balance
- border weight and rule placement
- accent color restraint
- source-bar compression and metadata rhythm

## Review protocol
- If the user asks for image review, keep the round budget explicit and bounded.
- Respect the user’s max round count; do not continue polishing beyond it.
- After each round, isolate only the next concrete fix.

## Verification workflow
1. Build a local preview.
2. Inspect the rendered page on the same preview surface used for other infocards.
3. Compare the rendered hierarchy against the reference image.
4. If the layout looks close but not exact, adjust spacing and metadata density before changing colors.
5. If the page is visually correct but the preview tool stalls, use the alternate image-understanding fallback on the screenshot artifact rather than rewriting the theme blindly.

## Common pitfalls
- Recoloring an old card instead of rebuilding the skeleton.
- Making the source bar too verbose.
- Adding decorative elements that overpower the archive tone.
- Stopping after DOM correctness without a screenshot pass.
- Exceeding the agreed review budget after the user asked for a fixed number of rounds.

## Session-specific notes
- Preferred preview host: `10.6.8.14:5588`
- The reference-image workflow worked best when the source bar was tightened and the typography was kept sharply Swiss rather than ornamental.
- If the primary vision screenshot path is slow, use the saved screenshot as input to the alternate image-understanding tool.
