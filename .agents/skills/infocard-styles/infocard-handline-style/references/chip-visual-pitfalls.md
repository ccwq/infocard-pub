# Handline chip / label visual pitfalls

Session-derived rules for `tag-chip` / `label-chip` in handline infocards.

## Problem signature
- Users report: double border, inner shell, thick outline, or a fake drop-shadow / double-line at the lower-right corner.
- The issue often remains even after removing explicit `border`, `outline`, and `box-shadow` in CSS.

## Root causes to check first
1. `rough-box` / SVG path is drawing the border in multiple segments and the joins stack at corners.
2. The chip fill is too different from the paper background, creating an inner-shell illusion.
3. The stroke is too thick or too inset, so the line reads as a second frame rather than an outer boundary.
4. Rounded pill geometry exaggerates the “inner container” feeling.

## Preferred fix sequence
1. Remove all explicit inner-border CSS: `border`, `outline`, `box-shadow`.
2. Flatten chip geometry: prefer a restrained rectangle over a pill.
3. Blend chip fill into paper tone; avoid a separate colored block.
4. Rework rough borders into a single closed path, then expand the SVG/viewBox slightly so the stroke sits outside the content plane.
5. If the corner still looks doubled, reduce stroke thickness before adding more layout padding.

## What not to do
- Do not keep stacking extra CSS border layers to "clean up" the edge.
- Do not use a pale border color to fake softness on paper backgrounds.
- Do not assume the fix is in the chip CSS if the real issue is the rough border generator.

## Visual acceptance
- The chip should read as **one outer frame only**.
- No visible inner shell.
- No right-bottom double line.
- No independent color block inside the tag.
- If text vertical centering is slightly imperfect, that is lower priority than border cleanliness.
