# X status repo-mapping & publish verification

This note captures a reusable workflow for publishing repo/tech infocards sourced from an X status.

## What changed in practice

- X status pages often expose only partial or truncated text in oEmbed-style fetches.
- The safest extraction path is:
  1. open the live X status page in a browser
  2. read `document.body.innerText` / the rendered DOM for the post text
  3. use `browser_get_images()` to discover media URLs
  4. download the media locally before publishing
  5. analyze the local media with vision to identify project names, repo names, and visible captions
- If the image and text disagree, treat the visible image as a clue, not truth. Resolve the exact repo names with public GitHub pages and/or search before writing the card.

## Card-writing rules for this class of post

- Keep the title aligned to the post’s actual claim, not just the raw status slug.
- In the first fold, explain the structural takeaway:
  - what layer each repo fills
  - why the repos are complementary
  - what the practical order of adoption is
- When multiple repos are listed, map them to roles instead of repeating the names as a flat list.
- If a repo is only weakly evidenced by the source image, say so and avoid overstating certainty.

## Publish verification checklist

- `docs/<slug>.html` exists
- matching sidecar exists and has required fields
- the local asset is downloaded under `docs/assets/images/`
- raw GitHub HTML contains the new slug
- `_index.yaml` contains the slug/path pair
- the public detail page returns 200
- the public homepage/index contains the new card after JS renders
- git worktree is clean after commit/push

## Practical repo-name mapping tip

When the source text is unclear, use a descriptive GitHub search step to resolve exact owners/repo names before publishing. In the session that produced this note, the following mappings were verified from public GitHub pages:

- `hermeskill` → `theopitori/hermeskill`
- `hermes-proficiencies` → `sene1337/hermes-proficiencies`
- `Shadow CTO` → `pulkitgovrani/Shadow_CTO`
- `Hermes-Studio` → `JPeetz/Hermes-Studio`
- `mnemosyne` → `AxDSan/mnemosyne`

## Why this note exists

The failure mode to avoid is publishing a card that is visually plausible but semantically vague or source-misaligned. The durable fix is to anchor the post to the source status, map the repos into roles, and verify the published artifact end-to-end.