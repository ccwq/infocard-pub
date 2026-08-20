# Border overlap: shell vs. content

## Session note

Observed failure mode: a card's internal frame bars / section borders visually merge with the outer shell border, causing the design language to collapse into a single heavy line.

## Root cause pattern

- Shell padding is too small, or a section is pulled outward with a negative margin.
- A content block's own border touches the shell border at the same visual edge.
- The problem reads as a layout regression, not a color issue.

## Fix order

1. Increase the shell's breathing room first.
2. Remove negative top/side margins that pull inner frames into the shell.
3. Recheck whether any inner border still touches the shell after spacing changes.
4. Only then decide whether the border weight or color also needs adjustment.

## Verification

- Inspect the rendered page, not just the HTML/CSS diff.
- Use a browser screenshot at the target viewport.
- If the outer shell and inner border still look fused, the fix is incomplete.

## Where this belongs

- Style governance: `infocard-style-man-skill`
- Render verification / publish regression triage: `infocard-pub-publisher`
