# GitHub repo refresh + teach + embedded-image evidence (2026-06-17)

Use this pattern when refreshing an existing infocard for a GitHub repo whose source has changed enough that the old card is materially incomplete.

## What changed in this session

- Repo: `mattpocock/skills`
- Public source URL: `https://github.com/mattpocock/skills`
- Existing card had the old 16-skill framing and missed the `teach` capability.
- The user-provided seven-stage image was not just style reference — it was **content evidence** and should be embedded in the card body.

## Refresh workflow

1. Capture the current repo state from a **real source**.
   - Prefer a shallow `git clone --depth 1` of the public repo when GitHub API recursion is rate-limited.
   - Read the top-level `README.md` and the skill files directly from the clone.
   - Extract current repo stats from the GitHub API only as supplementary metadata.
2. Identify newly important capabilities.
   - In this repo, `teach` is a first-class skill, not a side note.
   - If the README or skill tree introduces a new class of workflow, expand the card to cover it.
3. Treat attached user images as evidence.
   - If the user says the image should be included, localize it into `docs/assets/images/<slug>/` and embed it in the HTML content area.
   - Do not relabel it as “style reference”.
4. Rebuild the card as a content refresh, not a palette swap.
   - Keep the main process loop.
   - Add the new capability layers and the current repo skill matrix.
   - If needed, add a short report describing what was missing in the older card.
5. Verify before publish.
   - `npm run build`
   - `npm run verify`
   - mobile/CDP check for 390px no-overflow and font-size gate
   - public `HTTP 200`
   - image asset `HTTP 200`
   - homepage/_index search check
6. Sync the wiki when this is a high-value card.
   - Add a curated raw summary.
   - Add or update the concept page.
   - Commit/push the wiki changes.
   - Do not declare the infocard publish complete until wiki sync is done.

## Pitfalls

- GitHub API recursion may rate-limit on large repos. The fallback is a shallow git clone, not giving up.
- A public image asset can briefly 404 after push. Re-check after a short wait before treating it as failed.
- Reusing an old card without adding new repo capabilities (like `teach`) leaves the content stale even if the layout is correct.

## Evidence captured from this session

- The refreshed card title became `Matt Pocock Skills — AI 驱动开发七阶段 + Teach 学习工作区`.
- The repo snapshot showed `25` active skills across engineering, productivity, in-progress writing/review, personal, and misc.
- The teach workspace includes:
  - `MISSION.md`
  - `RESOURCES.md`
  - `lessons/*.html`
  - `reference/*.html`
  - `learning-records/*.md`
  - `NOTES.md`

## Related files

- `references/create-card-vs-publish-boundary.md`
- `references/github-contents-fallback-and-wiki-sync-note.md`
- `references/infocard-wiki-missing-backfill.md`
- `references/mobile-font-and-image-dom-audit.md`
