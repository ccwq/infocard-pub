# X / tool-list commentary cards

This note captures the recurring pattern for publishing cards derived from X posts or GitHub/tool-list posts.

## Core rule
A tool-list card is not a directory page. It must function as a decision aid.

## Required expansion layers
For each tool, add a compact micro-brief with:
- original post position / relation to the source order
- what the tool is for
- why it matters or what problem it solves
- first thing to try
- boundary / limitation / trade-off

## Image mapping rule
If the source post includes images, preserve a stable image-to-item mapping:
- download external assets locally into `docs/assets/images/`
- reference them by relative paths in HTML
- keep the original image order unless the user explicitly requests a reorder
- if a user promotes one tool to the first slot, reflect that in both the visible order and the narrative lead

## Grouping rule
Long lists should be regrouped into 3–4 actionable stacks:
- discovery / exploration
- code / repo understanding
- automation / workflow
- generation / production

Do not leave the card as a flat list of names.

## Verification rule
After publish, verify both:
- the report/card bundle exists in the dated slug directory
- the public Pages URL renders the intended image-tool correspondence on the rendered page

## Common failure mode
A card can look complete as text but still fail if the visual ordering does not match the source post. Always check that the first items, image sequence, and headline claim all point to the same hierarchy.