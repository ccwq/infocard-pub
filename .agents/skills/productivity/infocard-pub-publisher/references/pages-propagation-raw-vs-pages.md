# Pages propagation: raw repo vs live site

This note captures a recurring publish verification pattern for `infocard-pub`.

## What happened in this session
- After `git push origin main`, the repository’s raw files updated first.
- `https://raw.githubusercontent.com/ccwq/infocard-pub/main/_index.yaml` reflected the new card.
- The live GitHub Pages URL (`https://ccwq.github.io/infocard-pub/_index.yaml`) continued to serve the older site for several minutes.
- Conclusion: **raw repo freshness does not prove Pages freshness**.

## Verification order
1. Verify the repo/raw source reflects the new slug.
2. Wait for Pages deployment/propagation.
3. Re-check the live Pages `_index.yaml` with a cache-busting query string.
4. Confirm the homepage search can find the card.

## Acceptance rule
- Do **not** report publish success until the live Pages URL shows the new card.
- If raw is updated but Pages is stale, report it as a **deployment delay**, not a failed publish.

## Practical checks
- Use `?cb=<timestamp>` on the Pages `_index.yaml` URL.
- Compare the top cards list, not just HTTP 200.
- Keep the worktree clean after push; a clean worktree does not imply Pages freshness.
