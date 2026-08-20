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

### Step 3: Start Local Preview Server

```bash
cd /home/ccwq/qbox/opendir/project/infocard-pub
npx live-server --port=5588 --host=0.0.0.0 --no-browser
```

Verify the server is listening:
```bash
ss -tlnp | grep 5588
```

### Step 4: Visual Review Loop (up to N rounds)

User may specify the maximum number of review rounds (e.g., "at most 5 rounds"). Default is 3 if unspecified.

Each round:

1. **Navigate**: `browser_navigate` to `http://10.6.8.14:5588/theme/{slug}.html`
2. **Screenshot**: `browser_vision` with a critical comparison question
3. **Analyze**: `vision_analyze` on the screenshot with a structured prompt:
   - Ask specifically about fidelity to the reference (color accuracy, spacing, typography)
   - Ask for a numerical fidelity rating (1-10)
   - Ask for specific actionable changes
4. **Patch**: Apply all identified fixes in a single batch of `patch` calls
5. **Re-screenshot**: Navigate again and take a new screenshot for the next round

### Step 5: Register Theme

After visual review passes (typically 9.0+ fidelity):

1. Add entry to `_themes.yaml` (slug, css_class, pill, position, title, subtitle, description, keywords, swatch, preview_url, ref_links, note)
2. Add TOC entry + theme card to `themes.html` (or run `python3 scripts/rebuild_themes.py` if available)
3. Verify in browser that the theme appears in the gallery

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

Based on sessions creating darkblue, graph-paper, and archive-green themes:

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

- **darkblue** (2026-06-12): Nezha dashboard image → deep blue glass-panel workbench. See `references/darkblue-style-creation-pattern.md` for extracted tokens.
- **archive-green** (2026-06-24): Obsidian AI Skills infographic → Swiss information layout with sage green accent. 3 rounds: 8.5→9.5→9.6. Key adjustments: green desaturated from `#4a7856` to `#5f7e62`, background warmed from `#f4f4f0` to `#f6f4ee`, dark blocks shifted from `#1a1a1a` to `#1d2520` (tinted charcoal-green).

## Pitfalls

- **Don't trust the first color extraction blindly.** Vision model hex estimates are starting points, not exact values. Plan for color adjustment in round 1→2.
- **Don't skip the screenshot step.** Reading CSS in your head is not the same as seeing rendered output. The vision model catches spacing/alignment issues that code review misses.
- **Don't over-iterate.** If round 2 reaches 9.5+, remaining changes are subjective. Stop unless the user asks for more.
- **Don't forget themes.html registration.** Building the theme file is not enough; it must be registered in `_themes.yaml` and rebuilt via `scripts/rebuild_themes.py`.

### ⚠️ Platform UI dark mode can deceive visual extraction

**Problem**: Reference images from Xiaohongshu (小红书) or Douyin display inside the platform's dark-mode UI chrome. The surrounding app shell is dark, but the **content card background itself** may be warm cream/paper — and the vision model may misinterpret the platform chrome as part of the content background.

**Symptom**: You extract what you think is a "dark background" from the image, but after implementation the background looks wrong compared to the reference.

**Correct verification**: After `vision_analyze` gives color estimates, use `curl` to fetch the raw HTML of the reference page (if it's a web page) or cross-check against known content card palettes. For 小红书 posts specifically, assume the background is warm/cream unless confirmed otherwise by page source.

**Correct verification chain** (always do in this order):
```
1. curl HTML → grep CSS token or background color  ← ground truth
2. screenshot → vision analysis                   ← only after step 1 passes
3. user browser sees wrong color → CDN cache issue → Ctrl+Shift+R
```

Never present a screenshot as evidence until step 1 confirms the CSS is correct. The vision model may be deceived by the platform chrome.
