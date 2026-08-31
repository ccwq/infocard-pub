# handline visual review rounds

Session note from the `wired-elements` rebuild of `theme/handline.html`.

## Trigger
Use this note when a hand-drawn / wired / sketch-style theme preview looks like a generic card with doodle borders instead of a coherent editorial system.

## What improved the result

### 1. Run **multi-round visual review**, not one pass
For theme previews and style-demo pages:
1. desktop screenshot review
2. mobile screenshot review at 390px width
3. compare against the reference image, not just against the local page itself
4. apply fixes
5. repeat desktop + mobile review
6. only then publish

A single pass tends to leave either:
- desktop alignment issues, or
- mobile "desktop shrink" artifacts

Recommended round structure:
- Round 1: skeleton alignment
- Round 2: density alignment
- Round 3: local language alignment (labels / visual rhythm / emphasis weight)

## Concrete tuning patterns that helped

### Reduce "template assembly" feel
- Lower `wired-card` shadow weight.
- Reduce dark block count.
- Avoid mixing too many strong borders with too many dark fills.
- Let spacing and hierarchy do more work than outlines.

### Make the page feel more editorial
- Use a real serif hero title.
- Add a clear top metadata bar.
- Use one strong comparison box rather than many loud callouts.
- Keep the process bar visually dense, but lighten later sections.

### Mobile anti-shrink fixes
- Increase page side gutters on mobile.
- Increase lead/body sizes in the mobile breakpoint.
- Reduce border thickness for nested cards.
- Convert heavy dark code/demo boxes to lighter paper blocks when they visually dominate.
- If a section looks like `card-in-card-in-card`, remove the innermost hand-drawn shell before shrinking text.

## Non-negotiable readability gate
If a live page triggers feedback like “文字根本看不见”, treat it as a hard failure, not a style preference.

Must-check zones:
- comparison box body text
- process-step description text
- top metadata / URL / helper labels
- chips / tags / small monospace labels
- any grey-on-paper explanatory copy

Recovery rule:
- patch the skill AND the live HTML together
- raise text contrast first
- then raise small-text size
- then reduce border/decoration dominance
- only after that fine-tune style mood

### Auto-dark-mode defense (new)
If the page contains dark accent blocks or heavy hand-drawn containers, explicitly defend against browser forced dark / auto color adjustment:
- set `color-scheme: light` on the root
- avoid relying on dark `wired` containers for the whole page skeleton
- prefer normal HTML/CSS + hand-drawn outline for deep dark emphasis areas

### Handline-specific caution with wired-elements
`wired-elements` helps establish the hand-drawn mood, but overuse makes the page feel like a component showcase.
Prefer:
- rough.js / hand-drawn SVG for skeletons, arrows, sticky outlines, and connectors
- `wired-card` only for major emphasis blocks when truly needed
- `wired-button` for export CTA
Avoid making every inner block a wired component.

## Final-pass checklist
- Desktop: hero right-side compare box aligns cleanly with lower columns.
- Desktop: quote banner is strong but not heavier than the process bar.
- Desktop: left/middle/right columns have similar visual weight.
- Mobile: no desktop shrink feeling.
- Mobile: paragraph text is comfortably readable.
- Mobile: borders do not overpower content.
- Mobile: long sections have enough breathing room.
