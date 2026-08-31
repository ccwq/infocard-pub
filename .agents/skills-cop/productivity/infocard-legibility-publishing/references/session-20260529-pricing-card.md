# Session note: pricing card visibility fix

## Situation
A published info card was technically correct, but the user said they could not see the newly added content.

## What happened
- The HTML contained the new sections and conclusions.
- Browser text/DOM checks confirmed the sections were present.
- Visual inspection showed the first fold was dominated by the title and table.
- The added summary content was effectively below the fold / easy to miss.

## Fix applied
- Added a short summary line directly into the headline area.
- Added a header kicker line with compressed conclusions:
  - MiniMax: subscription / quota hybrid
  - Qwen: API strategy visible, price table not stable enough to quote
  - ByteDance: model + input-length tiered billing
  - Kimi / GLM: public unit pricing, easiest for budgeting
- Verified again with a cache-busting URL.

## Lessons
- DOM presence is not enough for published cards; verify first-fold visibility.
- Dense tables can bury the latest update even when the page is correct.
- When the user says “I can’t see it,” treat it as a visual hierarchy problem before assuming a data problem.
- Cache-busting URLs are useful when the rendered page appears stale.
