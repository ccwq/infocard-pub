# Evidence-tiered public verification

Session lesson for dense fact-check / investigation infocards.

## What changed
- The card had to expose a **visible correction block** that separates:
  1. official direct matches,
  2. public aggregation-page reconstructions,
  3. mismatch / risk samples that need correction.
- For the Toyota cruise card, the visible correction text had to explicitly state that **11554353 should be treated as 2023 Corolla**, not Camry.
- Public identifiers should stay at the **公开层级** only: contact/owner layer if present, year/model, VIN prefix, crash/fire/injury status, dealer/manufacturer involvement. Do not reconstruct hidden personal identity from FOIA-redacted complaints.

## Verification pattern
1. Open the **published URL** with a cache-busting query string if the page may be stale.
2. Use **DOM text checks** to assert the exact correction phrases are present.
3. Use a **visual pass** to confirm the correction block is actually visible in the rendered page, not buried below the fold.
4. If the page is content-correct but visually stale, fix the published artifact or rebuild, then re-check the public URL.

## Pitfall
- A page can be “correct in HTML” but still fail user review if the correction language is not visible immediately or the source/title/source-label pair drifts.
- Do not merge evidence tiers into one undifferentiated sample list when the user asked for a verified, publicly defensible card.