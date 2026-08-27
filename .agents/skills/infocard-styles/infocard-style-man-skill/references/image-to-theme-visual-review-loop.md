# Image-to-Theme Visual Review Loop

## When to Use

User provides a reference image (infographic, screenshot, design mockup) and asks to create a new infocard theme by replicating its fonts, spacing, colors, and premium feel.

This is the **reusable technique** for image-driven theme creation. Session-specific details (exact tokens, color values) go in the individual theme's own reference file.

## Workflow

### Step 1: Design Token Extraction (vision_analyze)

Call `vision_analyze` on the reference image with a structured prompt asking for:

- Exact color palette — background, text, accent, border, box colors (request hex estimates)
- Typography — font families (serif/sans-serif/monospace), font sizes per hierarchy level, font weights, letter-spacing, line-height
- Layout grid — column structure, gutters, padding/margins, section spacing
- Visual language — border styles, border radius (sharp or rounded), shadows, dividers, box treatments
- Specific design elements — how labels/badges are styled, dark block treatment, accent usage
- Overall mood and "premium" signals — what makes it feel high-end

**Key**: Ask for hex estimates explicitly. The vision model can give approximate hex values that are close enough to start building.

### Step 2: Build Theme File from Scratch

Create `theme/{slug}.html` from zero — do NOT copy an existing theme and swap colors. The user's definition of "重建" (rebuild) means building structure and CSS from scratch.

Structure the CSS with `:root` custom properties for all extracted tokens. Include:
- Full `:root` token block
- All component styles matching the reference design language
- Mobile responsive rules (720px breakpoint minimum)
- A complete demo page using real content (not placeholder text)

### Step 3: Prepare a local preview

Use the repository's existing preview entrypoint. This document does not prescribe a browser, port, CDP route, screenshot implementation, or delivery URL.

### Step 4: Visual Review Loop (up to N rounds)

User may specify the maximum number of review rounds (e.g., "at most 5 rounds"). Default is 3 if unspecified.

Each round:

1. **Render** the local theme preview through the project's approved visual-verification skill.
2. **Analyze** the rendered evidence with a structured prompt:
   - Ask specifically about fidelity to the reference (color accuracy, spacing, typography)
   - Ask for a numerical fidelity rating (1-10)
   - Ask for specific actionable changes
3. **Patch** only the highest-impact theme-specific fixes.
4. **Re-render** for the next round.

### Step 5: Register Theme

After visual review passes (typically 9.0+ fidelity):

1. Add the theme entry to `_themes.yaml` (slug, `css_class`, position and display metadata).
2. Run the repository's gallery rebuild command; do not hand-edit `themes.html`.
3. Hand off formal visual and delivery verification to the project's dedicated skills.

### Step 6: Update Memory

Update the Style governance memory entry to include the new theme name and its one-line positioning.

## Review Prompt Template

When calling `vision_analyze` on the screenshot, use this structure:

```
This is iteration N of the {theme-name} theme. Compare it critically to the design goal: {design goal}.

Specifically check:
1. Is the accent color accurate? (too saturated / too muted?)
2. Is the background warm/cool enough?
3. Is the spacing premium and breathable?
4. Any remaining visual bugs, misalignments, or issues?
5. Does the overall composition feel high-end?
6. Rate the fidelity on a scale of 1-10 and list remaining gaps.
```

## Common Adjustments by Round

These are generic review dimensions, not theme-specific prescriptions:

**Round 1 → Round 2 typical fixes:**
- Accent color saturation (usually needs desaturating)
- Background warmth (usually needs warming)
- Vertical spacing between major sections (usually needs increasing)
- Hero/headline font size (often needs slight reduction for "breathing room")
- Watermark position and opacity

**Round 2 → Round 3 typical fixes:**
- Table/list number alignment
- Vertical divider line weight
- Dark block color tone (shifting from pure black to tinted dark, e.g., dark charcoal-green)
- Fine typography alignment (header text-align)

**Round 3+**: Usually 9.5+ fidelity. Remaining items are subjective preferences, not defects.

## Session Examples

- 具体主题案例应放在对应的 `infocard-xxx-style/references/`，本公共文档不维护主题专属 token 或案例链接。
- Specific theme cases belong in the corresponding `infocard-xxx-style/references/`; this public document does not maintain theme-specific tokens or session records.

## Pitfalls

- **Don't trust the first color extraction blindly.** Vision model hex estimates are starting points, not exact values. Plan for color adjustment in round 1→2.
- **Don't skip the screenshot step.** Reading CSS in your head is not the same as seeing rendered output. The vision model catches spacing/alignment issues that code review misses.
- **Don't over-iterate.** If round 2 reaches 9.5+, remaining changes are subjective. Stop unless the user asks for more.
- **Don't forget themes.html registration.** Building the theme file is not enough; it must be registered in `_themes.yaml` and rebuilt via `scripts/rebuild_themes.py`.

### Platform chrome and cached evidence

Reference-image platform chrome, cached screenshots, and browser/CDP evidence handling belong to the project's visual-verification skills. This document only defines the design-to-review loop.

The reference image must be separated from platform chrome before extracting design tokens.

Do not treat a screenshot or model estimate as the sole source of truth for a rendered theme.

