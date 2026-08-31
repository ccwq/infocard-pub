# Blue Technical Manual Theme Migration Notes

This note captures a successful retheme of an existing infocard into `infocard-blue-technical-manual-style`.

## What had to change

A true migration was not a palette swap. The following layers all needed to move together:

- page background → cool paper / pale blue tint
- hero background → black + blue technical header
- section accents → blue dominance, red only for numbers/warnings
- pills / badges → blue system tokens
- quote blocks → blue-left-bar + soft blue fill
- route/outcome boxes → soft blue surfaces
- skill chips → blue tags
- footer → dark blue technical footer
- save button → blue gradient
- meta style → `blue-technical-manual`
- title / description → mention the blue manual theme explicitly

## Verification that mattered

- 390px viewport had no horizontal overflow
- minimum font size stayed at or above 11.2px
- the hero visually read as a technical manual first, not a warm poster
- embedded source image still loaded with `naturalWidth > 0`
- public `_index.yaml` reflected the updated style

## Practical rule

When converting an existing infocard into this style, update the *whole visual system* together. If only some blocks turn blue, the card still reads like a warm/redswiss card with a blue accent, not a blue technical manual.
