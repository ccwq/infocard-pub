# Technical-share first-fold tightening (GitHub / Skill cards)

Session pattern from the `Yao Expert Skill` tech-share card.

## Trigger
Use this when the card is a **GitHub repo / skill / tool technical-share page** and the first mobile fold (390×844) feels like a long article instead of a release card.

## Symptom
- Title is readable but too long, so it consumes too much hero height.
- Four key meta/stats blocks exist, but they sit below the hero image or below a long subtitle and do not fully enter the first fold.
- The page has no overflow bug, yet the first fold still feels weak because the most important facts are below the scroll line.

## Preferred fix order
1. **Shorten the hero title aggressively.**
   - Prefer a release-card title, not a report title.
   - Example transformation:
     - from: `把陌生行业快速拆成可学习、可复述、可导出的专家报告`
     - to: `陌生行业专家学习包`
2. **Compress the subtitle into one proposition sentence.**
   - Keep only what the thing is + what gets bundled.
   - Remove secondary explanation from the first fold.
3. **Move the 4 meta/stats blocks directly under the subtitle inside the hero text column.**
   - Do not leave them at the bottom of the whole hero container if that pushes them below the fold.
4. **Push the “一句话定位” card below the stats, not above them.**
   - The release-card first fold should read: title → proposition → 4 facts → one-line positioning.
5. **On mobile, reduce the visual image cost.**
   - Hide the hero image caption.
   - Crop the hero image to a fixed mobile height (for example ~184px) with `object-fit: cover`.
   - This keeps the image present without letting it dominate the fold.

## Verification target at 390×844
A good first fold for this class of card should show, in order:
- title
- one-sentence proposition
- all 4 meta/stats blocks
- at least the beginning of the positioning card

## Notes
- This is a **first-fold hierarchy** issue, not an overflow issue.
- If `scrollWidth == clientWidth` but the page still feels weak, do not chase overflow; restructure the hero.
- For GitHub/Skill cards, first-fold density is acceptable as long as the four facts are visible and readable.
