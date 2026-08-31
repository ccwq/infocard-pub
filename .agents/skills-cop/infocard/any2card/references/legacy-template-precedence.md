# Legacy Template Precedence & Save-Button Recovery

## Trigger
Use this note when a published info card unexpectedly looks like the old generation style:
- `.wrap / .banner / .section / .footer` layout
- bottom footer save button
- `savePageAsPng()` attached to the footer instead of a floating action button

## Root cause pattern
This usually means the generation chain used a legacy visual template or hand-written HTML instead of the current any2card source of truth.

## Diagnosis
1. Inspect the rendered HTML source, not just the screenshot.
2. Look for legacy structure markers:
   - `.wrap`
   - `.banner`
   - `.section`
   - `.footer`
3. Check which skill/template actually generated the page.
4. If the page is live but still old-styled, treat it as a source-generation problem first, not a Pages/cache problem.

## Fix
- Regenerate from the current any2card template chain.
- If a wrapper skill is being used, make sure it delegates explicitly to any2card and does not carry a legacy footer-button template forward.
- Do not patch only the published HTML unless this is a one-off emergency; otherwise the next generation will regress.

## Verification
- The regenerated source should use the new unified save-button pattern.
- The public URL should match the regenerated source after deployment.
- If the old layout reappears, inspect skill selection / template precedence before blaming deployment.
