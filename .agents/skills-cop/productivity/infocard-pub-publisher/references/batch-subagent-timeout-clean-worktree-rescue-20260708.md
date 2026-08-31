# Batch subagent timeout rescue via clean worktree (2026-07-08)

## When this pattern applies

Use this when a delegated infocard batch publish times out around 600s and the public URLs are still 404, but partial local artifacts may already exist.

Typical signals:
- background delegation returns `status=timeout`
- GitHub Pages URL for the expected slug is 404
- the main `infocard-pub` checkout is dirty from unrelated work, so you cannot safely rebase/pull there
- the subagent may have left usable HTML drafts outside the repo worktree (e.g. `/tmp/<slug>.html`)

## Recovery sequence

1. **Check the public URL first**
   - If HTTP 200, stop — the card is already live.
   - If HTTP 404, continue rescue.

2. **Check for stranded local artifacts outside the repo**
   - Search `/tmp` for `/<slug>.html` and related draft files.
   - Do not assume the repo worktree contains the draft; batch subagents may emit HTML into `/tmp` but never copy it into `docs/` before timing out.

3. **Avoid the dirty main checkout**
   - If the active repository root has unrelated modified files, do **not** reset/stash them just to publish a card.
   - Create a fresh worktree from `origin/main`, e.g.:
     ```bash
     git worktree add -B publish-batch-<date> /tmp/infocard-batch origin/main
     ```
   - Perform the rescue entirely inside that clean worktree.

4. **Reconstruct the card in the clean worktree**
   - Copy or rewrite the rescued draft into `docs/<slug>.html`.
   - Create `docs/<slug>.html.meta.yaml` with valid quoted `date` and `updated`.
   - Run `npm run build && npm run verify`.
   - Run `node scripts/verify-filter-index.js --slug <slug>` when available to confirm taxonomy/index filterability.

5. **Commit/push in one publish bundle**
   - Stage only: card HTML, meta, `_index.yaml`, `index.html`.
   - Commit and push from the clean worktree.

6. **Public verification**
   - Wait for Pages and confirm HTTP 200.
   - Verify required keywords in the live HTML.
   - Run a public 390px Playwright check: `scrollWidth == innerWidth`, save button visible, `html2canvas` present.

7. **Wiki sync after publish**
   - Write raw + concept/entity pages.
   - Update `index.md` and `log.md`.
   - Push wiki as a separate commit.

## Durable lesson

For timed-out delegated **batch** publishes, the valuable rescue pattern is:

**public check → inspect `/tmp` drafts → switch to clean worktree from `origin/main` → rebuild/push/verify → wiki sync**

Do not waste time re-dispatching the same subagent once drafts or enough repo facts already exist.
