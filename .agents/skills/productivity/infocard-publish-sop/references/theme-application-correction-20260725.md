# Theme Application Correction — 2026-07-25

## Trigger

A tool/template card was initially labeled `redswiss` in `meta.yaml`, but its HTML used a generic red/black layout rather than the registered redswiss theme. A review correctly rejected the match and required immediate reconstruction.

## What went wrong

- The metadata field was treated as if it proved visual application.
- The card was authored from a generic recent-card scaffold instead of the target theme demo.
- “Open-source tool” was over-broadly mapped to redswiss. The content was a single tool/template introduction, not a multi-tool comparison.
- A later grep found that the Huawei card had hardblue-like tokens, but this is only a token-level check; full theme validation also needs structural signatures.

## Correct recovery

1. Remove/rebuild the card in an isolated worktree; do not merely rename `style`.
2. Read the registered theme demo (`theme/hardblue.html`) and its style skill before writing HTML.
3. Use the actual hardblue skeleton: warm paper + 42px grid, 3px black borders, red/blue/black accents, segmented `hero-bar`, hard-edged cards/shadows, numbered or equivalent modular sections, and mobile single-column collapse at 720px.
4. Set `meta.yaml.style` only if the implementation actually matches the target. For this class of card, include the hardblue style declaration and keep required metadata fields intact.
5. Run `npm run build`, `npm run verify`, `npm run verify-taxonomy`, and `npm run check-leak`.
6. After push, verify the public URL with HTTP 200 and fetch the deployed HTML to check theme signatures and content keywords. Then regenerate and commit `_index.yaml`/`index.html` if the build changed them.

## Acceptance checklist

- [ ] Theme skill loaded before authoring.
- [ ] Theme demo read before authoring.
- [ ] Metadata `style` matches actual HTML.
- [ ] `:root` tokens match the registered signature.
- [ ] At least two structural signatures present, not just colors.
- [ ] Mobile breakpoint and overflow rules present.
- [ ] Local build/verify gates pass.
- [ ] Public URL returns HTTP 200.
- [ ] Deployed HTML contains the theme signature and key content.

## Reusable distinction

- **redswiss**: red/black Swiss editorial style for tool catalogs, heavy CLI ecosystems, or multi-tool comparisons.
- **hardblue**: hard-edged blue/red/black manual style for a single technical tool, agent workflow, implementation guide, investigation, or structured technical breakdown.

When uncertain, inspect the content shape rather than the word “tool” in the title.
