# Mobile save-button regression pattern

## Symptom
A high-density infocard looks fine on desktop but on mobile:
- the floating **Save PNG** button overlaps content, or
- a workaround adds a large right padding strip, making the page feel squeezed.

## Root cause
For long cards, a `position: fixed` CTA is the wrong primitive on mobile. Offsetting正文 with large `padding-right` only hides the overlap by shrinking the readable area.

## Correct fix
Prefer one of these mobile patterns:
1. Convert the CTA into a normal block button near the end of the page.
2. If a CTA must stay visible, keep the mobile area non-overlapping and verify there is no content squeeze.

## What to verify
Use both CSS/DOM and visual checks:
- `document.documentElement.clientWidth` matches the mobile viewport.
- `scrollWidth` does not exceed viewport width.
- `.save-btn` is not `position: fixed` on mobile.
- No visible right-side empty strip.
- No overlap between the CTA and正文 / closing content.

## Lessons from the SkillOpt case
- The failed fix was: `save-btn { bottom: 5.2rem }` plus large right padding on hero/section/closing.
- The successful fix was: `save-btn { position: static; display: block; width: calc(100% - ...); }` on mobile.
- The regression was caught with a 390px browser emulation + screenshot check, then revalidated on the public GitHub Pages URL.

## Reusable command
`python scripts/verify_mobile_infocard.py <path-or-url> --browser`

## Warning signs
- Any mobile rule that uses a big `padding-right` to make room for a fixed CTA.
- Any fix that changes one page visually but leaves the public URL on the old CSS version.
