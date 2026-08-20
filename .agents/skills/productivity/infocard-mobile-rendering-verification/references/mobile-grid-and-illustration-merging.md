# Mobile grid and illustration merging notes

## Why this exists
A published infocard can look correct in the source HTML but still fail in the browser session because injected CSS or browser extensions override the intended grid layout.

## Reproduction pattern
- Open a card that contains a 2-column `.grid2` block.
- Switch to a narrow mobile viewport (390px wide).
- Observe that the two columns may become uneven even when the source CSS says the columns should be equal.

## What happened in this session
- The computed widths were uneven even though the authored CSS used equal fractions.
- The browser session had an injected style that effectively overrode the intended grid template.

## Reliable fix
Apply the grid template inline on the wrapper and add `!important`:

```html
<div class="grid2" style="grid-template-columns: calc(50% - 4px) calc(50% - 4px) !important;">
```

## Verification steps
- Check computed styles, not only the source file.
- Confirm the columns are visually equal at 390px.
- Confirm `document.documentElement.scrollWidth` does not exceed the viewport.

## Illustration handling rule
If the source contains meaningful illustrations:
- download them locally;
- place them inside the card asset directory;
- embed them in the published card rather than dropping them;
- verify every image path after build/publish.

## Do not
- Do not assume desktop correctness implies mobile correctness.
- Do not rely on source CSS alone when browser-injected styles are present.
- Do not omit illustrations if they are part of the source’s meaning.