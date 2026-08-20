# 2026-06-02 SkillOpt rebuild and verification notes

## Context
A mobile regression on `docs/20260602-skillopt-cookbook.html` persisted after multiple local patches. The durable fix was not another button nudge, but a structural rebuild of the first fold.

## What worked
- Replaced the mobile `save` affordance from a fixed floating control to a normal bottom-of-page button.
- Reduced red emphasis and loosened spacing in the first fold and callouts.
- Converted dense 3-column table content into a stacked/mobile-readable layout.
- Rebuilt the first-fold meta area from a small set of similar cards into a 2x2 meta grid plus a dedicated summary strip.

## Verification pattern
- Keep the content invariant check explicit: compare visible text length before and after the rebuild.
- Verify at 390px viewport with browser rendering, then inspect screenshots with vision.
- Validate both local file URL and public Pages URL.
- Do not declare success until the public URL reflects the same mobile state as local.

## Practical lesson
If a page stays visually wrong after several narrow fixes, treat the structure as the problem and rebuild the affected section rather than layering more CSS patches on top of the old skeleton.